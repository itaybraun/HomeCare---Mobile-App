import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput, Text, Image, ActivityIndicator} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {appColors, commonStyles, renderLoading, renderRadioButton} from '../../support/CommonStyles';
import {strings} from '../../localization/strings';
import {Task} from '../../models/Task';
import {Questionnaire, QuestionnaireItem, QuestionnaireResponse} from '../../models/Questionnaire';
import {APIRequest} from '../../api/API';
import {Content, Icon} from 'native-base';
import moment from 'moment';
import FormItemContainer from '../other/FormItemContainer';
import ImageView from 'react-native-image-view';
import {uses24HourClock} from "react-native-localize";

export default class QuestionnaireResponseScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.QuestionnaireResponse.completedTask,
            headerBackTitle: ' ',
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

    showImage = (url, index) => {
        this.setState({
            isImageViewVisible: true,
            selectedImageIndex: index,
        })
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderResponseItem = (item, depth = 0) => {
        switch(item.type) {
            case 'group':
                return this.renderGroup(item, depth);
            case 'choice':
            case 'integer':
            case 'decimal':
            case 'string':
            case 'boolean':
                return this.renderAnswer(item, depth);
            case 'url':
                return this.renderImage(item);
        }
    };

    renderGroup = (item: QuestionnaireItem, depth = 0) => {
        depth++;
        return (
            <View key={item.link}>
                <View style={commonStyles.pinkHeader}>
                    <Text style={commonStyles.pinkHeaderText}>{item.text}</Text>
                </View>
                {
                    item.items && item.items.map(item => this.renderResponseItem(item, depth))
                }
            </View>
        )
    };

    renderAnswer = (item: QuestionnaireItem, depth = 0) => {
        return (
            <View key={item.link} style={[styles.answerContainer, {paddingHorizontal: 20 * depth, borderWidth: 0}]}>
                <Text style={[commonStyles.contentText]}>{item.text}</Text>
                {
                    item.answers?.map((text, index) => {
                        return(
                            <View key={item.link+index} style={{paddingTop: 5}}>
                                <Text style={commonStyles.infoText}>{text.toString()}</Text>
                            </View>
                        );
                    })
                }
            </View>
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
            <View key={item.link}>
                <View style={commonStyles.pinkHeader}>
                    <Text style={commonStyles.pinkHeaderText}>{item.text}</Text>
                </View>

                <ImageView
                    images={images}
                    imageIndex={this.state.selectedImageIndex}
                    isVisible={this.state.isImageViewVisible}
                    onClose={() => this.setState({isImageViewVisible: false})}
                />

                <View style={{flexDirection:'row', margin: 10, marginTop: 5}}>
                    {
                        item.answers.map((url, index) => {
                        return(
                            <TouchableOpacity key={item.link + index} style={{marginRight: 10,}} onPress={() => this.showImage(url, index)}>
                                <Image key={item.link+index}
                                       style={{width: 90, height: 70}}
                                       source={{url: url}} />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
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
                         enableResetScrollToCoords={false}
                         bounces={false}>
                    <View style={{flex: 1, padding: 10, flexDirection: 'row', alignItems:'center'}}>
                        <Image source={require('../../assets/icons/tasks/completed_task.png')} style={{width: 48, height: 48}} />
                        <View style={{flex: 1, marginLeft: 10}}>
                            <Text
                                style={[commonStyles.contentText]}
                                numberOfLines={2}>
                                {task.text}
                            </Text>
                            {
                                task.executionDate &&
                                <Text style={[commonStyles.smallInfoText, {marginTop: 5}]}>
                                    {
                                        task.executionDate &&
                                        moment(task.executionDate).format(
                                            uses24HourClock() ? 'ddd, MMM DD YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A')
                                    }
                                </Text>
                            }
                        </View>
                    </View>
                    {response.items.map(item => this.renderResponseItem(item))}
                </Content>
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    answerContainer: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
        paddingVertical: 10,
    }
});
