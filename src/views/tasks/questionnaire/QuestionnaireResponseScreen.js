import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Text,
    Image,
    ActivityIndicator,
    TextInput,
    Platform, TouchableWithoutFeedback,
} from 'react-native';
import AppScreen from '../../../support/AppScreen';
import {appColors, commonStyles, renderLoading, renderRadioButton} from '../../../support/CommonStyles';
import {strings} from '../../../localization/strings';
import {Task} from '../../../models/Task';
import {Questionnaire, QuestionnaireItem, QuestionnaireResponse} from '../../../models/Questionnaire';
import {Content, List, Body, Icon, ActionSheet} from 'native-base';
import moment from 'moment';
import FormItemContainer from '../../other/FormItemContainer';
import ImageView from 'react-native-image-view';
import {uses24HourClock} from "react-native-localize";
import ListItemContainer from '../../other/ListItemContainer';

export default class QuestionnaireResponseScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.QuestionnaireResponse.completedTask,
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
        task: null,
        response: null,
        isImageViewVisible: false,
        selectedImageIndex: 0,
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();

        this.props.navigation.setParams({
            showMenu: this.showMenu,
        });
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        this.setState({loading: true});
        let task: Task = this.props.navigation.getParam('task', null);
        let response: QuestionnaireResponse = this.props.navigation.getParam('response', null);
        if (!task || !response) {
            this.showAlert(strings.QuestionnaireResponse.responseNotFound);
            this.pop();
            this.setState({loading: false});
            return;
        }

        this.setState({task: task, response: response, loading: false});
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    showMenu = () => {
        let options = [
            strings.Task.menuSendMail,
            strings.Common.cancelButton
        ];

        ActionSheet.show({
                options: options,
                cancelButtonIndex: options.length - 1,
            },
            (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        if (this.settings.email) {
                            this.navigateTo('TaskSendMail', {
                                task: this.state.task,
                                response: this.state.response,
                            });
                        } else {
                            this.showAlert(strings.Task.noEmailToSend);
                        }
                        break;
                }
            });
    };

    showImage = (url, index) => {
        this.setState({
            isImageViewVisible: true,
            selectedImageIndex: index,
        })
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderResponseItem = (item) => {
        switch(item.type) {
            case 'group':
                return this.renderGroup(item);
            case 'choice':
            case 'integer':
            case 'decimal':
            case 'string':
            case 'boolean':
                return this.renderAnswer(item);
            case 'url':
                return this.renderImage(item);
        }
    };

    renderGroup = (item: QuestionnaireItem) => {
        return (
            <View key={item.link}>
                <Text style={[commonStyles.boldTitleText, {paddingLeft: 20}]}>
                    {item.text}
                </Text>
                <List style={{paddingBottom: 20}}>
                {item.items && item.items.length > 0 &&
                    <View>
                        {item.items.map(item => this.renderResponseItem(item))}
                    </View>
                }
                </List>
            </View>
        )
    };

    renderAnswer = (item: QuestionnaireItem) => {
        return (
            <ListItemContainer key={item.link}>
                <Body>
                    <View style={{minHeight: 45, justifyContent: 'center'}}>
                        <Text style={[commonStyles.smallInfoText]}>{item.text}</Text>
                        {
                            item.answers?.map((text, index) => {
                                return(
                                    <View key={item.link+index} style={{paddingTop: 5}}>
                                        <TouchableWithoutFeedback onPress={() => {}}>
                                            <TextInput
                                                style={[commonStyles.formItemText, {padding: 0}]}
                                                editable={false}
                                                scrollEnabled={false}
                                                multiline
                                                selectTextOnFocus
                                            >
                                                <Text>{text.toString()}</Text>
                                            </TextInput>
                                        </TouchableWithoutFeedback>

                                    </View>
                                );
                            })
                        }
                    </View>
                </Body>

            </ListItemContainer>
        );
    };

    renderImage = (item: QuestionnaireItem) => {

        if (!item.answers || item.answers.length === 0) {
            return null;
        }

        let images = item.answers.map(uri => {
            return {
                source: {
                    uri: uri
                }
            }
        });

        return (
            <ListItemContainer key={item.link}>
                <Body>
                    <View style={{minHeight: 45, justifyContent: 'center'}}>
                        <Text style={commonStyles.smallInfoText}>{item.text}</Text>
                        <ImageView
                            images={images}
                            imageIndex={this.state.selectedImageIndex}
                            isVisible={this.state.isImageViewVisible}
                            onClose={() => this.setState({isImageViewVisible: false})}
                        />


                        <Content horizontal style={{flexDirection: 'row', padding: 0, marginHorizontal: 10}}
                                 bounces={false}>
                            {
                                item.answers.map((url, index) => {
                                    return(
                                        <TouchableOpacity key={item.link + index} style={{marginRight: 10,}} onPress={() => this.showImage(url, index)}>
                                            <Image key={item.link+index}
                                                   style={{width: 64, height: 64, marginTop: 10,}}
                                                   source={{uri: url}}
                                            />
                                        </TouchableOpacity>
                                    );
                                })}
                        </Content>
                    </View>
                </Body>
            </ListItemContainer>
        );
    };

    render() {

        const task: Task = this.state.task;
        const response: QuestionnaireResponse = this.state.response;

        if (!response || !task) {
            return null;
        }

        return (
            <View style={commonStyles.screenContainer}>
                <Content innerRef={ref => this.scrollView = ref}
                         bounces={false}>
                    <View style={{flex: 1, padding: 10, flexDirection: 'row', alignItems:'center'}}>
                        <Image source={require('../../../assets/icons/tasks/completed_task.png')} style={{width: 48, height: 48}} />
                        <View style={{flex: 1, marginLeft: 10}}>
                            <Text
                                style={[commonStyles.contentText]}
                                numberOfLines={2}>
                                {task.text}
                            </Text>
                            <View style={{flexDirection: 'row', justifyContent: 'flex-end', flex: 1, marginTop: 5}}>
                                {
                                    response.author &&
                                    <Text style={[commonStyles.smallInfoText, {flex: 1, marginRight: 10,}]} numberOfLines={1}>
                                        {
                                            response.author.fullName
                                        }
                                    </Text>
                                }
                                {
                                    task.executionDate &&
                                    <Text style={[commonStyles.smallInfoText, {textAlign: 'right'}]}>
                                        {
                                            task.executionDate &&
                                            moment(task.executionDate).format(
                                                uses24HourClock() ? 'MMM DD YYYY, HH:mm' : 'MMM-DD-YYYY, hh:mm A')
                                        }
                                    </Text>
                                }
                            </View>
                        </View>
                    </View>
                    <View>
                        {response.items.map(item => this.renderResponseItem(item))}
                    </View>
                </Content>
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
