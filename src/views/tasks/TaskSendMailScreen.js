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
import {Body, Button, Container, Content, Form, Icon, Right, Text, Textarea} from 'native-base';

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

    sendMail = () => {

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
