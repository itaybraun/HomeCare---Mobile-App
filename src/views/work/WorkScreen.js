import React from 'react';
import {View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {strings} from '../../localization/strings';
import MenuButton from '../menu/MenuButton';
import {APIRequest} from '../../api/API';
import {
    commonStyles,
    renderDisclosureIndicator,
    renderLoading, renderNavigationHeaderButton,
    renderSeparator,
    renderTabBar,
} from '../../support/CommonStyles';
import {Card, Icon, Button, Text as NativeText, Container} from 'native-base';
import moment from 'moment';
import {TabView} from 'react-native-tab-view';
import {Task} from '../../models/Task';
import * as RNLocalize from "react-native-localize";

export default class WorkScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Work.title,
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
            { key: 'tasks', title: strings.Work.tasks },
            { key: 'flags', title: strings.Work.flags },
        ],
        is24Hour: false,
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();

        this.props.navigation.setParams({ showFilter: this.showFilter });
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        this.setState({loading: true});
        const tasks = await this.getTasks(refresh);
        const flags = await this.getFlags(refresh);
        const is24Hour = RNLocalize.uses24HourClock();
        this.setState({...tasks, ...flags, is24Hour: is24Hour, loading: false});
    };

    getTasks = async (refresh = true) => {
        let result: APIRequest = await this.api.getTasks();
        if (result.success) {
            return {tasks: result.data};
        } else {
            this.showError(result.data);
        }
    };

    getFlags = async (refresh = true) => {
        let result: APIRequest = await this.api.getFlags();
        if (result.success) {
            return {flags: result.data};
        } else {
            this.showError(result.data);
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    selectTask = (task) => {
        this.navigateTo('Task', {
            task: task,
            refresh: this.getData,
        });
    };

    addTask = () => {

    };

    handleTabIndexChange = index => {
        this.setState({ index });
    };
    
    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    // Tabs

    renderTabBar = (props) => {
        return renderTabBar(props, this.state.index, (index) => this.setState({index: index}));
    };

    renderScene = ({ route }) => {
        switch (route.key) {
            case 'tasks':
                return this.renderTasks();
            case 'flags':
                return this.renderFlags();
            default:
                return null;
        }

    };

    //List

    renderListHeader = () => {
        return (
            <View style={{height: 12}} />
        );
    };

    renderListFooter = () => {
        return (
            <View style={{height: 12}} />
        );
    };

    renderListEmpty = () => {
        return (
            <View style={commonStyles.emptyScreen}>
                <Text>{strings.Tasks.noTasks}</Text>
            </View>
        )
    };

    renderTask = ({item}) => {

        let task: Task = item;

        return (
            <TouchableOpacity onPress={() => this.selectTask(item)}>
                <Card style={[commonStyles.cardStyle, item.isPriorityImportant ? {backgroundColor: '#F9E3E6'} : {}]}>
                    <Text style={[commonStyles.titleText]}>{task.patient?.fullName}</Text>
                    <View style={{flex: 1,}}>
                        <Text
                            style={[commonStyles.yellowTitle, {paddingVertical: 10}]}
                            numberOfLines={2}>
                            {item.text}
                        </Text>
                        {
                            item.visit ?
                                <Text style={[commonStyles.contentText]}>
                                    {
                                        item.visit && item.visit.start && item.visit.end ?
                                            moment(item.visit.start).format(
                                                this.state.is24Hour ? 'ddd, MMM-DD-YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A'
                                            ) +
                                            moment(item.visit.end).format(
                                                this.state.is24Hour ? ' - HH:mm' : ' - hh:mm A'
                                            )

                                            : ''
                                    }
                                </Text>
                                :
                                <Text style={[commonStyles.contentText, {color: '#FF0000'}]}>{strings.Tasks.noSchedule}</Text>
                        }

                    </View>
                </Card>
            </TouchableOpacity>
        )
    };

    renderTasks = () => {

        const tasks = this.state.tasks;

        return (
            <View style={commonStyles.screenContainer}>
                <View style={{flex: 1,}}>
                    <FlatList style={styles.list}
                              contentContainerStyle={{ flexGrow: 1 }}
                              data={tasks}
                              renderItem={this.renderTask}
                              ItemSeparatorComponent={renderSeparator}
                              ListEmptyComponent={this.renderListEmpty}
                              ListHeaderComponent={this.renderListHeader}
                              ListFooterComponent={this.renderListFooter}
                              keyExtractor={item => item.id}
                              onRefresh={this.getData}
                              refreshing={false}
                    />
                    {renderLoading(this.state.loading)}
                </View>
                <View style={{ flexDirection: 'row', padding: 10, alignItems: 'center'}}>
                    <View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-evenly'}}>
                        <Button block
                            style={{backgroundColor: '#CCF4C9', width: 120,}}
                            onPress={this.navigateTo('Map')}>
                            <NativeText style={{color: '#32C02B', fontWeight: 'bold'}}>{strings.Work.map?.toUpperCase()}</NativeText>
                        </Button>
                        <Button block
                                style={{backgroundColor: '#EBC7F2', width: 120,}}
                                onPress={this.navigateTo('Calendar')}>
                            <NativeText style={{color: '#AB1FBD', fontWeight: 'bold'}}>{strings.Work.calendar?.toUpperCase()}</NativeText>
                        </Button>
                    </View>
                    <TouchableOpacity
                        style={commonStyles.blackButtonContainer}
                        onPress={this.addTask}
                    >
                        <Icon type="Feather" name="plus" style={{fontSize: 36, color: '#FFFFFF', paddingTop: 4}}/>
                    </TouchableOpacity>
                </View>


            </View>
        );
    };

    renderFlags = () => {
        return (
            <View style={commonStyles.screenContainer}>
                <Text>Flags</Text>
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
});
