import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Keyboard, ScrollView,
} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {
    appColors,
    commonStyles, popupNavigationOptions,
    renderDisclosureIndicator,
    renderLoading, renderRadioButton,
    renderSeparator,
} from '../../support/CommonStyles';
import {strings} from '../../localization/strings';
import FormItemContainer from './FormItemContainer';
import {Button, Form, Icon, Text, Textarea} from 'native-base';
import {TransitionPresets} from 'react-navigation-stack';

export default class SelectTextScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('title', null),
            headerBackTitle: ' ',
            ...popupNavigationOptions,
            ...TransitionPresets.SlideFromRightIOS,
            headerRight: () => {
                return (
                    <TouchableOpacity style={{paddingHorizontal: 12}} onPress={navigation.getParam('done')}>
                        <Text style={[commonStyles.mainColorTitle, commonStyles.medium]}>{strings.Common.doneButton}</Text>
                    </TouchableOpacity>
                )
            }
        }
    };

    state = {
        text: this.props.navigation.getParam('text', null),
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

        setTimeout(() => {
            this.textInput && this.textInput.focus();
        }, 100);
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    submit = async () => {
        const updateText = this.props.navigation.getParam('updateText', null);
        const text = this.state.text.trim();
        updateText && updateText(text);
        this.pop();
    };

    cancel = () => {
        this.pop();
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {


        return (
            <View style={[commonStyles.screenContainer, {padding: 20}]} onPress={Keyboard.dismiss}>
                <FormItemContainer style={{marginTop: 20}} error={this.state.error}>
                    <TextInput
                        ref={ref => this.textInput = ref}
                        style={{fontSize: 18, padding: 5,}}
                        autoCorrect={false}
                        returnKeyType='done'
                        onSubmitEditing={this.submit}
                        multiline={true}
                        value={this.state.text}
                        onChangeText={text => this.setState({text: text})}
                    />
                </FormItemContainer>
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
