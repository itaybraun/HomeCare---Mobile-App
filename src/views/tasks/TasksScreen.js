import React from 'react';
import {View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {strings} from '../../localization/strings';
import MenuButton from '../menu/MenuButton';
import {APIRequest} from '../../api/API';
import {
    commonStyles,
    renderDisclosureIndicator,
    renderLoading,
    renderSeparator,
    renderTabBar,
} from '../../support/CommonStyles';
import {Card, Icon} from 'native-base';
import moment from 'moment';
import {TabView} from 'react-native-tab-view';

export default class TasksScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Tasks.title,
            headerLeft: () =>
                <MenuButton />
            ,
        }
    };

    state = {
        loading: false,
        tasks: [],

        index: 0,
        routes: [
            { key: 'open', title: strings.Tasks.open },
            { key: 'visits', title: strings.Tasks.visits },
            { key: 'closed', title: strings.Tasks.closed },
        ],
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        this.setState({loading: true});
        const tasks = await this.getTasks(refresh);
        this.setState({...tasks, loading: false});
    };

    getTasks = async (refresh = true) => {
        let result: APIRequest = await this.api.getTasks();
        if (result.success) {
            return {tasks: result.data};
        } else {
            this.showError(result.data);
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    selectTask = (task) => {
        this.navigateTo('Task', {task: task});
    };

    addTask = async () => {
        this.navigateTo('Task', {task: null});
    };

    handleTabIndexChange = index => {
        this.setState({ index });
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    // Tabs

    renderTabBar = (props) => {
        return renderTabBar(props, this.state.index);
    };

    renderScene = ({ route }) => {
        return this.renderList();
    };


    //List

    renderListHeader = () => {
        return (
            <View style={{height: 12}} />
        );
    };

    renderListFooter = () => {
        return (
            <View style={{height: 74}} />
        );
    };

    renderListEmpty = () => {
        return (
            <View style={commonStyles.emptyScreen}>
                <Text>{strings.Tasks.noTasks}</Text>
            </View>
        )
    };

    renderItem = ({item}) => {
        return (
            <TouchableOpacity onPress={() => this.selectTask(item)}>
                <Card style={[styles.patientItemContainer, item.isPriorityImportant ? {backgroundColor: '#F9E3E6'} : {}]}>
                    <View style={{flex: 1, margin: 8,}}>
                        <Text
                            style={commonStyles.yellowTitle}
                            numberOfLines={3}>
                            {item.text}
                        </Text>
                        <Text style={[commonStyles.contentText, {paddingTop: 8,}]}>{item.patientInfo}</Text>
                        <Text style={[commonStyles.contentText, {paddingTop: 8, color: '#FF0000'}]}>{strings.Tasks.noSchedule}</Text>
                    </View>

                    <Text style={[commonStyles.smallInfoText, {position: 'absolute', top: 6, right: 6}]}>
                        {item.openDate ? moment(item.openDate).format("MMM-DD-YYYY") : ''}
                    </Text>
                </Card>
            </TouchableOpacity>
        )
    };

    renderList = () => {

        const tasks = this.state.tasks;

        return (
            <View style={commonStyles.screenContainer}>
                <FlatList style={styles.list}
                          contentContainerStyle={{ flexGrow: 1 }}
                          data={tasks}
                          renderItem={this.renderItem}
                          ItemSeparatorComponent={renderSeparator}
                          ListEmptyComponent={this.renderListEmpty}
                          ListHeaderComponent={this.renderListHeader}
                          ListFooterComponent={this.renderListFooter}
                          keyExtractor={item => item.id}
                          onRefresh={this.getData}
                          refreshing={false}
                />
                <TouchableOpacity
                    style={commonStyles.blackButtonContainer}
                    onPress={this.addTask}
                >
                    <Icon type="Feather" name="plus" style={{fontSize: 36, color: '#FFFFFF', paddingTop: 4}}/>
                </TouchableOpacity>
                {renderLoading(this.state.loading)}
            </View>
        );
    };

    render() {
        return (
            <View style={commonStyles.screenContainer}>
                <TabView
                    navigationState={this.state}
                    onIndexChange={this.handleTabIndexChange}
                    renderScene={this.renderScene}
                    renderTabBar={this.renderTabBar}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
        padding: 10,
    },

    patientItemContainer: {
        padding: 6,
        borderRadius: 4,
        overflow: 'hidden',
    },
});
