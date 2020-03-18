import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Keyboard, ScrollView, TouchableOpacity,
} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {
    appColors,
    commonStyles,
    renderLoading, renderRadioButton,
    renderSeparator,
} from '../../support/CommonStyles';
import {strings} from '../../localization/strings';
import {Button, Form, Icon, Text, Textarea} from 'native-base';
import {Activity} from '../../models/Activity';
import {Visit} from '../../models/Visit';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";

export default class SelectActivityScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Visit.selectAVisit,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        activities: [],
        selectedActivity: null,
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        const activities = this.props.navigation.getParam('activities', []);
        const selectedActivity = this.props.navigation.getParam('selectedActivity', null);

        this.setState({
            activities: activities,
            selectedActivity: selectedActivity,
        });
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    submit = async () => {
        if (this.state.selectedActivity) {
            const submitActivity = this.props.navigation.getParam('submitActivity', null)
            submitActivity && submitActivity(this.state.selectedActivity);
            this.pop();
        }
    };

    cancel = () => {
        this.pop();
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderListHeader = () => {
        return (
            <View style={{margin: 20,}}>
                <Text style={commonStyles.titleText}>{strings.Task.selectActivity}</Text>
            </View>
        );
    };

    renderActivity = ({item, index}) => {
        const activity: Activity = item;

        return (
            <TouchableOpacity
                style={{paddingHorizontal: 20,}}
                onPress={() => {
                    this.setState({
                        selectedActivity: activity
                    })
                }}>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {renderRadioButton(this.state.selectedActivity === activity)}
                    <Text style={{marginLeft: 10}}>
                        {activity.text}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    };

    render() {

        if (this.state.loading) {
            return renderLoading(this.state.loading)
        }

        return (
            <View style={commonStyles.screenContainer} onPress={Keyboard.dismiss}>
                <FlatList contentContainerStyle={{ flexGrow: 1 }}
                          data={this.state.activities}
                          renderItem={this.renderActivity}
                          ListHeaderComponent={this.renderListHeader}
                          ListFooterComponent={this.renderListFooter}
                          keyExtractor={item => item.id}
                          ItemSeparatorComponent={() => renderSeparator()}
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 20, marginTop: 10,}}>
                    <Button block
                            style={{backgroundColor: this.state.selectedActivity ? '#CCF4C9' : '#EEEEEE', width: 120,}}
                            disabled={!this.state.selectedActivity}
                            onPress={this.submit}>
                        <Text style={{color: this.state.selectedActivity ? '#32C02B' : '#666666', fontWeight: 'bold'}}>{strings.Common.okButton?.toUpperCase()}</Text>
                    </Button>
                    <Button block
                            style={{backgroundColor: '#F5BEC0', width: 120,}}
                            onPress={this.cancel}>
                        <Text style={{color: '#EC1A31', fontWeight: 'bold'}}>{strings.Common.cancelButton?.toUpperCase()}</Text>
                    </Button>
                </View>
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
