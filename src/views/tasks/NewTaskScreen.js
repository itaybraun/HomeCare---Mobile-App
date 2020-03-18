import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard, ScrollView, Linking
} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {strings} from '../../localization/strings';
import {Priority, Status, Task} from '../../models/Task';
import {appColors, commonStyles, renderLoading, renderRadioButton, renderSeparator} from '../../support/CommonStyles';
import {Button, Form, Icon, Picker, Text, Content} from 'native-base';
import FormItemContainer from '../other/FormItemContainer';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import {APIRequest} from '../../api/API';
import {Visit} from '../../models/Visit';
import ActionSheet from 'react-native-simple-action-sheet';
import {Request} from '../../support/Utils';
import {Practitioner} from '../../models/Practitioner';
import {string} from 'prop-types';

export default class NewTaskScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        let title = strings.Task.addTask;
        return {
            title: title,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        patient: null,
        activities: [],
        practitioners: [],
        showingDatePicker: false,

        activity: null,
        performer: null,
        visit: null,

        errors: {},
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        this.setState({loading: true});
        const activities = await this.getActivities();
        const practitioners = await this.getPractitioners();
        this.setState({
            loading: false,
            ...activities,
            ...practitioners,
            patient: this.props.navigation.getParam('patient', null),
        })
    };

    getActivities = async () => {
        let result: APIRequest = await this.api.getActivities();
        if (result.success) {
            return {activities: result.data};
        } else {
            this.showError(result.data);
            return {activities: []};
        }
    };

    getPractitioners = async () => {
        let result: APIRequest = await this.api.getPractitioners();
        if (result.success) {
            return {practitioners: result.data};
        } else {
            this.showError(result.data);
            return {practitioners: []};
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    validate = () => {
        let task = new Task();
        let errors = {};

        task.status = Status.ACTIVE;
        task.patientId = this.state.patient?.id;
        task.patient = this.state.patient;

        const performer: Practitioner = this.state.performer || this.api.user;
        task.performerId = performer?.id;
        task.performer = performer;

        task.requesterId = this.api.user?.id;
        task.requester = this.api.user;

        task.priority = Priority.ROUTINE;

        if (this.state.activity) {
            task.activityId = this.state.activity.id;
            task.activity = this.state.activity;
            task.text = this.state.activity.text;
        }
        else {
            errors.activity = true;
        }

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
                return;
            }

            if (visit) {
                // add task to visit
                visit.addTaskId(task.id);
                result = await this.api.updateVisit(visit);
                if (result.success) {

                } else {
                    this.showError(result.data);
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

    showPerformerPicker = async () => {
        let options = this.state.practitioners.map(practitioner => practitioner.fullName);
        if (Platform.OS === 'ios')
            options.push(strings.Common.cancelButton);

        ActionSheet.showActionSheetWithOptions({
                options: options,
                cancelButtonIndex: options.length - 1,
            },
            (buttonIndex) => {
                if (buttonIndex < this.state.practitioners.length) {
                    this.setState({
                        performer: this.state.practitioners[buttonIndex],
                    })
                }
            });
    };

    selectActivity = () => {
        this.navigateTo('SelectActivity', {
            activities: this.state.activities,
            selectedActivity: this.state.activity,
            submitActivity: this.submitActivity,
        });
    };


    submitActivity = (activity) => {
        this.setState({
            activity: activity,
        });
    };

    selectVisit = () => {

        const task: Task = new Task();
        task.patientId = this.state.patient?.id;
        task.patient = this.state.patient;

        this.navigateTo('Visit', {
            task: task,
            selectedVisit: this.state.visit,
            submitVisit: this.submitVisit,
        });
    };

    submitVisit = (visit) => {
        this.setState({
            visit: visit,
        });
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {

        return (

            <View style={commonStyles.screenContainer} onPress={Keyboard.dismiss}>
                <Content style={{flex: 1,}}
                         contentContainerStyle={{padding: 20, paddingBottom: 0,}}
                         enableResetScrollToCoords={false}
                         bounces={false}>
                    <Form>
                        <View>
                            <Text style={commonStyles.yellowText}>{strings.Task.whatToDo}</Text>
                            <FormItemContainer
                                style={{marginTop: 12}}
                                title={strings.Task.plan}
                                error={this.state.errors.activity}>
                                <TouchableOpacity
                                    style={{flexDirection: 'row', padding: 11, alignItems: 'center'}}
                                    onPress={this.selectActivity}>
                                    <Text style={[{flex: 1}, commonStyles.formItemText]}>{this.state.activity?.text || ''}</Text>
                                    <Icon name="ios-arrow-down" />
                                </TouchableOpacity>
                            </FormItemContainer>
                        </View>



                        <View>
                            <Text style={commonStyles.yellowText}>{strings.Task.patient}</Text>
                            <Text style={[commonStyles.titleText, {marginTop: 5}]}>{this.state.patient?.fullName}</Text>
                        </View>

                        <View style={{marginTop: 15}}>
                            <Text style={commonStyles.yellowText}>{strings.Task.assignTo}</Text>

                            {renderSeparator({height: 5,})}

                            <TouchableOpacity onPress={() => this.setState({performer: null})}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    {renderRadioButton(this.state.performer === null)}
                                    <Text style={{marginLeft: 10}}>{strings.Task.me}</Text>
                                </View>
                            </TouchableOpacity>

                            {renderSeparator()}

                            <TouchableOpacity onPress={this.showPerformerPicker}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    {renderRadioButton(this.state.performer !== null)}
                                    <Text style={{marginLeft: 10}}>{this.state.performer?.fullName || strings.Task.selectPractitioner}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={{marginTop: 15}}>
                            <Text style={commonStyles.yellowText}>{strings.Task.when}</Text>
                            <FormItemContainer
                                style={{padding: 11, marginTop: 12}}
                                title={strings.Task.visit}>
                                <TouchableOpacity
                                    onPress={this.selectVisit}>
                                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                                        <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                            {
                                                this.state.visit && this.state.visit.start && this.state.visit.end ?
                                                    moment(this.state.visit.start).format(
                                                        uses24HourClock() ? 'ddd, MMM-DD-YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A'
                                                    ) +
                                                    moment(this.state.visit.end).format(
                                                        uses24HourClock() ? ' - HH:mm' : ' - hh:mm A'
                                                    )

                                                    : ''
                                            }
                                        </Text>
                                        <Icon type="Octicons" name="calendar" style={{color: appColors.textColor}} />
                                    </View>
                                </TouchableOpacity>
                            </FormItemContainer>
                        </View>
                        {
                            false &&
                                <View>
                                    <Text style={commonStyles.yellowText}>{strings.Task.notes}</Text>
                                </View>
                        }

                    </Form>
                </Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 20, marginTop: 10,}}>
                    <Button block
                            style={{backgroundColor: '#CCF4C9', width: 120,}}
                            onPress={this.submit}>
                        <Text style={{color: '#32C02B', fontWeight: 'bold'}}>{strings.Common.submitButton?.toUpperCase()}</Text>
                    </Button>
                    <Button block
                            style={{backgroundColor: '#F5BEC0', width: 120,}}
                            onPress={this.cancel}>
                        <Text style={{color: '#EC1A31', fontWeight: 'bold'}}>{strings.Common.cancelButton?.toUpperCase()}</Text>
                    </Button>
                </View>
                {renderLoading(this.state.loading)}


                <DateTimePickerModal
                    isVisible={this.state.showingDatePicker}
                    date={this.state.start || new Date()}
                    mode="date"
                    onConfirm={(date) => {
                        let errors = this.state.errors;
                        errors.start = false;
                        errors.end = false;
                        this.setState({
                            start: date,
                            end: moment(date).add(1, 'h').toDate(),
                            showingVisitDatePicker: false,
                            errors: errors,
                        })
                    }}
                    onCancel={() => this.setState({showingVisitDatePicker: false,})}
                />

            </View>
        );
    }
}

const styles = StyleSheet.create({
    infoContainer: {

    },
});
