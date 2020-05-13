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
import {
    appColors,
    commonStyles,
    renderDisclosureIndicator,
    renderLoading, renderNavigationHeaderButton,
    renderSeparator,
    renderTabBar,
} from '../../support/CommonStyles';
import {Card, Icon, ActionSheet, Text as NativeText, Container} from 'native-base';
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
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorageConsts} from '../../support/Consts';
import {APIRequest} from '../../models/APIRequest';

export default class WorkScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Work.title,
            headerRight: () => {
                return (
                    <TouchableOpacity style={{padding: 12}} onPress={navigation.getParam('showMenu')}>
                        <Icon type="Entypo" name="dots-three-horizontal"
                              style={{fontSize: 22, color: appColors.headerFontColor}}/>
                    </TouchableOpacity>
                )
            }
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

    async componentDidMount(): void {
        super.componentDidMount();

        await this.setUpNotifications();

        this.getData();

        StatusBar.setBarStyle('light-content');
        if (Platform.OS === 'android')
            StatusBar.setBackgroundColor(appColors.mainColor);

        this.props.navigation.setParams({
            showMenu: this.showMenu,
        });

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
            let flags = result.data;
            //flags = flags.filter(flag => flag.status === 'active');
            flags = flags.sort((a: Task, b: Task) => {
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
    // Notifications
    //------------------------------------------------------------

    setUpNotifications = async () => {
        await messaging().requestPermission({
            announcement: true,
        });

        const enabled = await messaging().hasPermission();
        if (enabled) {

            this.setState({loading: true});

            let savedToken = await AsyncStorage.getItem(AsyncStorageConsts.FCM_TOKEN);
            const firebaseToken = await messaging().getToken();

            if (firebaseToken) {
                if (!savedToken) {
                    await this.api.setPushNotificationsToken(firebaseToken, null);
                    await AsyncStorage.setItem(AsyncStorageConsts.FCM_TOKEN, firebaseToken);
                } else if (savedToken !== firebaseToken) {
                    await this.api.setPushNotificationsToken(firebaseToken, savedToken);
                    await AsyncStorage.setItem(AsyncStorageConsts.FCM_TOKEN, firebaseToken);
                }
            }
            this.setState({loading: false});
        } else {
            console.log('Notifications disabled');
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    showMenu = () => {

        let options = [
            ... this.state.index === 2 ?
                [strings.Flag.menuCreate] :
                [strings.Task.menuCreate],
            strings.Common.cancelButton
        ];

        ActionSheet.show({
                options: options,
                cancelButtonIndex: options.length - 1,
            },
            (buttonIndex) => {
                let button = options[buttonIndex];
                switch (button) {
                    case strings.Task.menuCreate:
                        this.createTask();
                        break;
                    case strings.Flag.menuCreate:
                        this.createFlag();
                        break;
                }

            });
    };

    createTask = () => {
        this.navigateTo('NewTask', {patient: null, refresh: () => {
                this.getData();
            }
        });
    };

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

    createFlag = () => {
        this.navigateTo('NewFlag', {
            patient: null,
            refresh: async () => {
                let flags = await this.getFlags();
                this.setState({...flags});
            }
        });
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
                    onIndexChange={(index) => this.setState({ index })}
                    renderScene={this.renderScene}
                    renderTabBar={(props) =>
                        renderTabBar(props, this.state.index, (index) => this.setState({index: index}))}
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
