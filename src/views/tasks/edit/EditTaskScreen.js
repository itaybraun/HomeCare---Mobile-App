import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard, ScrollView, Linking
} from 'react-native';
import AppScreen from '../../../support/AppScreen';
import {strings} from '../../../localization/strings';
import {Status, Task} from '../../../models/Task';
import {appColors, commonStyles, renderLoading, popupNavigationOptions} from '../../../support/CommonStyles';
import {Button, Form, Icon, Left, Text, Container, Content, List, ListItem, Right, Body} from 'native-base';
import FormItemContainer from '../../other/FormItemContainer';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import {APIRequest} from '../../../api/API';
import {Visit} from '../../../models/Visit';
import ActionSheet from 'react-native-simple-action-sheet';
import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorageConsts} from '../../../support/Consts';
import TaskRenderer from '../TaskRenderer';
import {TransitionPresets} from 'react-navigation-stack';
import cloneDeep from 'lodash.clonedeep';
import {Practitioner} from '../../../models/Practitioner';

export default class EditTaskScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        return {
            title: strings.Task.editTask,
            ...popupNavigationOptions,
            headerLeft: () => {
                return (
                    <TouchableOpacity style={{paddingHorizontal: 12}} onPress={navigation.getParam('cancel')}>
                        <Icon type="Ionicons" name="md-close"
                              style={{fontSize: 24, color: 'black'}}/>
                    </TouchableOpacity>
                )
            },
            headerRight: () => {
                return (
                    <TouchableOpacity style={{paddingHorizontal: 12}} onPress={navigation.getParam('submit')}>
                        <Text style={[commonStyles.mainColorTitle, commonStyles.medium]}>{strings.Common.submitButton}</Text>
                    </TouchableOpacity>
                )
            }
        }
    };

    state = {
        loading: false,
        task: null,
        visit: null,
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();

        this.props.navigation.setParams({
            cancel: this.cancel,
            submit: this.submit,
            hideTabBar: true,
        });
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = () => {
        let task: Task = this.props.navigation.getParam('task', null) ;

        if (task) {
            task = cloneDeep(task);
        }

        this.setState({
            task: task,
            visit: task.visit,
        });
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    cancel = () => {
        this.pop();
    };



    selectPriority = () => {
        this.navigateTo('SelectPriority', {
            selectedPriority: this.state.task.priority,
            updatePriority: this.updatePriority,
        });
    };

    selectVisit = () => {
        this.navigateTo('SelectVisit', {
            task: this.state.task,
            selectedVisit: this.state.visit,
            submitVisit: this.updateVisit,
        });
    };

    selectPerformer = () => {
        this.navigateTo('SelectPerformer', {
            selectedPerformer: this.state.task.performer,
            updatePerformer: this.updatePerformer,
        });
    };



    updatePriority = async (value) => {
        let task: Task = this.state.task;
        task.priority = value;

        await this.setState({task: task,});
    };

    updateVisit = async (visit) => {
        await this.setState({visit: visit,});
    };

    updatePerformer = async (value: Practitioner) => {
        let task: Task = this.state.task;
        task.performer = value;
        task.performerId = value?.id;

        await this.setState({task: task,});
    };



    submit = async () => {

        this.setState({loading: true,});

        let task: Task = this.state.task;
        let visit: Visit = this.state.visit;

        if ((!task.visit && visit) || task.visit?.id !== visit?.id) {

            // add new visit if needed
            if (visit && !visit.id) {
                let result: APIRequest = await this.api.addVisit(visit);
                if (result.success) {
                    visit = result.data;
                } else {
                    this.setState({loading: false,});
                    this.showError(result.data);
                    return;
                }
            }

            // remove task from old visit. CRAZY!

            if (task.visit) {
                let result: APIRequest = await this.api.getVisit(task.visit.id);
                if (result.success) {
                    let visit: Visit = result.data;
                    visit.removeTaskId(task.id);
                    result = await this.api.updateVisit(visit);
                    if (!result.success) {
                        this.setState({loading: false,});
                        this.showError(result.data);
                    }
                } else {
                    this.setState({loading: false,});
                    this.showError(result.data);
                }
            }
            // add task to new visit
            if (visit) {
                visit.addTaskId(task.id);
                let result: APIRequest = await this.api.updateVisit(visit);
                if (!result.success) {
                    this.setState({loading: false,});
                    this.showError(result.data);
                    return;
                }
            }

            // update task
            task.visit = visit;
        }
        let result: APIRequest = await this.api.updateTask(task);
        if (result.success) {
            const updateTask = this.props.navigation.getParam('updateTask', null);
            updateTask && updateTask(task);
            this.setState({loading: false,});
            this.pop();
        } else {
            this.setState({loading: false,});
            this.showError(result.data);
        }
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {

        const task: Task = this.state.task;
        const visit: Visit = this.state.visit;

        return (

            <View style={commonStyles.screenContainer} onPress={Keyboard.dismiss}>
                {task &&
                <Container>
                    <Content bounces={false}>
                        <List>
                            <ListItem avatar>
                                <Left>
                                    <Image source={TaskRenderer.statusImage[task.status]}/>
                                </Left>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.taskId}</Text>
                                    <Text style={[{flex: 1}, commonStyles.formItemText]}>{task.id}</Text>
                                </Body>
                            </ListItem>

                            <ListItem onPress={this.selectPriority}>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.priority}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{strings.Priorities[task.priority]}</Text>
                                </Body>
                                <Right>
                                    <Icon name="arrow-forward"/>
                                </Right>
                            </ListItem>

                            <ListItem onPress={this.selectVisit}>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.schedule}</Text>
                                    {
                                        visit && visit.start && visit.end ?
                                            <Text style={[{flex: 1}, commonStyles.formItemText]}>{
                                                moment(visit.start).format(
                                                    uses24HourClock() ? 'ddd, MMM-DD-YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A'
                                                ) +
                                                moment(visit.end).format(
                                                    uses24HourClock() ? ' - HH:mm' : ' - hh:mm A'
                                                )}
                                            </Text>

                                            : <Text style={[commonStyles.smallContentText, {
                                                flex: 1,
                                                color: '#FF0000'
                                            }]}>
                                                {strings.Tasks.noSchedule}
                                            </Text>
                                    }
                                </Body>
                                <Body style={{flex: 0}}>
                                    <Icon type='Octicons' name='calendar' />
                                </Body>
                            </ListItem>

                            <ListItem onPress={this.selectPerformer}>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.performer}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{task.performer?.fullName}</Text>
                                </Body>
                                <Right>
                                    <Icon name="arrow-forward"/>
                                </Right>
                            </ListItem>

                            <ListItem>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.notes}</Text>
                                    <Text style={[{flex: 1}, commonStyles.formItemText]}>{task.notes}</Text>
                                </Body>
                                <Right>
                                    <Icon name="arrow-forward"/>
                                </Right>
                            </ListItem>
                        </List>
                    </Content>
                </Container>
                }
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    infoContainer: {

    },
});
