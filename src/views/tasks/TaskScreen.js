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
import {Task} from '../../models/Task';
import {appColors, commonStyles, renderLoading} from '../../support/CommonStyles';
import {Button, Form, Icon, Card, Text} from 'native-base';
import FormItemContainer from '../other/FormItemContainer';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import {APIRequest} from '../../api/API';
import {Visit} from '../../models/Visit';

export default class TaskScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        const task: Task = navigation.getParam('task', null);
        let title = "";
        if (task)
            title = strings.Task.taskDetails;
        return {
            title: title,
            headerBackTitle: ' ',
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
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        this.setState({loading: true});
        const task = await this.getTask();
        this.setState({
            ...task,
            loading: false,
        })
    };

    getTask = async () => {
        let task: Task = this.props.navigation.getParam('task', null);
        let visit: Visit = null;
        let result: APIRequest = await this.api.getTask(task.id);

        if (result.success) {
            task = result.data;
            visit = task.visit;
        }

        return {
            task: task,
            visit: visit,
        };
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    selectVisit = () => {
        this.navigateTo('SelectVisit', {
            task: this.props.navigation.getParam('task', null),
            selectedVisit: this.state.visit,
            submitVisit: this.submitVisit,
        });
    };

    submitVisit = async (visit) => {
        await this.setState({
            visit: visit,
        });

        this.submit();
    };

    submit = async () => {

        this.setState({loading: true,});

        let task: Task = this.state.task;
        let visit: Visit = this.state.visit;
        if (!visit) {
            this.pop();
            return;
        }

        // add new visit if needed
        if (!visit.id) {
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
        visit.addTaskId(task.id);
        let result: APIRequest = await this.api.updateVisit(visit);
        if (!result.success) {
            this.setState({loading: false,});
            this.showError(result.data);
            return;
        }

        // update task
        task.visit = visit;
        result = await this.api.updateTask(task);
        if (result.success) {
            const refresh = this.props.navigation.getParam('refresh', null)
            refresh && refresh();
            this.setState({loading: false,});
            //this.pop();
        } else {
            this.setState({loading: false,});
            this.showError(result.data);
        }
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {

        let patientGenderAndAge = [];
        if (this.state.task?.patient?.gender)
            patientGenderAndAge.push(this.state.task.patient.gender.charAt(0).toUpperCase());
        if (this.state.task?.patient?.age)
            patientGenderAndAge.push(this.state.task.patient.age + ' ' + strings.Patients.yo);
        patientGenderAndAge = patientGenderAndAge.join(", ");

        return (

            <View style={commonStyles.screenContainer} onPress={Keyboard.dismiss}>
                <ScrollView
                    style={{flex: 1}}
                    contentContainerStyle={{padding: 20, paddingBottom: 0,}}
                    bounces={false}
                    automaticallyAdjustContentInsets={false}>
                    <Form>
                        <Text style={commonStyles.yellowText}>{strings.Task.task}</Text>
                        <Card style={[{padding: 15, marginBottom: 15,}, this.state.task?.isPriorityImportant ? {backgroundColor: '#F9E3E6'} : {}]}>
                            <Text style={commonStyles.titleText}>{this.state.task?.text}</Text>
                            <Text style={[commonStyles.contentText, {marginTop: 10,}]}>{strings.Priorities[this.state.task?.priority]}</Text>
                            <Text style={[commonStyles.infoText, {marginTop: 15}]}>{strings.Task.requester}:</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 0}}>
                                <Text style={[commonStyles.contentText, {flex: 1}]}>{this.state.task?.requester?.fullName}</Text>
                                {
                                    this.state.task?.requester?.email &&
                                    <TouchableOpacity style={{marginRight: 10, marginLeft: 15}}
                                                      onPress={() => Linking.openURL(`mailto:${this.state.task.requester.email}`)}>
                                        <Icon type="Feather" name="mail"
                                              style={{fontSize: 30, color: appColors.textColor}}/>
                                    </TouchableOpacity>
                                }
                                {
                                    this.state.task?.requester?.phone &&
                                    <TouchableOpacity style={{marginRight: 10, marginLeft: 15,}}
                                                      onPress={() => Linking.openURL(`tel:${this.state.task.requester.phone}`)}>
                                        <Icon type="Feather" name="phone"
                                              style={{fontSize: 30, color: appColors.textColor}}/>
                                    </TouchableOpacity>
                                }
                            </View>
                        </Card>

                        <Text style={commonStyles.yellowText}>{strings.Task.patient}</Text>
                        <Card style={{padding: 15, marginBottom: 15,}}>
                            <Text style={[commonStyles.titleText]}>{this.state.task?.patient?.fullName}</Text>
                            {
                                !patientGenderAndAge.isEmpty() &&
                                <Text style={[commonStyles.contentText, {marginTop: 5,}]}>
                                    {patientGenderAndAge}
                                </Text>
                            }
                            {
                                this.state.task?.patient?.phone &&
                                <TouchableOpacity
                                    style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}
                                    onPress={() => Linking.openURL(`tel:${this.state.task.patient.phone}`) }
                                >
                                    <Icon type="Feather" name="phone" style={{fontSize: 24, color: appColors.textColor}}/>
                                    <Text style={[{flex: 1, marginLeft: 10,}, commonStyles.contentText]}>{this.state.task?.patient?.phone}</Text>
                                </TouchableOpacity>
                            }
                            {
                                this.state.task?.patient?.address &&
                                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                                    <Icon type="Feather" name="map" style={{fontSize: 24, color: appColors.textColor}}/>
                                    <Text style={[{flex: 1, marginLeft: 10,}, commonStyles.contentText]}>{this.state.task?.patient?.simpleAddress}</Text>
                                </View>
                            }
                        </Card>


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
                    </Form>
                </ScrollView>
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    infoContainer: {

    },
});
