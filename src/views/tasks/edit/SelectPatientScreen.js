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
import FormItemContainer from '../../other/FormItemContainer';
import {Priority, Task} from '../../../models/Task';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import {TransitionPresets} from 'react-navigation-stack';
import APIRequest from '../../../models/APIRequest';

export default class SelectPatientScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Task.patient,
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
        patients: [],
        selectedPatient: this.props.navigation.getParam('selectedPatient', null),
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
        const patients = await this.getPatients();
        this.setState({...patients, loading: false});
    };

    getPatients = async () => {
        let result: APIRequest = await this.api.getPatients();
        if (result.success) {
            return {patients: result.data};
        } else {
            this.showError(result.data);
            return {patients: []};
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    submit = async () => {
        const updatePatient = this.props.navigation.getParam('updatePatient', null);
        updatePatient && updatePatient(this.state.selectedPatient);
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
                    this.state.patients.map(patient => {

                        return(
                            <TouchableOpacity
                                key={patient.id}
                                onPress={() => this.setState({
                                    selectedPatient: patient,
                                })}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    {renderRadioButton(this.state.selectedPatient?.id === patient.id)}
                                    <Text style={[commonStyles.contentText, {flex: 1, marginLeft: 10}]}>{patient.fullName}</Text>
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
