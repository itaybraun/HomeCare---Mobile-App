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
import {APIRequest} from '../../../api/API';

export default class SelectPerformerScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Task.assignTo,
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
        performers: [],
        selectedPerformer: this.props.navigation.getParam('selectedPerformer', null),
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
        const performers = await this.getPerformers();
        this.setState({...performers, loading: false});
    };

    getPerformers = async () => {
        let result: APIRequest = await this.api.getPractitioners();
        if (result.success) {
            return {performers: result.data};
        } else {
            this.showError(result.data);
            return {performers: []};
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    submit = async () => {
        const updatePerformer = this.props.navigation.getParam('updatePerformer', null);
        updatePerformer && updatePerformer(this.state.selectedPerformer);
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
                    this.state.performers.map(performer=> {
                        return(
                            <TouchableOpacity
                                key={performer.id}
                                onPress={() => this.setState({
                                    selectedPerformer: performer,
                                })}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    {renderRadioButton(this.state.selectedPerformer?.id === performer.id)}
                                    <Text style={[commonStyles.contentText, {flex: 1, marginLeft: 10}]}>{performer.fullName}</Text>
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
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginHorizontal: 10,
    },
});
