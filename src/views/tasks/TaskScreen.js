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
import {commonStyles} from '../../support/CommonStyles';
import {Button, Form, Icon, Text} from 'native-base';
import FormItemContainer from '../other/FormItemContainer';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

export default class TaskScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        const task: Task = navigation.getParam('task', null);
        let title = strings.Task.addTask;
        if (task)
            title = task.text;
        return {
            title: title,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        showingVisitDatePicker: false,

        title: null,
        patient: null,
        address: null,
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

        if (task) {
            this.setState({
                title: task.text,
                patient: task.patient?.fullName,
                priority: task.priority,
            });
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

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
                                    <Text style={{flex: 1,}}>{this.state.title}</Text>
                                    <TouchableOpacity>
                                        <Icon type="Feather" name="info"/>
                                    </TouchableOpacity>
                                </View>
                            </FormItemContainer>
                            <FormItemContainer
                                title={strings.Task.patient}
                                disabled>
                                <View
                                    style={{flexDirection: 'row', padding: 11, paddingVertical: 18, alignItems: 'center'}}>
                                    <Text style={{flex: 1,}}>{this.state.patient}</Text>
                                </View>
                            </FormItemContainer>
                            {

                            }

                            {

                            }

                            <FormItemContainer
                                title={strings.Task.category}
                                disabled>
                                <View
                                    style={{flexDirection: 'row', padding: 11, paddingVertical: 18, alignItems: 'center'}}>
                                    <Text style={{flex: 1,}}>{this.state.category}</Text>
                                </View>
                            </FormItemContainer>

                            <FormItemContainer
                                title={strings.Task.patient}
                                disabled>
                                <View
                                    style={{flexDirection: 'row', padding: 11, paddingVertical: 18, alignItems: 'center'}}>
                                    <Text style={{flex: 1,}}>{strings.Priorities[this.state.priority]}</Text>
                                </View>
                            </FormItemContainer>

                            <FormItemContainer
                                style={{padding: 11,}}
                                title={strings.Task.visit}>
                                <TouchableWithoutFeedback
                                    onPress={() => this.setState({showingVisitDatePicker: true})}>
                                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                                        <Text style={{flex: 1}}>{this.state.visit ? moment(this.state.visit).format('ddd, MMM Do YYYY HH:mm') : ''}</Text>
                                        <Icon type="Octicons" name="calendar" />
                                    </View>
                                </TouchableWithoutFeedback>
                            </FormItemContainer>

                            <TouchableOpacity style={{paddingBottom: 20,}}>
                                <Text style={commonStyles.link}>{strings.Task.addNewVisit.toUpperCase()}</Text>
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
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
    container: {
        flex: 1,
        padding: 20,
    },
});
