import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    SectionList,
    TouchableOpacity,
    TouchableHighlight,
    StatusBar, Platform, TextInput,
} from 'react-native';
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
import CalendarView from './calendar/CalendarView';
import TaskRenderer from '../tasks/TaskRenderer';
import {Status, Task} from '../../models/Task';
import {uses24HourClock} from "react-native-localize";
import {Flag} from '../../models/Flag';
import {Patient} from '../../models/Patient';
import {Visit} from '../../models/Visit';
import FlagRenderer from '../patients/patient/flags/FlagRenderer';

export default class WorkScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Work.title,
            // headerLeft: () =>
            //     <MenuButton />
            // ,
        }
    };

    state = {
        loading: false,
        tasks: [],
        sortedTasks: [],
        taskFilterInputText: null,
        flagFilterInputText: null,
        filteredTasks: null,
        filteredFlags: null,
        visits: [],
        flags: [],
        sortedFlags: [],
        index: 0,
        routes: [
            { key: 'tasks', title: strings.Work.tasks },
            { key: 'calendar', title: strings.Work.calendar },
            { key: 'flags', title: strings.Work.alerts },
        ],

    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();

        StatusBar.setBarStyle('light-content');
        if (Platform.OS === 'android')
            StatusBar.setBackgroundColor(appColors.mainColor);

        this.eventEmitter.on('reloadTasks', async () => {
            const tasks = await this.getTasks();
            this.setState({...tasks});
        });
    }

    componentWillUnmount(): void {
        this.eventEmitter.removeListener('reloadTasks');
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        this.setState({loading: true});
        const tasks = await this.getTasks(refresh);
        const visits = await this.getVisits();
        const flags = await this.getFlags(refresh);
        this.setState({...tasks, ...visits, ...flags, loading: false});
    };

    getTasks = async (refresh = true) => {
        let result: APIRequest = await this.api.getTasks(null, [Status.ACTIVE]);
        if (result.success) {
            let tasks = result.data.sort((a: Task, b: Task) => {
                return ('' + a.patient.fullName).localeCompare(b.patient.fullName);
            });
            let sortedTasks = this.getSortedTasks(tasks);
            let filteredTasks = this.state.taskFilterInputText ?
                this.getFilteredTasks(tasks, this.state.taskFilterInputText) : null;

            return {tasks: tasks, sortedTasks: sortedTasks, filteredTasks: filteredTasks};
        } else {
            this.showError(result.data);
        }
    };

    getVisits = async () => {
        let result: APIRequest = await this.api.getVisits();
        if (result.success) {
            let visits = result.data;
            return {visits: visits};
        } else {
            this.showError(result.data);
            return {visits: []};
        }
    };

    getFlags = async (refresh = true) => {
        let result: APIRequest = await this.api.getFlags();
        if (result.success) {
            let flags = result.data.sort((a: Task, b: Task) => {
                return ('' + a.patient.fullName).localeCompare(b.patient.fullName);
            });
            let sortedFlags = this.getSortedTasks(flags);

            let filteredFlags = this.state.flagFilterInputText ?
                this.getFilteredFlags(flags, this.state.taskFilterInputText) : null;

            return {flags: flags, sortedFlags: sortedFlags, filteredFlags: filteredFlags};
        } else {
            this.showError(result.data);
        }
    };

    getSortedTasks = (tasks) => {
        return tasks.reduce((array, task: Task) => {
            let userArray = array.find(o => o.title === task.patient.fullName);
            if (userArray)
                userArray.data.push(task);
            else {
                array.push({
                    title: task.patient.fullName,
                    data: [task],
                })
            }
            return array;
        }, []);
    };

    getSortedFlags = (flags) => {
        return flags.reduce((array, flag: Flag) => {
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
    };

    getFilteredTasks = (tasks, text) => {
        text = text.toLowerCase();
        const filteredTasks = tasks.filter(task => task.text.toLowerCase().indexOf(text) > -1);
        return this.getSortedTasks(filteredTasks);
    };

    getFilteredFlags = (flags, text) => {
        text = text.toLowerCase();
        const filteredFlags = flags.filter(flag => flag.text.toLowerCase().indexOf(text) > -1);
        return this.getSortedFlags(filteredFlags);
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

    selectVisit = (visit) => {
        this.navigateTo('Visit', {
            visit: visit,
            refresh: this.getData,
        });
    };

    addTask = () => {

    };

    addFlag = async () => {
        // TODO
    };

    selectFlag = (flag: Flag) => {
        this.navigateTo('Flag', {
            patient: flag.patient,
            flag: flag,
            refresh: async () => {
                const flags = await this.getFlags();
                this.setState({
                    ...flags,
                });
            },
        });
    };

    handleTabIndexChange = index => {
        this.setState({ index });
    };

    filterTasks = (text) => {
        this.setState({
            taskFilterInputText: text.isEmpty() ? null : text,
            filteredTasks: text.isEmpty() ? null : this.getFilteredTasks(this.state.tasks, text)
        });
    };

    filterFlags = (text) => {
        this.setState({
            flagFilterInputText: text.isEmpty() ? null : text,
            filteredFlags: text.isEmpty() ? null : this.getFilteredFlags(this.state.flags, text)
        });
    }

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
            case 'calendar':
                return this.renderCalendar();
            case 'flags':
                return this.renderFlags();
            default:
                return null;
        }

    };

    //List

    renderListHeader = () => {
        return (
            <View style={{height: 0}} />
        );
    };

    renderTasksHeader = () => {
        return (
            <View style={{margin: 10}}>
                <TextInput ref={ref => this.taskFilterInput = ref}
                           style={commonStyles.input}
                           returnKeyType="search"
                           autoCorrect={false}
                           value={this.state.taskFilterInputText}
                           autoCapitalize='none'
                           placeholderTextColor="#CCCCCC"
                           placeholder={strings.Work.filter}
                           enablesReturnKeyAutomatically={true}
                           paddingRight={12}
                           paddingLeft={12}
                           onChangeText={this.filterTasks}
                />
                {
                    this.state.filteredTasks &&
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            right: 5,
                            width: 20,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={() => {
                            this.taskFilterInput.clear();
                            this.filterTasks('');
                        }
                        }>
                        <Icon type='AntDesign' name='closecircle' style={{fontSize: 16, color: '#0000004D'}}/>
                    </TouchableOpacity>
                }
            </View>
        );
    };

    renderFlagsHeader = () => {
        return (
            <View style={{margin: 10}}>
                <TextInput ref={ref => this.flagFilterInput = ref}
                           style={commonStyles.input}
                           returnKeyType="search"
                           autoCorrect={false}
                           value={this.state.flagFilterInputText}
                           autoCapitalize='none'
                           placeholderTextColor="#CCCCCC"
                           placeholder={strings.Work.filter}
                           enablesReturnKeyAutomatically={true}
                           paddingRight={12}
                           paddingLeft={12}
                           onChangeText={this.filterFlags}
                />
                {
                    this.state.filteredFlags &&
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            right: 5,
                            width: 20,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={() => {
                            this.flagFilterInput.clear();
                            this.filterFlags('');
                        }
                        }>
                        <Icon type='AntDesign' name='closecircle' style={{fontSize: 16, color: '#0000004D'}}/>
                    </TouchableOpacity>
                }
            </View>
        );
    };

    renderListFooter = () => {
        return (
            <View style={{height: 0}} />
        );
    };

    renderListEmpty = () => {
        return (
            <View style={commonStyles.emptyScreen}>
                <Text style={commonStyles.smallContentText}>{strings.Work.noData}</Text>
            </View>
        )
    };

    // Calendar

    renderCalendar = () => {
        return (
            <CalendarView
                visits={this.state.visits}
                selectVisit={this.selectVisit}
                additionalData={this.settings.qaMode}
            />
        )
    };

    // Tasks

    renderTask = ({item}) => {

        let task: Task = item;

        return (
            <TaskRenderer task={task} selectTask={this.selectTask} />
        )
    };

    renderTasks = () => {

        const tasks = this.state.filteredTasks || this.state.sortedTasks;

        return (
            <View style={commonStyles.screenContainer}>
                <View style={{flex: 1,}}>
                    <SectionList style={styles.list}
                                 keyExtractor={item => item.id}
                                 contentContainerStyle={{flexGrow: 1}}
                                 sections={tasks}
                                 renderItem={this.renderTask}
                                 stickySectionHeadersEnabled={true}
                                 ItemSeparatorComponent={() => renderSeparator()}
                                 ListEmptyComponent={this.renderListEmpty}
                                 ListHeaderComponent={this.renderTasksHeader}
                                 ListFooterComponent={this.renderListFooter}
                                 renderSectionHeader={({section: {title}}) => (
                                     <View style={{
                                         backgroundColor: '#FFFFFF',
                                         padding: 10,
                                     }}>
                                         <Text style={[commonStyles.medium, {fontSize: 16, color: appColors.mainColor}]}>{title}</Text>
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

    // Flags

    renderFlag = ({item}) => {
        const flag: Flag = item;
        return (
            <FlagRenderer flag={flag} selectFlag={this.selectFlag} />
        );
    };

    renderFlags = () => {

        const flags = this.state.filteredFlags || this.state.sortedFlags;

        return (
            <View style={commonStyles.screenContainer}>
                <View style={{flex: 1,}}>
                    <SectionList style={styles.list}
                                 keyExtractor={item => item.id}
                                 contentContainerStyle={{flexGrow: 1}}
                                 sections={flags}
                                 renderItem={this.renderFlag}
                                 stickySectionHeadersEnabled={true}
                                 ItemSeparatorComponent={() => renderSeparator()}
                                 ListEmptyComponent={this.renderListEmpty}
                                 ListHeaderComponent={this.renderFlagsHeader}
                                 ListFooterComponent={this.renderListFooter}
                                 renderSectionHeader={({section: {title}}) => (
                                     <View style={{
                                         backgroundColor: '#FFFFFF',
                                         padding: 10,
                                     }}>
                                         <Text style={[commonStyles.medium, {fontSize: 16, color: appColors.mainColor}]}>{title}</Text>
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
});
