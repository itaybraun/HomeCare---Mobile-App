import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard, ScrollView,
} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {strings} from '../../localization/strings';
import {Task} from '../../models/Task';
import {appColors, commonStyles} from '../../support/CommonStyles';
import {Button, Form, Icon, Text} from 'native-base';
import FormItemContainer from '../other/FormItemContainer';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import * as RNLocalize from "react-native-localize";

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
        showingVisitDatePicker: false,
        is24Hour: false,

        title: null,
        patient: null,
        address: null,
        phone: null,
        priority: null,
        requester: null,
        visit: null,

        errors: {}
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
        const task: Task = this.props.navigation.getParam('task', null);
        const is24Hour = RNLocalize.uses24HourClock();

        if (task) {
            this.setState({
                title: task.text,
                patient: task.patient?.fullName,
                address: task.patient?.simpleAddress,
                phone: task.patient?.phone,
                priority: task.priority,
                requester: task.requester,
                is24Hour: is24Hour,
            });
        } else {
            this.setState({
                is24Hour: is24Hour,
            });
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    addNewVisit = () => {
        this.navigateTo('Visit', {task: this.props.navigation.getParam('task', null)});
    };

    submit = () => {
        this.pop();
    };

    cancel = () => {
        this.pop();
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {
        return (
            <View style={commonStyles.screenContainer}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        style={{flex: 1}}
                        contentContainerStyle={{padding: 20}}
                        bounces={false}
                        automaticallyAdjustContentInsets={false}>
                        <Form>
                            <FormItemContainer
                                title={strings.Task.task}
                                disabled>
                                <View
                                    style={{flexDirection: 'row', padding: 11, alignItems: 'center'}}>
                                    <Text style={[{flex: 1}, commonStyles.formItemText]}>{this.state.title}</Text>
                                    <TouchableOpacity>
                                        <Icon type="Feather" name="info" style={{color: appColors.textColor}}/>
                                    </TouchableOpacity>
                                </View>
                            </FormItemContainer>
                            <FormItemContainer
                                title={strings.Task.patient}
                                disabled>
                                <View
                                    style={{flexDirection: 'row', padding: 11, paddingVertical: 17, alignItems: 'center'}}>
                                    <Text style={[{flex: 1}, commonStyles.formItemText]}>{this.state.patient}</Text>
                                </View>
                            </FormItemContainer>
                            {
                                this.state.address &&
                                    <View style={styles.infoContainer}>
                                        <Icon type="SimpleLineIcons" name="map" style={{color: appColors.textColor}}/>
                                        <Text style={[{flex: 1, marginLeft: 16,}, commonStyles.formItemText]}>{this.state.address}</Text>
                                    </View>
                            }

                            {
                                this.state.phone &&
                                <View style={styles.infoContainer}>
                                    <Icon type="SimpleLineIcons" name="phone" style={{color: appColors.textColor}}/>
                                    <Text style={[{flex: 1, marginLeft: 16,}, commonStyles.formItemText]}>{this.state.phone}</Text>
                                </View>
                            }

                            <FormItemContainer
                                title={strings.Task.priority}
                                disabled>
                                <View
                                    style={{flexDirection: 'row', padding: 11, paddingVertical: 17, alignItems: 'center'}}>
                                    <Text style={[{flex: 1}, commonStyles.formItemText]}>{strings.Priorities[this.state.priority]}</Text>
                                </View>
                            </FormItemContainer>

                            <FormItemContainer
                                title={strings.Task.requester}
                                disabled>
                                <View
                                    style={{flexDirection: 'row', padding: 11, paddingVertical: 17, alignItems: 'center'}}>
                                    <Text style={[{flex: 1}, commonStyles.formItemText]}>{this.state.requester}</Text>
                                </View>
                            </FormItemContainer>

                            <FormItemContainer
                                style={{padding: 11,}}
                                title={strings.Task.visit}>
                                <TouchableOpacity
                                    onPress={() => this.setState({showingVisitDatePicker: true})}>
                                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                                        <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                            {
                                                this.state.visit ?
                                                    moment(this.state.visit).format(
                                                        this.state.is24Hour ? 'ddd, MMM Do YYYY HH:mm' : 'ddd, MMM Do YYYY hh:mm A'
                                                    )
                                                    : ''
                                            }
                                        </Text>
                                        <Icon type="Octicons" name="calendar" style={{color: appColors.textColor}} />
                                    </View>
                                </TouchableOpacity>
                            </FormItemContainer>

                            <TouchableOpacity style={{paddingVertical: 5,}}
                                              onPress={this.addNewVisit}>
                                <Text style={commonStyles.link}>{strings.Task.addNewVisit.toUpperCase()}</Text>
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                                <Button success transparent
                                        onPress={this.submit}>
                                    <Text style={{fontWeight: 'bold'}}>{strings.Common.submitButton.toUpperCase()}</Text>
                                </Button>
                                <Button danger transparent
                                        onPress={this.cancel}>
                                    <Text style={{fontWeight: 'bold'}}>{strings.Common.cancelButton.toUpperCase()}</Text>
                                </Button>
                            </View>

                        </Form>
                    </ScrollView>
                </TouchableWithoutFeedback>

                <DateTimePickerModal
                    isVisible={this.state.showingVisitDatePicker}
                    date={this.state.visit ?? new Date()}
                    mode="datetime"
                    onConfirm={(date) => {
                        this.setState({
                            visit: date,
                            showingVisitDatePicker: false,
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
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginHorizontal: 10,
    },
});
