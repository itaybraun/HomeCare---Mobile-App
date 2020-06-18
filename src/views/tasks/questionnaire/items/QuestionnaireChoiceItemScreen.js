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
import AppScreen from '../../../../support/AppScreen';
import {
    appColors,
    commonStyles, popupNavigationOptions,
    renderDisclosureIndicator,
    renderLoading, renderRadioButton,
    renderSeparator,
} from '../../../../support/CommonStyles';
import {strings} from '../../../../localization/strings';
import {Body, Button, Form, Icon, Right, Text, Textarea} from 'native-base';
import {TransitionPresets} from 'react-navigation-stack';
import {QuestionnaireItem} from '../../../../models/Questionnaire';
import QuestionnaireInputItemView from './QuestionnaireItemView';
import QuestionnaireItemView from './QuestionnaireItemView';

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

    submit = async (value) => {
        const updateValue = this.props.navigation.getParam('updateValue', null);
        updateValue && updateValue(value);
        this.pop();
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
                <QuestionnaireItemView
                    value={this.state.value}
                    item={this.state.item}
                    submit={this.submit}
                    updateValue={(value) => this.setState({
                        value: value
                    })}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
