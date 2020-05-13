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
import {QuestionnaireItem} from '../../../models/Questionnaire';
import ListItemContainer from '../../other/ListItemContainer';

export default class QuestionnaireChoiceItemScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: '', //strings.Task.patient,
            headerBackTitle: ' ',
            ...popupNavigationOptions,
            ...TransitionPresets.SlideFromRightIOS,
            headerLeft: () => {
                return (
                    <TouchableOpacity style={{paddingHorizontal: 12}} onPress={navigation.getParam('cancel')}>
                        <Text style={[commonStyles.mainColorTitle, commonStyles.medium]}>{strings.Common.cancelButton}</Text>
                    </TouchableOpacity>
                )
            },
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

    submit = async () => {
        const updateValue = this.props.navigation.getParam('updateValue', null);
        updateValue && updateValue(this.state.value);
        this.pop();
    };

    select = async (value) => {
        await this.setState({value: value});
        this.submit();
    };

    cancel = () => {
        this.pop();
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {

        const item: QuestionnaireItem = this.state.item;

        if (!item) {
            return null;
        }


        return (
            <View style={[commonStyles.screenContainer, {padding: 20}]} onPress={Keyboard.dismiss}>
                <Text style={commonStyles.titleText}>{item.text}</Text>
                <View style={{marginTop: 20}}>
                    <View>
                        {
                            item.options && item.options.map(option => {
                                return (
                                    <TouchableOpacity key={option.id} onPress={() => this.select(option)}>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            {renderRadioButton(this.state.value === option)}
                                            <Text style={[commonStyles.formItemText, {marginLeft: 10}]}>{option.text}</Text>
                                        </View>
                                        {renderSeparator()}
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
