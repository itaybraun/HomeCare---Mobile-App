import React from 'react';
import {View, Text, StyleSheet, FlatList, SectionList, TouchableOpacity, TouchableHighlight} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {strings} from '../../localization/strings';
import MenuButton from '../menu/MenuButton';
import {APIRequest} from '../../api/API';
import {
    appColors,
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
import {uses24HourClock} from "react-native-localize";
import {Flag} from '../../models/Flag';
import {Patient} from '../../models/Patient';

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
        flags: [],
        sortedFlags: [],
        index: 0,
        routes: [
            { key: 'tasks', title: strings.Work.tasks },
            { key: 'flags', title: strings.Work.flags },
        ],

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
        this.setState({...tasks, ...flags, loading: false});
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

            let sortedFlags = result.data.reduce((array, flag: Flag) => {
                let userArray = array.find(o => o.title === flag.patient.fullName);
                if (userArray)
                    userArray.data.push(flag);
                else {
                    array.push({
                        title: flag.patient.fullName,
                        data: [flag],
                    })
                }
                return array;
            }, []);

            return {flags: result.data, sortedFlags: sortedFlags};
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

    addFlag = async () => {
        // TODO
    };

    editFlag = async (flag: Flag) => {
        this.navigateTo('Flag', {
            patient: flag.patient,
            flag: flag,
            refresh: this.getData,
        });
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
                <Text>{strings.Work.noData}</Text>
            </View>
        )
    };

    // Tasks

    renderTask = ({item}) => {

        let task: Task = item;

        return (
            <TouchableOpacity style={styles.itemContainer}
                              onPress={() => this.selectTask(item)}>
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
                                                uses24HourClock() ? 'ddd, MMM-DD-YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A'
                                            ) +
                                            moment(item.visit.end).format(
                                                uses24HourClock() ? ' - HH:mm' : ' - hh:mm A'
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
                              ItemSeparatorComponent={() => renderSeparator()}
                              ListEmptyComponent={this.renderListEmpty}
                              ListHeaderComponent={this.renderListHeader}
                              ListFooterComponent={this.renderListFooter}
                              keyExtractor={item => item.id}
                              onRefresh={this.getData}
                              refreshing={false}
                    />
                </View>
                <View style={{ flexDirection: 'row', padding: 20, paddingTop: 10, alignItems: 'center', justifyContent: 'space-evenly'}}>
                    <Button block
                            style={{backgroundColor: '#EBC7F2', width: 140,}}
                            onPress={() => this.navigateTo('Calendar')}>
                        <NativeText style={{color: '#AB1FBD', fontWeight: 'bold'}}>{strings.Work.calendar?.toUpperCase()}</NativeText>
                    </Button>
                </View>
            </View>
        );
    };

    // Flags

    renderFlag = ({item}) => {
        const flag: Flag = item;
        return (
            <TouchableHighlight
                style={styles.itemContainer}
                underlayColor='#FFFFFFFF'
                activeOpacity={0.3}
                onPress={() => this.editFlag(flag)}>
                <Card style={[commonStyles.cardStyle, {backgroundColor: item.internal ? '#E8E16C' : '#FFFFFF'}]}>
                    <View style={styles.flagInfoContainer}>
                        <Text style={commonStyles.smallInfoText}>{item.startDate ? moment(item.startDate).format("MMM Do YYYY") : ''}</Text>
                        <Text style={commonStyles.smallInfoText}>{item.category}</Text>
                    </View>
                    <Text style={[commonStyles.boldTitleText, {marginVertical: 6}]}>{item.title}</Text>
                    <Text style={commonStyles.contentText}>{item.text}</Text>
                </Card>
            </TouchableHighlight>
        )
    };

    renderFlags = () => {

        return (
            <View style={commonStyles.screenContainer}>
                <View style={{flex: 1,}}>
                    <SectionList style={styles.list}
                                 keyExtractor={item => item.id}
                                 contentContainerStyle={{flexGrow: 1}}
                                 sections={this.state.sortedFlags}
                                 renderItem={this.renderFlag}
                                 stickySectionHeadersEnabled={true}
                                 ItemSeparatorComponent={() => renderSeparator({height: 0})}
                                 ListEmptyComponent={this.renderListEmpty}
                                 ListHeaderComponent={this.renderListHeader}
                                 ListFooterComponent={this.renderListFooter}
                                 renderSectionHeader={({section: {title}}) => (
                                     <View style={{
                                         backgroundColor: appColors.headerBackground,
                                         alignItems: 'center',
                                         padding: 10,
                                     }}>
                                        <Text style={{fontSize: 18, fontWeight: 'bold', color: appColors.headerFontColor}}>{title}</Text>
                                     </View>
                                 )}
                                 renderSectionFooter={() => renderSeparator({height: 12})}
                                 onRefresh={this.getData}
                                 refreshing={false}
                    />
                </View>
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
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },

    flagInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    itemContainer: {
        marginHorizontal: 12,
    },
});
