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
import {Button, Form, Icon, Text, Textarea} from 'native-base';
import {TransitionPresets} from 'react-navigation-stack';

export default class SelectSomethingScreen extends AppScreen {

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
        loading: false,
        somethings: [],
        selectedSomething: this.props.navigation.getParam('selectedSomething', null),
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();

        this.props.navigation.setParams({
            done: this.submit,
            cancel: this.cancel,
            hideTabBar: true,
        });
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        this.setState({loading: true});
        const somethings = await this.getSomethings();
        this.setState({...somethings, loading: false});
    };

    getSomethings = async () => {

        // let result: APIRequest = await this.api.getPatients();
        // if (result.success) {
        //     return {somethings: result.data};
        // } else {
        //     this.showError(result.data);
        //     return {somethings: []};
        // }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    submit = async () => {
        const updateSomething = this.props.navigation.getParam('updateSomething', null);
        updateSomething && updateSomething(this.state.selectedSomething);
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
                    this.state.somethings.map((something, index) => {

                        return(
                            <TouchableOpacity
                                key={index}
                                onPress={() => this.setState({
                                    selectedSomething: something,
                                })}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    {renderRadioButton(this.state.selectedSomething === something)}
                                    <Text style={[commonStyles.contentText, {flex: 1, marginLeft: 10}]}>{something}</Text>
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
