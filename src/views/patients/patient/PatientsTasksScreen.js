import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Text,
    Image,
    TouchableHighlight,
    SectionList,
} from 'react-native';
import AppScreen from '../../../support/AppScreen';
import {
    appColors,
    commonStyles,
    renderLoading,
    renderSeparator,
    renderTabBar,
    renderWhiteTabBar,
} from '../../../support/CommonStyles';
import {strings} from '../../../localization/strings';
import {APIRequest} from '../../../api/API';
import {Status, Task} from '../../../models/Task';
import {Patient} from '../../../models/Patient';
import {SwipeListView} from 'react-native-swipe-list-view';
import {ActionSheet, Icon} from 'native-base';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorageConsts} from '../../../support/Consts';
import TaskRenderer from '../../tasks/TaskRenderer';
import {TabView} from 'react-native-tab-view';


export default class PatientsTasksScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.PatientTasks.title,
            headerBackTitle: ' ',
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
        patient: this.props.navigation.getParam('patient', null),
        tasks: [],
        responses: [],
        index: this.props.navigation.getParam('completed', null) ? 1 : 0,
        routes: [
            { key: 'open', title: strings.PatientTasks.open },
            { key: 'completed', title: strings.PatientTasks.completed },
        ],
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();

        this.props.navigation.setParams({
            showMenu: this.showMenu,
        });
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        this.setState({loading: true});
        const tasks = await this.getTasks(refresh);
        const responses = await this.getResponses(refresh);
        this.setState({...tasks, ...responses, loading: false});
    };

    getTasks = async (refresh = true) => {
        if (this.state.patient) {
            let result: APIRequest = await this.api.getTasks(this.state.patient.id);
            if (result.success) {
                return {tasks: result.data};
            } else {
                this.showError(result.data);
            }
        }

        return {tasks: []};
    };

    getResponses = async (refresh = true) => {
        if (this.state.patient) {
            let result: APIRequest = await this.api.getQuestionnaireResponses(this.state.patient.id);
            if (result.success) {
                return {responses: result.data};
            } else {
                this.showError(result.data);
            }
        }

        return {responses: []};
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    showMenu = () => {
        let options = [
            strings.Task.menuCreate,
            strings.Common.cancelButton
        ];

        ActionSheet.show({
                options: options,
                cancelButtonIndex: options.length - 1,
            },
            (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        this.createTask();
                        break;
                }
            });
    };

    createTask = () => {
        this.navigateTo('NewTask', {patient: this.state.patient, refresh: () => {
                this.getData();
                this.eventEmitter.emit('reloadTasks');
            }
        });
    };

    selectTask = (task: Task) => {

        if (task.status === Status.COMPLETED) {
            this.navigateTo('QuestionnaireResponse',{
                task: task,
                response: this.state.responses.find(response => response.taskId === task.id),
            });
        } else {
            this.navigateTo('Task', {
                task: task,
                refresh: () => {
                    this.getData();
                    this.eventEmitter.emit('reloadTasks');
                }
            });
        }
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderScene = ({ route }) => {
        switch (route.key) {
            case 'open':
                return this.renderTasks([Status.ACTIVE]);
            case 'completed':
                return this.renderTasks([Status.COMPLETED]);
            default:
                return null;
        }

    };

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
                <Text style={commonStyles.smallContentText}>{strings.PatientTasks.noData}</Text>
            </View>
        )
    };

    renderTasks = (statuses) => {

        let tasks = this.state.tasks;
        if (statuses && statuses.length > 0) {
            tasks = this.state.tasks.filter(task => {
                return statuses.includes(task.status);
            });
        }

        return (
            <View style={commonStyles.screenContainer}>
                <View style={{flex: 1,}}>
                    <FlatList style={{flex: 1}}
                              keyExtractor={item => item.id}
                              data={tasks}
                              contentContainerStyle={{flexGrow: 1}}
                              renderItem={this.renderTask}
                              ItemSeparatorComponent={() => renderSeparator()}
                              ListEmptyComponent={this.renderListEmpty}
                              ListHeaderComponent={this.renderListHeader}
                              ListFooterComponent={this.renderListFooter}
                              onRefresh={this.getData}
                              refreshing={false}
                    />
                </View>
            </View>
        );
    };

    renderTask = ({item}) => {

        let task: Task = item;

        return (
            <TaskRenderer task={task} selectTask={this.selectTask} />
        )
    };

    render() {

        let tasks = this.state.tasks;

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

});
