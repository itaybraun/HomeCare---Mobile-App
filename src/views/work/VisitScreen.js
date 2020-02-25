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
import AppScreen from '../../support/AppScreen';
import {appColors, commonStyles} from '../../support/CommonStyles';
import {strings} from '../../localization/strings';
import {Button, Form, Icon, Text, Textarea} from 'native-base';
import FormItemContainer from '../other/FormItemContainer';
import {Task} from '../../models/Task';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import * as RNLocalize from "react-native-localize";

export default class VisitScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Visit.addNewVisit,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        showingVisitDatePicker: false,
        showingVisitStartTimePicker: false,
        showingVisitEndTimePicker: false,
        is24Hour: false,

        patient: null,
        address: null,
        phone: null,
        start: null,
        end: null,
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
        const task: Task = this.props.navigation.getParam('task', null);
        const is24Hour = RNLocalize.uses24HourClock();

        if (task) {
            this.setState({
                patient: task.patient?.fullName,
                address: task.patient?.simpleAddress,
                phone: task.patient?.phone,
                is24Hour: is24Hour,
            });
        } else {
            this.setState({
                is24Hour: is24Hour,
            });
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    submit = () => {
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
            <View style={commonStyles.screenContainer}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        style={{flex: 1}}
                        contentContainerStyle={{padding: 20}}
                        bounces={false}
                        automaticallyAdjustContentInsets={false}>
                        <Form>
                            <FormItemContainer
                                title={strings.Visit.patient}>
                                <View
                                    style={{flexDirection: 'row', padding: 11, paddingVertical: 17, alignItems: 'center'}}>
                                    <Text style={[{flex: 1}, commonStyles.formItemText]}>{this.state.patient}</Text>
                                </View>
                            </FormItemContainer>

                            {
                                this.state.address &&
                                <View style={styles.infoContainer}>
                                    <Icon type="SimpleLineIcons" name="map" style={{color: appColors.textColor}}/>
                                    <Text style={[{flex: 1, marginLeft: 16,}, commonStyles.formItemText]}>
                                        {this.state.address}
                                    </Text>
                                </View>
                            }

                            {
                                this.state.phone &&
                                <View style={styles.infoContainer}>
                                    <Icon type="SimpleLineIcons" name="phone" style={{color: appColors.textColor}}/>
                                    <Text style={[{flex: 1, marginLeft: 16,}, commonStyles.formItemText]}>
                                        {this.state.phone}
                                    </Text>
                                </View>
                            }

                            <FormItemContainer
                                style={{padding: 11,}}
                                title={strings.Visit.date}>
                                <TouchableOpacity
                                    onPress={() => this.setState({showingVisitDatePicker: true})}>
                                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                                        <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                            {this.state.start ? moment(this.state.start).format('ddd, MMM Do YYYY') : ''}
                                        </Text>
                                        <Icon type="Octicons" name="calendar" style={{color: appColors.textColor}} />
                                    </View>
                                </TouchableOpacity>
                            </FormItemContainer>

                            <View style={{flexDirection: 'row'}}>
                                <FormItemContainer
                                    style={{width: 110}}
                                    title={strings.Visit.start}>
                                    <TouchableOpacity
                                        onPress={() => this.setState({showingVisitStartTimePicker: true})}>
                                        <View style={{flexDirection: 'row', padding: 11, paddingVertical: 17, alignItems: 'center'}}>
                                            <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                                {this.state.start ? moment(this.state.start).format(this.state.is24Hour ? 'HH:mm' : 'hh:mm A') : ' '}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </FormItemContainer>
                                <FormItemContainer
                                    style={{width: 110, marginLeft: 50}}
                                    title={strings.Visit.end}>
                                    <TouchableOpacity
                                        onPress={() => this.setState({showingVisitEndTimePicker: true})}>
                                        <View style={{flexDirection: 'row', padding: 11, paddingVertical: 17, alignItems: 'center'}}>
                                            <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                                {this.state.end ? moment(this.state.end).format(this.state.is24Hour ? 'HH:mm' : 'hh:mm A') : ' '}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </FormItemContainer>
                            </View>

                            <FormItemContainer
                                style={{paddingVertical: 8,}}
                                title={strings.Visit.reason}>
                                <Textarea
                                    rowSpan={4}
                                    style={commonStyles.formItem}
                                    selectionColor={appColors.linkColor}
                                    autoCorrect={false}
                                    value={this.state.reason}
                                    onChangeText={value => {
                                        this.setState({
                                            reason: value,
                                        })
                                    }}
                                />
                            </FormItemContainer>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                                <Button success transparent
                                        onPress={this.submit}>
                                    <Text style={{fontWeight: 'bold'}}>{strings.Common.submitButton.toUpperCase()}</Text>
                                </Button>
                                <Button danger transparent
                                        onPress={this.cancel}>
                                    <Text style={{fontWeight: 'bold'}}>{strings.Common.cancelButton.toUpperCase()}</Text>
                                </Button>
                            </View>

                        </Form>
                    </ScrollView>
                </TouchableWithoutFeedback>

                <DateTimePickerModal
                    isVisible={this.state.showingVisitDatePicker}
                    date={this.state.start ?? new Date()}
                    mode="date"
                    onConfirm={(date) => {
                        this.setState({
                            start: date,
                            end: moment(date).add(1, 'h').toDate(),
                            showingVisitDatePicker: false,
                        })
                    }}
                    onCancel={() => this.setState({showingVisitDatePicker: false,})}
                />

                <DateTimePickerModal
                    isVisible={this.state.showingVisitStartTimePicker}
                    headerTextIOS={strings.Visit.pickStartTime}
                    date={this.state.start ?? new Date()}
                    mode="time"
                    is24Hour={this.state.is24Hour}
                    onConfirm={(date) => {
                        this.setState({
                            start: date,
                            end: moment(date).add(1, 'h').toDate(),
                            showingVisitStartTimePicker: false,
                        })
                    }}
                    onCancel={() => this.setState({showingVisitStartTimePicker: false,})}
                />

                <DateTimePickerModal
                    isVisible={this.state.showingVisitEndTimePicker}
                    headerTextIOS={strings.Visit.pickEndTime}
                    date={this.state.end ?? new Date()}
                    mode="time"
                    is24Hour={this.state.is24Hour}
                    onConfirm={(date) => {
                        if (this.state.start) {
                            // set same day
                            date = moment(date).set({
                                day: moment(this.state.start).day(),
                                month: moment(this.state.start).month(),
                                year: moment(this.state.start).year()
                            }).toDate();

                            // set next day if needed
                            if (moment(date) < moment(this.state.start)) {
                                date = moment(date).add(1, 'd').toDate()
                            }
                        }

                        console.log(date);

                        this.setState({
                            end: date,
                            showingVisitEndTimePicker: false,
                        })
                    }}
                    onCancel={() => this.setState({showingVisitEndTimePicker: false,})}
                />

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
