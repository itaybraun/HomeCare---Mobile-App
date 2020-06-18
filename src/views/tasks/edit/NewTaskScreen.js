import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard, ScrollView, Linking, Image, Alert,
} from 'react-native';
import AppScreen from '../../../support/AppScreen';
import {strings} from '../../../localization/strings';
import {Priority, Status, Task} from '../../../models/Task';
import {
    appColors,
    commonStyles,
    popupNavigationOptions,
    renderLoading,
    renderRadioButton,
    renderSeparator,
} from '../../../support/CommonStyles';
import {Button, Form, Icon, Picker, Text, Content, Container, List, Body, Right, ListItem} from 'native-base';
import FormItemContainer from '../../other/FormItemContainer';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import {Visit} from '../../../models/Visit';
import ActionSheet from 'react-native-simple-action-sheet';
import {Request} from '../../../support/Utils';
import {Practitioner} from '../../../models/Practitioner';
import {string} from 'prop-types';
import {Activity} from '../../../models/Activity';
import {Patient} from '../../../models/Patient';
import APIRequest from '../../../models/APIRequest';
import ListItemContainer from '../../other/ListItemContainer';

export default class NewTaskScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        return {
            title: strings.Task.addTask,
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
        patient: null,
        patientDisabled: false,
        activity: null,
        priority: null,
        notes: null,
        visit: null,
        performer: null,

        errors: {},
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

    getData = async () => {
          let patient = this.props.navigation.getParam('patient', null);
          this.setState({
              patient: patient,
              patientDisabled: patient !== null,
              performer: this.api.user,
              priority: Priority.ROUTINE,
          });
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    validate = () => {
        let task = new Task();
        let errors = {};

        task.status = Status.ACTIVE;

        task.authoredOn = moment().toISOString();

        if (this.state.patient) {
            task.patientId = this.state.patient?.id;
            task.patient = this.state.patient;
        } else {
            errors.patient = true;
        }

        if (this.state.activity) {
            task.activityId = this.state.activity.id;
            task.activity = this.state.activity;
            task.text = this.state.activity.text;
        }
        else {
            errors.activity = true;
        }

        const performer: Practitioner = this.state.performer || this.api.user;
        task.performerId = performer?.id;
        task.performer = performer;

        task.requesterId = this.api.user?.id;
        task.requester = this.api.user;

        task.priority = this.state.priority;

        const success = Object.keys(errors).length === 0;

        return new Request(
            success,
            success ? task : errors
        );
    };

    submit = async () => {

        await this.setState({
            errors: {},
        });

        let validationResult: Request = this.validate();

        if (validationResult.success) {
            this.setState({loading: true,});
            let task: Task = validationResult.data;
            let visit: Visit = this.state.visit;

            if (visit) {
                // add new visit if needed
                if (!visit.id) {
                    let result: APIRequest = await this.api.addVisit(visit);
                    if (result.success) {
                        visit = result.data;
                    } else {
                        this.showError(result.data);
                        this.setState({loading: false,});
                        return;
                    }
                }

                // update task
                task.visit = visit;
            }

            let result: APIRequest = await this.api.addTask(task);
            if (result.success) {
                task = result.data;
            } else {
                this.showError(result.data);
                this.setState({loading: false,});
                return;
            }

            if (visit) {
                // add task to visit
                visit.addTaskId(task.id);
                result = await this.api.updateVisit(visit);
                if (result.success) {

                } else {
                    this.showError(result.data);
                    this.setState({loading: false,});
                    return;
                }
            }

            const refresh = this.props.navigation.getParam('refresh', null);
            refresh && refresh();
            this.pop();
        } else {
            this.setState({
                errors: validationResult.data
            });
        }
    };

    cancel = () => {
        this.pop();
    };


    selectPatient = () => {
        this.navigateTo('SelectPatient', {
            selectedPatient: this.state.patient,
            updatePatient: async (patient: Patient) => {
                let errors = this.state.errors;
                errors.patient = false;
                await this.setState({patient: patient, errors: errors});
            },
        });
    };

    selectActivity = () => {
        this.navigateTo('SelectActivity', {
            selectedActivity: this.state.activity,
            updateActivity: async (activity: Activity) => {
                let errors = this.state.errors;
                errors.activity = false;
                await this.setState({activity: activity, errors: errors});
            },
        });
    };

    selectPriority = () => {
        this.navigateTo('SelectPriority', {
            selectedPriority: this.state.priority,
            updatePriority: async (priority) => {
                await this.setState({priority: priority,});
            },
        });
    };

    selectVisit = () => {

        if (!this.state.patient) {
            Alert.alert(null, strings.Task.selectAPatientFirst)
            return;
        }

        this.navigateTo('SelectVisit', {
            patient: this.state.patient,
            selectedVisit: this.state.visit,
            submitVisit: async (visit: Visit) => {
                await this.setState({visit: visit,});
            },
        });
    };

    selectPerformer = () => {
        this.navigateTo('SelectPerformer', {
            selectedPerformer: this.state.performer,
            updatePerformer: async (performer: Practitioner) => {
                await this.setState({performer: performer,})
            },
        });
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {

        return (

            <View style={commonStyles.screenContainer} onPress={Keyboard.dismiss}>
                <Container style={{paddingVertical: 20}}>
                    <Content bounces={false} contentContainerStyle={{flexGrow: 1}}>
                        <List>

                            <Text style={[commonStyles.boldTitleText, {paddingLeft: 20}]}>
                                {strings.Task.patient}
                            </Text>
                            <ListItemContainer error={this.state.errors?.patient}
                                               disabled={this.state.patientDisabled}
                                               onPress={this.selectPatient}>
                                <Body>
                                    {
                                        this.state.patient ?
                                            <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                                {this.state.patient.fullName}
                                            </Text> :
                                            <Text style={[{flex: 1}, commonStyles.infoText, this.state.errors?.patient && {color: appColors.errorColor}]}>
                                                {strings.Task.selectAPatient}
                                            </Text>
                                    }

                                </Body>
                                { !this.state.patientDisabled &&
                                    <Right>
                                        <Icon name="arrow-forward"/>
                                    </Right>
                                }
                            </ListItemContainer>


                            <Text style={[commonStyles.boldTitleText, {paddingLeft: 20, paddingTop: 20}]}>
                                {strings.Task.whatToDo}
                            </Text>

                            <ListItemContainer error={this.state.errors?.activity} onPress={this.selectActivity}>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}, this.state.errors?.activity && {color: appColors.errorColor}]}>{strings.Task.task}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{this.state.activity?.text}</Text>
                                </Body>
                                <Right>
                                    <Icon name="arrow-forward"/>
                                </Right>
                            </ListItemContainer>

                            <ListItem onPress={this.selectPriority}>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.priority}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{strings.Priorities[this.state.priority]}</Text>
                                </Body>
                                <Right>
                                    <Icon name="arrow-forward"/>
                                </Right>
                            </ListItem>

                            <ListItem>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.notes}</Text>
                                    <Text style={[{flex: 1}, commonStyles.formItemText]}>{this.state.notes}</Text>
                                </Body>
                                <Right>
                                    <Icon name="arrow-forward"/>
                                </Right>
                            </ListItem>

                            <Text style={[commonStyles.boldTitleText, {paddingLeft: 20, paddingTop: 20}]}>
                                {strings.Task.when}
                            </Text>
                            <ListItem onPress={this.selectVisit}>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.schedule}</Text>
                                    {
                                        this.state.visit && this.state.visit.start && this.state.visit.end &&
                                            <Text style={[{flex: 1}, commonStyles.formItemText]}>{
                                                moment(this.state.visit.start).format(
                                                    uses24HourClock() ? 'ddd, MMM-DD-YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A'
                                                ) +
                                                moment(this.state.visit.end).format(
                                                    uses24HourClock() ? ' - HH:mm' : ' - hh:mm A'
                                                )}
                                            </Text>
                                    }
                                </Body>
                                <Body style={{flex: 0}}>
                                    <Icon type='Octicons' name='calendar' />
                                </Body>
                            </ListItem>

                            {
                                this.state.performer && this.state.performer.id !== this.api.user?.id ?
                                    <ListItem onPress={this.selectPerformer}>
                                        <Body>
                                            <Text
                                                style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.performer}</Text>
                                            <Text
                                                style={[{flex: 1}, commonStyles.formItemText]}>{this.state.performer?.fullName}</Text>
                                        </Body>
                                        <Right>
                                            <Icon name="arrow-forward"/>
                                        </Right>
                                    </ListItem> :
                                    <TouchableOpacity style={{padding: 30,}} onPress={this.selectPerformer}>
                                        <Text style={[commonStyles.contentText, {color: appColors.mainColor}]}>{strings.Task.assignToOther?.toUpperCase()}</Text>
                                    </TouchableOpacity>
                            }
                        </List>

                        <View style={{alignSelf: 'flex-end', marginTop: 10,}}>
                            <Image source={require('../../../assets/icons/tasks/new_task.png')}/>
                        </View>
                    </Content>
                </Container>
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    infoContainer: {

    },
});
