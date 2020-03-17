import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import AppScreen from '../../../support/AppScreen';
import { TabView, TabBar } from 'react-native-tab-view';
import {Patient} from '../../../models/Patient';
import Loading from '../../../support/Loading';
import {APIRequest} from '../../../api/API';
import {strings} from '../../../localization/strings';
import { Card, Icon, Text } from 'native-base';
import {appColors, commonStyles, renderLoading, renderSeparator, renderTabBar} from '../../../support/CommonStyles';
import PatientProfile from './PatientProfile';
import PatientCarePlans from './PatientCarePlans';
import PatientTasks from './PatientTasks';
import {Status, Task} from '../../../models/Task';
import MenuButton from '../../menu/MenuButton';
import ActionSheet from 'react-native-simple-action-sheet';
import AsyncStorage from '@react-native-community/async-storage';
import {Consts} from '../../../support/Consts';


export default class PatientScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        const patient: Patient = navigation.getParam('patient', null);
        let title = strings.Patient.title;
        if (patient) {
            title = patient.fullName;
        }

        return {
            title: title,
            headerBackTitle: ' ',
            headerRight: () => {
                return (
                navigation.getParam('filterIsVisible') ?
                    <TouchableOpacity style={{padding: 12}} onPress={navigation.getParam('showFilter')}>
                        <Icon type="Feather" name="filter" style={{fontSize: 22, color: appColors.headerFontColor}}/>
                    </TouchableOpacity> :
                    null
                )
            }
            ,
        }
    };

    state = {
        loading: false,
        index: 0,
        routes: [
            { key: 'profile', title: strings.Patient.profile },
            //{ key: 'care', title: strings.Patient.carePlans },
            { key: 'tasks', title: strings.Patient.tasks },
        ],

        tasks: [],
        statuses: [Status.ACTIVE],
    };

    get patient(): Patient {
        return this.props.navigation.getParam('patient', null);
    }

    possibleStatuses = [
        {key: 'all', label: strings.Task.all, statuses: []},
        {key: 'open', label: strings.Task.open, statuses: [Status.ACTIVE]},
        {key: 'closed', label: strings.Task.closed, statuses: [Status.COMPLETED]},
    ];

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();

        this.props.navigation.setParams({
            showFilter: this.showFilter,
            filterIsVisible: this.state.index === 1
        });
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        this.setState({loading: true});
        let taskFilter = await AsyncStorage.getItem(Consts.TASKS_FILTER);
        const statuses = taskFilter ? JSON.parse(taskFilter) : [Status.ACTIVE];
        await this.setState({statuses: statuses});
        const tasks = await this.getTasks(refresh);
        this.setState({...tasks, loading: false});
    };

    getTasks = async (refresh = true) => {
        if (this.patient) {
            let statuses = this.state.statuses.length > 0 ? this.state.statuses : null;
            let result: APIRequest = await this.api.getTasks(this.patient.id, statuses);
            if (result.success) {
                return {tasks: result.data};
            } else {
                this.showError(result.data);
                return {tasks: []};
            }
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    handleTabIndexChange = index => {
        this.setState({ index });
        this.props.navigation.setParams({ filterIsVisible: index === 1 });
    };

    addTask = () => {
        this.navigateTo('NewTask', {patient: this.patient, refresh: () => {
                this.getData();
                this.eventEmitter.emit('reloadTasks');
            }
        });
    };

    selectTask = async (task: Task) => {
        if (task.status === Status.ACTIVE && task.activity?.questionnaireId) {
            this.navigateTo('Questionnaire', {
                task: task, refresh: () => {
                    this.getData();
                    this.eventEmitter.emit('reloadTasks');
                }
            });
        }
        else {
            // task.status = Status.ACTIVE;
            // const request: APIRequest = await this.api.updateTask(task);
            // if (request.success) {
            //     this.getData();
            // }
        }
    };

    showFilter = async () => {
        let options = this.possibleStatuses.map(status => status.label);
        if (Platform.OS === 'ios')
            options.push(strings.Common.cancelButton);

        ActionSheet.showActionSheetWithOptions({
                options: options,
                title: strings.Task.filterTasks,
                cancelButtonIndex: options.length - 1,
            },
            async (buttonIndex) => {
                if (buttonIndex < this.possibleStatuses.length) {
                    let statuses = this.possibleStatuses[buttonIndex].statuses;
                    await this.setState({
                        statuses: statuses,
                    });
                    AsyncStorage.setItem(Consts.TASKS_FILTER, JSON.stringify(statuses));
                    this.getData();
                }
            });
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderTabBar = (props) => {
        return renderTabBar(props, this.state.index, this.handleTabIndexChange);
    };

    renderScene = ({ route }) => {
        switch (route.key) {
            case 'profile':
                return <PatientProfile patient={this.patient} navigateTo={this.navigateTo} />;
            case 'care':
                return <PatientCarePlans patient={this.patient} navigateTo={this.navigateTo}  />;
            case 'tasks':
                return(
                    <View style={{flex: 1}}>
                        {
                            this.state.qaMode &&
                                <Text style={{textAlign: 'center', marginTop: 10}}>
                                    QA Mode enabled. Showing all tasks
                                </Text>
                        }
                        <PatientTasks patient={this.patient}
                                      tasks={this.state.tasks}
                                      selectTask={this.selectTask} />
                        <View style={{position: 'absolute', right: 10, bottom: 10}}>
                            <TouchableOpacity
                                style={commonStyles.blackButtonContainer}
                                onPress={this.addTask}
                            >
                                <Icon type="Feather" name="plus" style={commonStyles.plusText}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            default:
                return null;
        }
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

});
