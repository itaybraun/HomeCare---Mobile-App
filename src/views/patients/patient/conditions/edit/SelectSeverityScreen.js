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
import AppScreen from '../../../../../support/AppScreen';
import {
    appColors,
    commonStyles, popupNavigationOptions,
    renderDisclosureIndicator,
    renderLoading, renderRadioButton,
    renderSeparator,
} from '../../../../../support/CommonStyles';
import {strings} from '../../../../../localization/strings';
import {Button, Form, Icon, Text, Textarea} from 'native-base';
import {TransitionPresets} from 'react-navigation-stack';

export default class SelectSeverityScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Conditions.severity,
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
            headerRight: () => {
                return (
                    <TouchableOpacity style={{paddingHorizontal: 12}} onPress={navigation.getParam('done')}>
                        <Text style={[commonStyles.mainColorTitle, commonStyles.medium]}>{strings.Common.doneButton}</Text>
                    </TouchableOpacity>
                )
            }
        }
    };

    severities = [
        {key: 'Severe', label: strings.Severity.severe},
        {key: 'Moderate', label: strings.Severity.moderate},
        {key: 'Mild', label: strings.Severity.mild},
    ];

    state = {
        loading: false,
        severities: this.severities,
        selectedSeverity: this.props.navigation.getParam('selectedSeverity', null),
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.props.navigation.setParams({
            done: this.submit,
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
        const updateSeverity = this.props.navigation.getParam('updateSeverity', null);
        updateSeverity && updateSeverity(this.state.selectedSeverity);
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
                {
                    this.state.severities.map((severity, index) => {

                        return(
                            <TouchableOpacity
                                key={index}
                                onPress={() => this.setState({
                                    selectedSeverity: severity.key,
                                })}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    {renderRadioButton(this.state.selectedSeverity === severity.key)}
                                    <Text style={[commonStyles.contentText, {flex: 1, marginLeft: 10}]}>{severity.label}</Text>
                                </View>
                                {renderSeparator()}
                            </TouchableOpacity>
                        );
                    })
                }
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
