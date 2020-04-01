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
import {Button, Form, Icon, Card, Text} from 'native-base';
import FormItemContainer from '../other/FormItemContainer';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import {APIRequest} from '../../api/API';
import {Visit} from '../../models/Visit';
import ActionSheet from 'react-native-simple-action-sheet';
import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorageConsts} from '../../support/Consts';
import TaskRenderer from './TaskRenderer';

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

        //this.getData();

        this.props.navigation.setParams({
            showMenu: this.showMenu,
        });
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
        let result: APIRequest = await this.api.getTask(task.id);

        if (result.success) {
            task = result.data;
        }

        return {
            task: task,
        };
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    showMenu = () => {
        let options = [
            strings.Task.menuEdit,
            strings.Task.menuExecute,
            strings.Task.menuCancel,
        ];
        if (Platform.OS === 'ios')
            options.push(strings.Common.cancelButton);

        ActionSheet.showActionSheetWithOptions({
                options: options,
                cancelButtonIndex: options.length - 1,
            },
            (buttonIndex) => {
                console.log(buttonIndex);
            });
    };

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
        let result: APIRequest = await this.api.updateTask(task);
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

        const task: Task = this.state.task;


        return (

            <View style={commonStyles.screenContainer} onPress={Keyboard.dismiss}>
                {task &&
                <ScrollView
                    style={{flex: 1}}
                    contentContainerStyle={{padding: 10, paddingBottom: 0,}}
                    bounces={false}
                    automaticallyAdjustContentInsets={false}>
                    <Form>
                        <View style={{flex: 1, margin: 10, flexDirection: 'row'}}>
                            <Image source={TaskRenderer.statusImage[task.status]}/>
                            <Text style={[commonStyles.mainColorTitle, {marginHorizontal: 10, flex: 1}]}
                                  numberOfLines={3}>{task.text}</Text>
                        </View>

                        {
                            this.settings.qaMode &&
                            <FormItemContainer title={strings.Task.taskId}>
                                <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                    {task.id}
                                </Text>
                            </FormItemContainer>
                        }

                        <FormItemContainer title={strings.Task.created}>
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
                        </FormItemContainer>

                        <FormItemContainer title={strings.Task.requester}>
                            <Text style={[{flex: 1}, commonStyles.formItemText]}>{task.requester?.fullName}</Text>
                        </FormItemContainer>

                        <FormItemContainer title={strings.Task.priority}>
                            <Text
                                style={[{flex: 1}, commonStyles.formItemText]}>{strings.Priorities[task.priority]}</Text>
                        </FormItemContainer>

                        <FormItemContainer title={strings.Task.schedule}>
                            <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                {
                                    task.visit && task.visit.start && task.visit.end ?
                                        moment(task.visit.start).format(
                                            uses24HourClock() ? 'ddd, MMM-DD-YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A'
                                        ) +
                                        moment(task.visit.end).format(
                                            uses24HourClock() ? ' - HH:mm' : ' - hh:mm A'
                                        )

                                        : ''
                                }
                            </Text>
                        </FormItemContainer>

                        <FormItemContainer title={strings.Task.performer}>
                            <Text style={[{flex: 1}, commonStyles.formItemText]}>{task.performer?.fullName}</Text>
                        </FormItemContainer>

                        {
                            task.notes &&
                            <FormItemContainer title={strings.Task.notes}>
                                <Text style={[{flex: 1}, commonStyles.formItemText]}>{task.notes}</Text>
                            </FormItemContainer>
                        }

                        <View style={{alignItems: 'flex-end', marginTop: 10,}}>
                            <Image source={require('../../assets/icons/tasks/care.png')}/>
                        </View>
                    </Form>
                </ScrollView>
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
