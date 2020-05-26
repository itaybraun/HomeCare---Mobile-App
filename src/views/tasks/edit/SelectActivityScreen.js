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
import {Activity} from '../../../models/Activity';

export default class SelectActivityScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Task.selectAnActivity,
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
        activities: [],
        selectedActivity: this.props.navigation.getParam('selectedActivity', null),
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
        const activities = await this.getActivities();
        this.setState({...activities, loading: false});
    };

    getActivities = async () => {
        let result: APIRequest = await this.api.getActivities();
        if (result.success) {
            const activities = result.data.sort((a: Activity, b: Activity) => {
                return ('' + a.text).localeCompare(b.text);
            });
            return {activities: activities};
        } else {
            this.showError(result.data);
            return {activities: []};
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    submit = async () => {
        const updateActivity = this.props.navigation.getParam('updateActivity', null);
        updateActivity && updateActivity(this.state.selectedActivity);
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
                    this.state.activities.map((activity, index) => {

                        return(
                            <TouchableOpacity
                                key={activity.id}
                                onPress={() => this.setState({
                                    selectedActivity: activity,
                                })}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    {renderRadioButton(this.state.selectedActivity === activity)}
                                    <Text style={[commonStyles.contentText, {flex: 1, marginLeft: 10}]}>{activity.text}</Text>
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
