import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Dimensions,
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
import {Visit} from '../../models/Visit';
import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorageConsts} from '../../support/Consts';
import TaskRenderer from './TaskRenderer';
import FlagRenderer from '../patients/patient/flags/FlagRenderer';
import ListItemContainer from '../other/ListItemContainer';
import APIRequest from '../../models/APIRequest';
import Modal, { ModalContent, ModalTitle } from 'react-native-modals';
import ImageView from 'react-native-image-view';
import Image from 'react-native-scalable-image';

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
        showFullNote: false,
        isSupportingInfoViewVisible: false,
        selectedSupportingInfoIndex: 0,
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
            //... this.settings.qaMode ? [strings.Task.menuDelete] : [],
            strings.Common.cancelButton,
        ];

        ActionSheet.show({
                options: options,
                destructiveButtonIndex: options.length - 2,
                cancelButtonIndex: options.length - 1,
            },
            (buttonIndex) => {
                let button = options[buttonIndex];
                switch (button) {
                    case strings.Task.menuEdit:
                        this.editTask();
                        break;
                    case strings.Task.menuExecute:
                        this.showQuestionnaire();
                        break;
                    case strings.Task.menuCancel:
                        this.cancelTask();
                        break;
                    case strings.Task.menuDelete:
                        this.deleteTask();
                        break;
                }
            });
    };

    editTask = () => {
        this.navigateTo('EditTask', {
            task: this.state.task,
            updateTask: this.updateTask,
        });
    };

    showQuestionnaire = () => {
        this.navigateTo('Questionnaire', {
            task: this.state.task,
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

    cancelTask = async () => {
        this.showAlert(strings.Task.cancelTask, null, [
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
    };

    deleteTask = () => {
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
                    this.setState({loading: true});
                    const request: APIRequest = await this.api.deleteTask(task);
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
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {
        const task: Task = this.state.task;

        let supportingInfo = task.supportingInfo?.map(uri => {
            return {
                source: {
                    uri: uri
                }
            }
        });

        console.log(task);

        return (

            <View style={commonStyles.screenContainer} onPress={Keyboard.dismiss}>
                {task &&
                <Container>
                    <View style={{margin: 10, alignItems: 'center', flexDirection: 'row'}}>
                        <Image height={24} source={TaskRenderer.statusImage[task.status]}/>
                        <Text style={[commonStyles.mainColorTitle, {marginHorizontal: 10, flex: 1}]}
                              numberOfLines={3}>{task.text}</Text>
                    </View>
                    <Content bounces={false}>

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
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.status}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{strings.Statuses[task.status]}</Text>
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

                            {supportingInfo && supportingInfo.length > 0 &&
                                <ListItemContainer>
                                    <Body>
                                        <Text
                                            style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.supportingInfo}</Text>
                                        <ImageView
                                            images={supportingInfo}
                                            imageIndex={this.state.selectedSupportingInfoIndex}
                                            isVisible={this.state.isSupportingInfoViewVisible}
                                            onClose={() => this.setState({isSupportingInfoViewVisible: false})}
                                        />
                                        <Content horizontal style={{flexDirection: 'row', padding: 0, marginHorizontal: 10}}
                                                 bounces={false}>
                                            {
                                                task.supportingInfo.map((url, index) => {
                                                    return(
                                                        <TouchableOpacity key={index} style={{marginRight: 10,}} onPress={() => {
                                                            this.setState({
                                                                isSupportingInfoViewVisible: true,
                                                                selectedSupportingInfoIndex: index,
                                                            })
                                                        }}>
                                                            <Image height={100} style={{marginTop: 10,}}
                                                                   source={{uri: url}}
                                                                   resizeMode="contain"
                                                            />
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                        </Content>
                                    </Body>
                                </ListItemContainer>
                            }

                            <ListItemContainer disabled={!task.notes || task.notes.isEmpty()} onPress={() => {
                                this.setState({showFullNote: true})
                            }}>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.notes}</Text>
                                        <Text>{task.notes && task.notes.length >= 80 ? `${task.notes.substring(0, 77)}...` : task.notes}</Text>
                                </Body>
                                <Modal
                                    visible={this.state.showFullNote}
                                    rounded={false}
                                    onHardwareBackPress={ () => {
                                        this.setState({ showFullNote: false });
                                        return true;
                                    }}
                                    onTouchOutside={() => {
                                        this.setState({ showFullNote: false });
                                    }}
                                    modalTitle={
                                        <ModalTitle
                                            style={{borderBottomWidth: 0, backgroundColor: '#FFFFFF'}}
                                            textStyle={commonStyles.mainColorTitle}
                                            title={strings.Task.notes}
                                        />
                                    }
                                >
                                    <ModalContent>
                                        <View style={{
                                            marginTop: 10,
                                            width: Dimensions.get('window').width * 0.7,
                                            height: Dimensions.get('window').height * 0.5,
                                        }}>
                                            <ScrollView style={{flex: 1}}>
                                                <TouchableWithoutFeedback>
                                                    <Text>{task.notes}</Text>
                                                </TouchableWithoutFeedback>
                                            </ScrollView>
                                        </View>
                                    </ModalContent>
                                </Modal>
                            </ListItemContainer>

                            <ListItemContainer>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.patientInstruction}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{task.patientInstruction}</Text>
                                </Body>
                            </ListItemContainer>

                            {task.details &&
                                <ListItemContainer>
                                    <Body>
                                        <Text
                                            style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Task.taskDetails}</Text>
                                        <Text
                                            style={[{flex: 1}, commonStyles.formItemText]}>{task.details}</Text>
                                    </Body>
                                </ListItemContainer>
                            }

                        </List>
                    </Content>
                    <View style={{flexDirection: 'row', padding: 5}}>
                        <View style={{flex: 1, alignItems: 'center'}}>
                            <Button
                                style={{
                                    backgroundColor: 'white',
                                    width: 230,
                                    borderColor: appColors.mainColor,
                                    borderWidth: 1,
                                    justifyContent: 'center'
                                }} onPress={this.showQuestionnaire}>
                                <Text
                                    style={[commonStyles.buttonText, {color: appColors.mainColor}]}>{strings.Task.menuExecute?.toUpperCase()}</Text>
                            </Button>
                        </View>
                        <Image height={50} source={require('../../assets/icons/tasks/care.png')}/>
                    </View>
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
