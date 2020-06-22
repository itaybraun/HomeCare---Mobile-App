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
import {QuestionnaireItem} from '../../../../models/Questionnaire';

export default class QuestionnaireItemView extends React.Component {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    state = {
        item: this.props.item,
        value: this.props.value,
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    submit = async () => {
        this.props.submit && this.props.submit(this.state.value);
    };

    focus = () => {
        this.textInput && this.textInput.focus();
    };

    select = async (value) => {
        await this.setState({value: value});
        this.submit();
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
            case 'choice':
                return this.renderChoice(item);
            case 'integer':
                return this.renderInteger(item);
            case 'decimal':
                return this.renderDecimal(item);
            case 'string':
                return this.renderString(item);
        }
    };

    renderChoice = (item: QuestionnaireItem) => {
        return (
            <View style={{marginTop: 20}}>
                {
                    item.options && item.options.map(option => {
                        return (
                            <TouchableOpacity key={option.id} onPress={async () => {
                                await this.setState({value: option});
                                this.props.updateValue && this.props.updateValue(option);
                                this.submit();
                            }}>
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
        )
    };

    renderInteger = (item: QuestionnaireItem) => {
        return (
            <FormItemContainer style={{marginTop: 20}}>
                <TextInput
                    ref={ref => this.textInput = ref}
                    style={{fontSize: 18, minHeight: 50, paddingHorizontal: 5,}}
                    keyboardType='numeric'
                    onSubmitEditing={this.submit}
                    returnKeyType='done'
                    value={this.state.value}
                    onChangeText={async text => {
                        text = text.isEmpty() ? null : text;
                        await this.setState({value: text});
                        this.props.updateValue && this.props.updateValue(text);
                    }}
                />
            </FormItemContainer>
        )
    };

    renderDecimal = (item: QuestionnaireItem) => {
        return (
            <FormItemContainer style={{marginTop: 20}}>
                <TextInput
                    ref={ref => this.textInput = ref}
                    style={{fontSize: 18, minHeight: 50, paddingHorizontal: 5,}}
                    keyboardType='numeric'
                    onSubmitEditing={this.submit}
                    value={this.state.value}
                    onChangeText={text => {
                        text = text.isEmpty() ? null : text;
                        this.setState({value: text});
                        this.props.updateValue && this.props.updateValue(text);
                    }}
                />
            </FormItemContainer>
        )
    };

    renderString = (item: QuestionnaireItem) => {
        return (
            <FormItemContainer style={{marginTop: 20}}>
                <TextInput
                    ref={ref => this.textInput = ref}
                    style={{fontSize: 18, minHeight: 50, paddingHorizontal: 5, maxHeight: 200}}
                    autoCorrect={false}
                    multiline={true}
                    value={this.state.value}
                    onChangeText={text => {
                        text = text.isEmpty() ? null : text;
                        this.setState({value: text});
                        this.props.updateValue && this.props.updateValue(text);
                    }}
                />
            </FormItemContainer>
        )
    };

    render() {

        const item: QuestionnaireItem = this.state.item;

        if (!item) {
            return null;
        }

        return (
            <View>
                <Text
                    style={[commonStyles.titleText, this.props.error && {color: appColors.errorColor}]}>
                    {item.text}
                </Text>
                {this.renderItem()}
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
