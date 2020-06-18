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
import FormItemContainer from '../../../other/FormItemContainer';
import {TransitionPresets} from 'react-navigation-stack';
import {QuestionnaireItem} from '../../../../models/Questionnaire';
import QuestionnaireItemView from './QuestionnaireItemView';

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

        this.inputView && this.inputView.focus();
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

    render() {

        const item: QuestionnaireItem = this.state.item;

        if (!item) {
            return null;
        }


        return (
            <View style={[commonStyles.screenContainer, {padding: 20}]} onPress={Keyboard.dismiss}>
                <QuestionnaireItemView
                    ref={ref => this.inputView = ref}
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
