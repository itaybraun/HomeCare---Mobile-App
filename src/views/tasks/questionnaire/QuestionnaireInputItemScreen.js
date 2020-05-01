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
import AppScreen from '../../../support/AppScreen';
import {
    appColors,
    commonStyles, popupNavigationOptions,
    renderDisclosureIndicator,
    renderLoading, renderRadioButton,
    renderSeparator,
} from '../../../support/CommonStyles';
import {strings} from '../../../localization/strings';
import {Body, Button, Form, Icon, Right, Text, Textarea} from 'native-base';
import FormItemContainer from '../../other/FormItemContainer';
import {Priority, Task} from '../../../models/Task';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import {TransitionPresets} from 'react-navigation-stack';
import {APIRequest} from '../../../api/API';
import {QuestionnaireItem} from '../../../models/Questionnaire';
import ListItemContainer from '../../other/ListItemContainer';

export default class QuestionnaireItemScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: '', //strings.Task.patient,
            headerBackTitle: ' ',
            ...popupNavigationOptions,
            ...TransitionPresets.SlideFromRightIOS,
            headerRight: () => {
                return (
                    <TouchableOpacity style={{paddingHorizontal: 12}} onPress={navigation.getParam('done')}>
                        <Text style={[commonStyles.questionnaireTitle, commonStyles.medium]}>{strings.Common.doneButton}</Text>
                    </TouchableOpacity>
                )
            }
        }
    };

    state = {
        item: this.props.navigation.getParam('item', null),
        value: this.props.navigation.getParam('value', null),
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.props.navigation.setParams({
            done: this.submit,
            hideTabBar: true,
        });

        this.textInput && this.textInput.focus();
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    submit = async () => {
        const updateValue = this.props.navigation.getParam('updateValue', null);
        updateValue && updateValue(this.state.value);
        this.pop();
    };

    cancel = () => {
        this.pop();
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderItem = () => {
        const item: QuestionnaireItem = this.state.item;

        if (!item) {
            return null;
        }

        switch(item.type) {
            case 'integer':
                return this.renderInteger(item);
            case 'decimal':
                return this.renderDecimal(item);
            case 'string':
                return this.renderString(item);
        }
    };

    renderInteger = (item: QuestionnaireItem) => {
        return (
            <TextInput
                ref={ref => this.textInput = ref}
                style={{fontSize: 18, minHeight: 50, paddingHorizontal: 5,}}
                keyboardType='numeric'
                onSubmitEditing={this.submit}
                returnKeyType='done'
                value={this.state.value}
                onChangeText={text => {
                    text = text.isEmpty() ? null : text;
                    this.setState({value: text});
                }}
            />
        )
    };

    renderDecimal = (item: QuestionnaireItem) => {
        return (
            <TextInput
                ref={ref => this.textInput = ref}
                style={{fontSize: 18, minHeight: 50, paddingHorizontal: 5,}}
                keyboardType='numeric'
                returnKeyType='done'
                onSubmitEditing={this.submit}
                value={this.state.value}
                onChangeText={text => {
                    text = text.isEmpty() ? null : text;
                    this.setState({value: text});
                }}
            />
        )
    };

    renderString = (item: QuestionnaireItem) => {
        return (
            <TextInput
                ref={ref => this.textInput = ref}
                style={{fontSize: 18, minHeight: 50, paddingHorizontal: 5, maxHeight: 200}}
                autoCorrect={false}
                multiline={true}
                returnKeyType='done'
                value={this.state.value}
                onChangeText={text => {
                    text = text.isEmpty() ? null : text;
                    this.setState({value: text});
                }}
            />
        )
    };

    render() {

        const item: QuestionnaireItem = this.state.item;

        if (!item) {
            return null;
        }


        return (
            <View style={[commonStyles.screenContainer, {padding: 20}]} onPress={Keyboard.dismiss}>
                <Text style={commonStyles.titleText}>{item.text}</Text>
                <FormItemContainer style={{marginTop: 20}} error={this.state.error}>
                    {this.renderItem()}
                </FormItemContainer>
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
