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
import AppScreen from '../../support/AppScreen';
import {strings} from '../../localization/strings';
import {Status, Task} from '../../models/Task';
import {appColors, commonStyles, renderLoading} from '../../support/CommonStyles';
import {Button, Form, Icon, ActionSheet, Container, Content, List, ListItem, Left, Body, Right, Text} from 'native-base';
import FormItemContainer from '../other/FormItemContainer';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import {APIRequest} from '../../api/API';
import {Visit} from '../../models/Visit';
import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorageConsts} from '../../support/Consts';
import TaskRenderer from './TaskRenderer';
import FlagRenderer from '../patients/patient/flags/FlagRenderer';
import ListItemContainer from '../other/ListItemContainer';

export default class TaskScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        return {
            title: strings.Task.taskDetails,
            headerBackTitle: ' ',
            headerRight: () => {
                return (
                    <TouchableOpacity style={{padding: 12}} onPress={navigation.getParam('showMenu')}>
                        <Icon type="Entypo" name="dots-three-horizontal"
                              style={{fontSize: 22, color: appColors.headerFontColor}}/>
                    </TouchableOpacity>
                )
            }
        }
    };

    state = {
        loading: false,
        task: this.props.navigation.getParam('task', null),
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.props.navigation.setParams({
            showMenu: this.showMenu,
        });
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    showMenu = () => {
        let options = [
            strings.Task.menuEdit,
            strings.Task.menuExecute,
            strings.Task.menuCancel,
            strings.Common.cancelButton
        ];

        ActionSheet.show({
                options: options,
                destructiveButtonIndex: options.length - 2,
                cancelButtonIndex: options.length - 1,
            },
            (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        this.editTask();
                        break;
                    case 1:
                        this.showQuestionnaire();
                        break;
                    case 2:
                        this.cancelTask();
                        break;
                }
            });
    };

    editTask = () => {
        this.navigateTo('EditTask', {
            task: this.props.navigation.getParam('task', null),
            updateTask: this.updateTask,
        });
    };

    showQuestionnaire = () => {
        this.navigateTo('Questionnaire', {
            task: this.props.navigation.getParam('task', null),
            updateTask: this.updateTask,
        });
    };

    updateTask = async (task) => {
        await this.setState({
            task: task,
        });

        const refresh = this.props.navigation.getParam('refresh', null);
        refresh && refresh();
    };

    deleteTask = async () => {
        let task: Task = this.state.task;
        task.status = Status.REVOKED;
        this.setState({loading: true});
        const request: APIRequest = await this.api.updateTask(task);
        this.setState({loading: false});
        if (request.success) {
            const refresh = this.props.navigation.getParam('refresh', null);
            refresh && refresh();
            this.pop();
        } else {
            this.showError(result.data);
        }
    }

    cancelTask = () => {
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
                    let task: Task = this.state.task;
                    task.status = Status.REVOKED;
                    this.setState({loading: true});
                    const request: APIRequest = await this.api.updateTask(task);
                    this.setState({loading: false});
                    if (request.success) {
                        const refresh = this.props.navigation.getParam('refresh', null);
                        refresh && refresh();
                        this.pop();
                    } else {
                        this.showError(result.data);
                    }
                },
            }
        ]);
    }

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {

        const task: Task = this.state.task;

        return (

            <View style={commonStyles.screenContainer} onPress={Keyboard.dismiss}>
                {task &&
                <Container>
                    <Content bounces={false}>
                        <View style={{flex: 1, margin: 10, alignItems: 'center', flexDirection: 'row'}}>
                            <Image source={TaskRenderer.statusImage[task.status]}/>
                            <Text style={[commonStyles.mainColorTitle, {marginHorizontal: 10, flex: 1}]}
                                  numberOfLines={3}>{task.text}</Text>
                        </View>
                        <List>
                            <ListItemContainer>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.taskId}</Text>
                                    <Text style={[{flex: 1}, commonStyles.formItemText]}>{task.id}</Text>
                                </Body>
                            </ListItemContainer>

                            <ListItemContainer>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.created}</Text>
                                    <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                        {
                                            task.openDate ?
                                                moment(task.openDate).format(
                                                    uses24HourClock() ?
                                                        'ddd, MMM DD YYYY HH:mm' :
                                                        'ddd, MMM DD YYYY hh:mm A'
                                                ) : ''
                                        }
                                    </Text>
                                </Body>
                            </ListItemContainer>

                            <ListItemContainer>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.requester}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{task.requester?.fullName}</Text>
                                </Body>
                            </ListItemContainer>

                            <ListItemContainer>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.patient}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{task.patient?.fullName}</Text>
                                </Body>
                            </ListItemContainer>

                            <ListItemContainer>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.priority}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{strings.Priorities[task.priority]}</Text>
                                </Body>
                            </ListItemContainer>

                            <ListItemContainer>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.schedule}</Text>
                                    {
                                        task.visit && task.visit.start && task.visit.end ?
                                            <Text style={[{flex: 1}, commonStyles.formItemText]}>{
                                                moment(task.visit.start).format(
                                                    uses24HourClock() ? 'ddd, MMM-DD-YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A'
                                                ) +
                                                moment(task.visit.end).format(
                                                    uses24HourClock() ? ' - HH:mm' : ' - hh:mm A'
                                                )}
                                            </Text>

                                            : <Text style={[commonStyles.smallContentText, commonStyles.bold, {
                                                textAlign: 'center',
                                                flex: 1,
                                                color: '#FF0000'
                                            }]}>
                                                {strings.Tasks.noSchedule?.toUpperCase()}
                                            </Text>
                                    }
                                </Body>
                            </ListItemContainer>

                            <ListItemContainer>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.performer}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{task.performer?.fullName}</Text>
                                </Body>
                            </ListItemContainer>

                            <ListItemContainer>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.notes}</Text>
                                    <Text style={[{flex: 1}, commonStyles.formItemText]}>{task.notes}</Text>
                                </Body>
                            </ListItemContainer>
                        </List>
                        <View style={{alignItems: 'flex-end', marginTop: 10,}}>
                            <Image source={require('../../assets/icons/tasks/care.png')}/>
                        </View>
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
