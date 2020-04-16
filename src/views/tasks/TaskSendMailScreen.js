import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity, Image,
} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {
    appColors,
    commonStyles, popupNavigationOptions,
} from '../../support/CommonStyles';
import {strings} from '../../localization/strings';
import {Body, Button, Container, Content, Toast, Icon, Right, Text, Textarea} from 'native-base';
import { sendGridEmail } from 'react-native-sendgrid'
import {Task} from '../../models/Task';
import {QuestionnaireItem, QuestionnaireResponse} from '../../models/Questionnaire';
import WebView from 'react-native-webview';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";

export default class TaskSendMailScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Task.menuSendMail,
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
        task: this.props.navigation.getParam('task', null),
        response: this.props.navigation.getParam('response', null),
        source: '',
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.props.navigation.setParams({
            cancel: this.cancel,
            hideTabBar: true,
        });
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    cancel = () => {
        this.pop();
    };

    getBody = () => {

        const task: Task = this.state.task;
        const response: QuestionnaireResponse = this.state.response;

        function getItemText(item: QuestionnaireItem) {
            switch(item.type) {
                case 'group':
                    return `<div style="font-size: 22px; color: ${appColors.questionnaireColor}"">${item.text}</div>
${item.items.map(item => getItemText(item)).join('')}`;
                case 'choice':
                case 'integer':
                case 'decimal':
                case 'string':
                case 'boolean':
                    return `<div style="font-size: 22px">${item.text}: <strong>${item.answers.join(", ")}</strong></div>`;
                case 'url':
                    return `<div style="font-size: 22px">${item.text}:<br />${item.answers.map(src => {
                        return (
                        `<a href="${src}"><img width="128" height="128" src=${src} /></a>`
                        )
                    }).join("&nbsp;")}</div>`;
            }
        };


        let text = `
            <div style="font-size: 22px; font-weight: bold">${strings.Task.task}</div>
            <div style="font-size: 22px; color: ${appColors.questionnaireColor}">${strings.Task.taskName}: ${task.text}</div>
            <div style="font-size: 22px;">${strings.PatientTasks.executionDate}: ${moment(task.executionDate).format(
            uses24HourClock() ? 'ddd, MMM DD YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A')}</div>
            
            <br />
            
            <div style="font-size: 22px; font-weight: bold">${strings.Task.patient}</div>
            <div style="font-size: 22px;">${strings.General.firstName}: ${task.patient.firstName}</div>
            <div style="font-size: 22px;">${strings.General.lastName}: ${task.patient.lastName}</div>
            <div style="font-size: 22px;">${strings.General.identity}: ${task.patient.identifier ? task.patient.identifier : ''}</div>
            <div style="font-size: 22px;">${strings.General.address}: ${task.patient.simpleAddress}</div>
            
            <br />
            
            <div style="font-size: 22px; font-weight: bold">${strings.Questionnaire.practitioner}</div>
            <div style="font-size: 22px;">${strings.General.fullName}: ${task.performer.fullName}</div>
            <div style="font-size: 22px;">${strings.General.role}: ${task.performer.role}</div>
            <div style="font-size: 22px;">${strings.General.license}: ${task.performer.license ? task.performer.license : ''}</div>
            
            <br />
            
            <div style="font-size: 22px; font-weight: bold">${strings.Task.executionDetails}</div>
            
            ${response.items.map(item => getItemText(item)).join('')}
        `;

        return text;
    };

    sendMail = async () => {
        try {
            const sendRequest = await sendGridEmail(
                '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',
                this.settings.email,
                'noreply@hestia.com',
                `Task Completion Form - ${this.state.task.text}`,
                this.getBody(),
                "text/html"
            );
            //this.setState({source: this.getBody()});
            Toast.show({
                duration: 2000,
                text: strings.Task.mailSent,
                textStyle: {flex: 1, textAlign: 'center'},
                onClose: () => this.pop(),
            });

        } catch (error) {
            alert(error.message);
            console.log(error);
        }
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {
        return (
            <View style={[commonStyles.screenContainer, {padding: 20}]}>
                <Container>
                    <Content bounces={false} contentContainerStyle={{flexGrow: 1}}>
                        <Text style={commonStyles.contentText}>{strings.Task.sendText}</Text>
                        <Text style={[commonStyles.contentText, {color: appColors.questionnaireColor}]}>{this.settings.email}</Text>
                        <View style={{marginTop: 60, alignItems: 'center'}}>
                            <Button style={{
                                backgroundColor: appColors.secondColor,
                                width: 230,
                                justifyContent: 'center',
                                borderColor: appColors.mainColor,
                                borderWidth: 1,
                            }} onPress={this.sendMail}>
                                <Text style={[commonStyles.buttonText, {color: appColors.mainColor}]}>{strings.Common.sendButton?.toUpperCase()}</Text>
                            </Button>
                        </View>
                        <WebView source={{html: this.state.source}} />
                        <View style={{flex: 1, justifyContent: 'flex-end'}}>
                            <View style={{alignSelf: 'flex-end', marginTop: 10,}}>
                                <Image source={require('../../assets/icons/tasks/new_task.png')}/>
                            </View>
                            <Text style={[commonStyles.smallInfoText, {textAlign: 'center', marginTop: 10}]}>{strings.Task.sendInfo}</Text>
                        </View>
                    </Content>
                </Container>
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
