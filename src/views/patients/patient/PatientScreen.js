import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image} from 'react-native';
import AppScreen from '../../../support/AppScreen';
import { TabView, TabBar } from 'react-native-tab-view';
import {Patient} from '../../../models/Patient';
import Loading from '../../../support/Loading';
import {APIRequest} from '../../../api/API';
import {strings} from '../../../localization/strings';
import {Card, Container, Content, ListItem, Thumbnail, Left, Right, Body, Icon, List, Text} from 'native-base';
import {appColors, commonStyles, renderLoading, renderSeparator, renderTabBar} from '../../../support/CommonStyles';
import {Status, Task} from '../../../models/Task';
import MenuButton from '../../menu/MenuButton';
import ActionSheet from 'react-native-simple-action-sheet';
import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorageConsts} from '../../../support/Consts';
import TaskRenderer from '../../tasks/TaskRenderer';


export default class PatientScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Patient.title,
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
        patient: this.props.navigation.getParam('patient', null),
        tasks: [],
        statuses: [Status.ACTIVE],
    };

    possibleStatuses = [
        {key: 'all', label: strings.Task.all, statuses: [Status.ACTIVE, Status.COMPLETED]},
        {key: 'open', label: strings.Task.open, statuses: [Status.ACTIVE]},
        {key: 'closed', label: strings.Task.closed, statuses: [Status.COMPLETED]},
    ];

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        //this.getData();

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
        let taskFilter = await AsyncStorage.getItem(AsyncStorageConsts.TASKS_FILTER);
        const statuses = taskFilter ? JSON.parse(taskFilter) : [Status.ACTIVE];
        await this.setState({statuses: statuses});
        const tasks = await this.getTasks(refresh);
        this.setState({...tasks, loading: false});
    };

    getTasks = async (refresh = true) => {
        if (this.state.patient) {
            let statuses = this.state.statuses.length > 0 ? this.state.statuses : null;
            let result: APIRequest = await this.api.getTasks(this.state.patient.id, statuses);
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

    deleteTask = async (task: Task) => {

        this.showAlert(strings.Task.deleteTask, null, [
            {
                text: strings.Common.noButton,
                style: 'cancel',
                onPress: () => {

                }
            },
            {
                text: strings.Common.yesButton,
                style: 'destructive',
                onPress: async () => {
                    this.setState({
                        tasks: this.state.tasks.filter(t => t.id !== task.id)
                    });

                    task.status = Status.REVOKED;
                    const request: APIRequest = await this.api.updateTask(task);
                    if (request.success) {
                        //this.getData();
                    } else {
                        this.showError(result.data);
                    }
                },
            }
        ]);
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
                    AsyncStorage.setItem(AsyncStorageConsts.TASKS_FILTER, JSON.stringify(statuses));
                    this.getData();
                }
            });
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderSections = (title, route, params, image, bold = false, disabled = false) => {
        return (
            <ListItem avatar
                      style={{opacity: disabled ? 0.5 : 1, marginRight: 5, paddingTop: 10}}
                      disabled={disabled}
                      onPress={() => this.navigateTo(route, {patient: this.state.patient, ...params})}>
                <Left style={{paddingTop: 6}}>
                    <Thumbnail square source={image} style={{width: 32, height: 32, marginLeft: 20}}/>
                </Left>
                <Body style={{paddingBottom: 18}}>
                    <Text style={[commonStyles.contentText, bold && commonStyles.bold]}>{title}</Text>
                </Body>
            </ListItem>
        );
    };

    render() {

        const patient: Patient = this.state.patient;
        const userAvatar = patient.avatar || require('../../../assets/icons/patients/user.png');

        return (
            <Container style={commonStyles.screenContainer}>
                    <Content bounces={false}>
                        <View style={{flexDirection: 'row', alignItems: 'center', padding: 20,}}>
                            <Image source={userAvatar}/>
                            <View style={{flex: 1, marginLeft: 15,}}>
                                <Text style={commonStyles.mainColorTitle}>{patient.fullName}</Text>
                            </View>
                        </View>
                        <List>
                            {this.renderSections(strings.Patient.openTasks, 'PatientsTasks', null, require('../../../assets/icons/patients/task.png'), true)}
                            {this.renderSections(strings.Patient.completedTasks, 'PatientsTasks', {completed: true}, require('../../../assets/icons/patients/completed-task.png'), true)}
                            {this.renderSections(strings.Patient.general, 'General', null, require('../../../assets/icons/patients/user.png'))}
                            {this.renderSections(strings.Patient.flags, 'Flags', null, require('../../../assets/icons/patients/caution.png'))}
                            {this.renderSections(strings.Patient.vital, 'Vital', null, require('../../../assets/icons/patients/health.png'), false, true)}
                            {this.renderSections(strings.Patient.conditions, 'Conditions', null, require('../../../assets/icons/patients/stethoscope.png'), false, true)}
                            {this.renderSections(strings.Patient.cognitive, 'Body', null, require('../../../assets/icons/patients/brain.png'), false, true)}
                        </List>
                    </Content>
                {renderLoading(this.state.loading)}
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    sectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionIcon: {
        height: 30,
        width: 30,
        margin: 12,
        marginRight: 24,
    },
    sectionTextContainer: {
        flex: 1,
        paddingVertical: 12,
        justifyContent: 'center',
        alignSelf: 'stretch',
        borderBottomColor: '#CCCCCC',
        borderBottomWidth: 1
    },
});
