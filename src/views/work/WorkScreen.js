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
        filteredTasks: null,
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
                this.getFilteredTasks(this.state.tasks, this.state.taskFilterInputText) : null;

            return {tasks: result.data, sortedTasks: sortedTasks, filteredTasks: filteredTasks};
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

    getFilteredTasks = (tasks, text) => {
        text = text.toLowerCase();
        const filteredTasks = tasks.filter(task => task.text.toLowerCase().indexOf(text) > -1);
        return this.getSortedTasks(filteredTasks);
    }

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

    editFlag = async (flag: Flag) => {
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

        const data = this.state.filteredTasks || this.state.sortedTasks;

        return (
            <View style={commonStyles.screenContainer}>
                <View style={{flex: 1,}}>
                    <SectionList style={styles.list}
                                 keyExtractor={item => item.id}
                                 contentContainerStyle={{flexGrow: 1}}
                                 sections={data}
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
            <TouchableHighlight
                style={commonStyles.listItemContainer}
                underlayColor='#FFFFFFFF'
                activeOpacity={0.3}
                onPress={() => this.editFlag(flag)}>
                <Card style={[commonStyles.cardStyle, {backgroundColor: flag.internal ? '#E8E16C' : '#FFFFFF'}]}>
                    <View style={styles.flagInfoContainer}>
                        <Text style={commonStyles.smallInfoText}>{flag.startDate ? moment(flag.startDate).format("MMM Do YYYY") : ''}</Text>
                        <Text style={commonStyles.smallInfoText}>{flag.category}</Text>
                    </View>
                    <Text style={[commonStyles.contentText, {marginTop: 10}]}>{flag.text}</Text>
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
                                 ItemSeparatorComponent={() => renderSeparator()}
                                 ListEmptyComponent={this.renderListEmpty}
                                 ListHeaderComponent={this.renderListHeader}
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
