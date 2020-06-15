import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView, Image, ActivityIndicator, Platform, SafeAreaView,
} from 'react-native';
import AppScreen from '../../../../../support/AppScreen';
import {strings} from '../../../../../localization/strings';
import {
    appColors,
    commonStyles,
    popupNavigationOptions,
    renderLoading,
    renderRadioButton, renderSeparator,
} from '../../../../../support/CommonStyles';
import FormItemContainer from '../../../../other/FormItemContainer';
import {Body, Button, Container, Content, Form, Icon, List, Right, Text, Textarea} from 'native-base';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ActionSheet from 'react-native-simple-action-sheet';
import moment from 'moment';
import {Request, uploadImages} from '../../../../../support/Utils';
import APIRequest from '../../../../../models/APIRequest';
import cloneDeep from 'lodash.clonedeep';
import {Priority, Status, Task} from '../../../../../models/Task';
import ListItemContainer from '../../../../other/ListItemContainer';
import {Patient} from '../../../../../models/Patient';
import {Condition, ConditionNote} from '../../../../../models/Condition';
import {QuestionnaireItem} from '../../../../../models/Questionnaire';
import ImagePicker from 'react-native-image-picker';
import {Activity} from '../../../../../models/Activity';

export default class NewActivityScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        return {
            title: strings.Activities.newActivity,
            headerBackTitle: ' ',
            ...popupNavigationOptions,
            headerLeft: () => {
                return (
                    <TouchableOpacity style={{paddingHorizontal: 12}} onPress={navigation.getParam('cancel')}>
                        <Icon type="Ionicons" name="md-close"
                              style={{fontSize: 24, color: 'black'}}/>
                    </TouchableOpacity>
                )
            },
        }
    };

    state = {
        loading: false,
        patient: null,
        activities: [],
        selectedActivity: null,
        errors: {}
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

    getData = async (refresh = true) => {
        this.setState({loading: true});
        const patient = this.props.navigation.getParam('patient', null);
        const activities = await this.getActivities();
        this.setState({
            patient: patient,
            patientDisabled: patient !== null,
            ...activities,
            loading: false,
        });
    };

    getActivities = async () => {
        let result: APIRequest = await this.api.getActivities();
        if (result.success) {
            const activities = result.data.sort((a: Activity, b: Activity) => {
                return ('' + a.text).localeCompare(b.text);
            });
            return {activities: activities};
        } else {
            this.showError(result.data);
            return {activities: []};
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    cancel = () => {
        this.pop();
    };

    showQuestionnaire = () => {
        let task = new Task();
        task.status = Status.ACTIVE;
        task.activity = this.state.selectedActivity;
        task.activityId = this.state.selectedActivity?.id;
        task.text = this.state.selectedActivity?.text;
        task.patientId = this.state.patient?.id;
        task.patient = this.state.patient;
        task.performer = this.api.user;
        task.performerId = this.api.user?.id;
        task.requesterId = this.api.user?.id;
        task.requester = this.api.user;
        task.priority = Priority.ROUTINE;

        this.navigateTo('Questionnaire', {
            task: task,
            updateTask: this.updateTask,
            onCancel: this.cancel,
        });
    };

    updateTask = (task: Task) => {
        console.log(task);
        this.pop();
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {
        return (
            <View style={commonStyles.screenContainer}>
                <Container style={{padding: 20}}>
                    <Content bounces={false} contentContainerStyle={{flexGrow: 1}}>
                        {
                            this.state.activities.map((activity, index) => {

                                return (
                                    <TouchableOpacity
                                        key={activity.id}
                                        onPress={() => this.setState({
                                            selectedActivity: activity,
                                        })}>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            {renderRadioButton(this.state.selectedActivity === activity)}
                                            <Text style={[commonStyles.contentText, {
                                                flex: 1,
                                                marginLeft: 10
                                            }]}>{activity.text}</Text>
                                        </View>
                                        {renderSeparator()}
                                    </TouchableOpacity>
                                );
                            })
                        }
                    </Content>
                    <View style={{}}>
                        <View style={{alignItems: 'center'}}>
                            <Button
                                style={{
                                    backgroundColor: 'white',
                                    width: 230,
                                    borderColor: this.state.selectedActivity ? appColors.mainColor : appColors.disabledColor,
                                    borderWidth: 1,
                                    justifyContent: 'center'
                                }} disabled={this.state.selectedActivity === null} onPress={this.showQuestionnaire}>
                                <Text style={[
                                    commonStyles.buttonText,
                                    {
                                        color: this.state.selectedActivity ? appColors.mainColor : appColors.disabledColor
                                    }]}
                                >
                                    {strings.Activities.start?.toUpperCase()}
                                </Text>
                            </Button>
                        </View>
                    </View>
                </Container>

                {renderLoading(this.state.loading)}

            </View>
        );
    }
}

const styles = StyleSheet.create({

});
