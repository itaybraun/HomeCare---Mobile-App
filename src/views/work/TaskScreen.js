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
import * as RNLocalize from "react-native-localize";
import {APIRequest} from '../../api/API';
import {Visit} from '../../models/Visit';

export default class TaskScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        const task: Task = navigation.getParam('task', null);
        let title = strings.Task.addTask;
        if (task)
            title = task ? strings.Task.taskDetails : strings.Task.addTask;
        return {
            title: title,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        is24Hour: false,
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
        const is24Hour = RNLocalize.uses24HourClock();
        const task = await this.getTask();
        this.setState({
            ...task,
            is24Hour: is24Hour,
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
        this.navigateTo('Visit', {
            task: this.props.navigation.getParam('task', null),
            submitVisit: this.submitVisit,
            newVisit: false,
            selectedVisit: this.state.visit,
        });
    };

    addNewVisit = () => {
        this.navigateTo('Visit', {
            task: this.props.navigation.getParam('task', null),
            submitVisit: this.submitVisit,
            newVisit: true,
            selectedVisit: this.state.visit,
        });
    };

    submitVisit = (visit) => {
        this.setState({
            visit: visit,
        })
    }

    submit = async () => {
        let task: Task = this.state.task;
        let visit: Visit = this.state.visit;
        if (!visit) {
            this.pop();
            return;
        }
        if (!visit.id) {
            let result: APIRequest = await this.api.addVisit(visit);
            if (result.success) {
                visit = result.data;
            } else {
                this.showError(result.data);
                return;
            }

            //TODO: remove this
            alert('New visit is not working yet');
            return;
        }
        task.visit = visit;
        let result: APIRequest = await this.api.updateTask(task);
        if (result.success) {
            this.pop();
        } else {
            this.showError(result.data);
        }
    };

    cancel = () => {
        this.pop();
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {

        if (this.state.loading) {
            return renderLoading(this.state.loading)
        }

        return (
            <View style={commonStyles.screenContainer}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        style={{flex: 1}}
                        contentContainerStyle={{padding: 20}}
                        bounces={false}
                        automaticallyAdjustContentInsets={false}>
                        <Form>
                            <Text style={commonStyles.yellowText}>{strings.Task.task}</Text>
                            <Card style={{padding: 15, marginBottom: 15,}}>
                                <Text style={commonStyles.titleText}>{this.state.task?.text}</Text>
                                <Text style={[commonStyles.contentText, {marginTop: 10,}]}>{strings.Priorities[this.state.task?.priority]}</Text>
                                <Text style={[commonStyles.infoText, {marginTop: 15}]}>{strings.Task.requester}:</Text>
                                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                                    {
                                        this.state.task?.requester?.phone &&
                                        <View>
                                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${this.state.task.requester.phone}`) }>
                                                <Icon type="Feather" name="phone" style={{fontSize: 24, color: appColors.textColor}}/>
                                            </TouchableOpacity>
                                        </View>
                                    }
                                    {
                                        this.state.task?.patient?.address &&
                                        <View style={{marginLeft: 10}}>
                                            <TouchableOpacity>
                                                <Icon type="Feather" name="mail" style={{fontSize: 24,color: appColors.textColor}}/>
                                            </TouchableOpacity>
                                        </View>
                                    }
                                    <Text style={[commonStyles.contentText, {marginLeft: 10,}]}>{this.state.task?.requester?.fullName}</Text>
                                </View>
                            </Card>


                            <Text style={commonStyles.yellowText}>{strings.Task.subject}</Text>
                            <Card style={{padding: 15, marginBottom: 15,}}>
                                <Text style={[commonStyles.titleText]}>{this.state.task?.patient?.fullName}</Text>
                                <Text style={[commonStyles.contentText, {marginTop: 5,}]}>
                                    {this.state.task?.patient?.gender?.charAt(0).toUpperCase()}, {this.state.task?.patient?.age} {strings.Patients.yo}
                                </Text>
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
                                    onPress={this.addNewVisit}>
                                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                                        <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                            {
                                                this.state.visit && this.state.visit.start && this.state.visit.end ?
                                                    moment(this.state.visit.start).format(
                                                        this.state.is24Hour ? 'ddd, MMM-DD-YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A'
                                                    ) +
                                                    moment(this.state.visit.end).format(
                                                        this.state.is24Hour ? ' - HH:mm' : ' - hh:mm A'
                                                    )

                                                    : ''
                                            }
                                        </Text>
                                        <Icon type="Octicons" name="calendar" style={{color: appColors.textColor}} />
                                    </View>
                                </TouchableOpacity>
                            </FormItemContainer>

                            <TouchableOpacity style={{}}
                                              onPress={this.selectVisit}>
                                <Text style={commonStyles.link}>{strings.Task.addToExistingVisit.toUpperCase()}</Text>
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 10, marginTop: 30}}>
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

                        </Form>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    infoContainer: {

    },
});
