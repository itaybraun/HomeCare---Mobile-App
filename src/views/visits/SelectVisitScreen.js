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
import {
    appColors,
    commonStyles, popupNavigationOptions,
    renderDisclosureIndicator,
    renderLoading, renderRadioButton,
    renderSeparator,
} from '../../support/CommonStyles';
import {strings} from '../../localization/strings';
import {Button, Form, Icon, Text, Textarea} from 'native-base';
import FormItemContainer from '../other/FormItemContainer';
import {Task} from '../../models/Task';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import {APIRequest} from '../../api/API';
import {Visit} from '../../models/Visit';
import {Request} from '../../support/Utils';
import {TransitionPresets} from 'react-navigation-stack';

export default class SelectVisitScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Visit.selectAVisit,
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
        task: null,
        visits: [],
        selectedVisitIndex: 0,
        showingVisitDatePicker: false,
        showingVisitStartTimePicker: false,
        showingVisitEndTimePicker: false,


        start: null,
        end: null,
        errors: {},
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
        const task: Task = this.props.navigation.getParam('task', null);
        const visits = task && task.patient ? await this.getVisits(task.patient.id) : null;
        const selectedVisit = this.getSelectedVisit(visits.visits, task);
        this.setState({
            ...visits,
            ...selectedVisit,
            task: task,
            loading: false,
        });
    };

    getVisits = async (patientId) => {
        let result: APIRequest = await this.api.getVisits(patientId);
        if (result.success) {
            let visits = result.data;
            visits = visits.sort((a: Visit, b: Visit) => {
                return a.start - b.start;
            });
            return {visits: visits};
        } else {
            this.showError(result.data);
            return {visits: []};
        }
    };

    getSelectedVisit = (visits, task: Task) => {
        let selectedVisitIndex = 0;
        let start: Date = null;
        let end: Date = null;
        const selectedVisit: Visit = this.props.navigation.getParam('selectedVisit', null);
        if (selectedVisit) {
            if (selectedVisit.id) {
                selectedVisitIndex = visits.findIndex(visit => visit.id === selectedVisit.id)
            } else {
                selectedVisitIndex = visits.length;
                start = selectedVisit.start;
                end = selectedVisit.end;
            }
        } else {
            selectedVisitIndex = visits.length + 1;
        }
        return {
            selectedVisitIndex: selectedVisitIndex,
            start: start,
            end: end,
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    selectVisit = (index) => {
        this.setState({
            selectedVisitIndex: index,
        })
    };

    validate = () => {
        let visit = new Visit();
        let errors = {};

        visit.patientId = this.state.task?.patientId;
        visit.patient = this.state.task?.patient;

        if (this.state.start)
            visit.start = this.state.start;
        else
            errors.start = true;

        if (this.state.end)
            visit.end = this.state.end;
        else
            errors.end = true;

        const success = Object.keys(errors).length === 0;

        return new Request(
            success,
            success ? visit : errors
        );
    };

    submit = async () => {

        let visit: Visit = this.state.visits[this.state.selectedVisitIndex];
        if (!visit) {
            if (this.state.selectedVisitIndex === this.state.visits.length) {
                await this.setState({
                    errors: {},
                });

                let validationResult: Request = this.validate();

                if (validationResult.success) {
                    visit = validationResult.data;
                } else {
                    this.setState({
                        errors: validationResult.data
                    });
                    return;
                }
            } else {
                visit = null;
            }
        }

        const submitVisit = this.props.navigation.getParam('submitVisit', null)
        submitVisit && submitVisit(visit);
        this.pop();
    };

    cancel = () => {
        this.pop();
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderListHeader = () => {

        let newIndex = this.state.visits.length;
        let removeIndex = this.state.visits.length + 1;

        return (
            <View style={{padding: 20}}>
                <TouchableOpacity
                    onPress={() => this.selectVisit(newIndex)}>
                    <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                        {renderRadioButton(this.state.selectedVisitIndex === newIndex)}
                        <View style={{flex: 1, marginLeft: 20, marginRight: 34}}>
                            <Text style={[commonStyles.contentText, {flex: 1}]}>{strings.Visit.newVisit}</Text>
                            <Form style={{marginTop: 20}}>
                                <FormItemContainer
                                    style={{padding: 11,}}
                                    title={strings.Visit.date}
                                    error={this.state.errors.start}>
                                    <TouchableOpacity
                                        onPress={() => this.setState({selectedVisitIndex: newIndex, showingVisitDatePicker: true})}>
                                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                                            <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                                {this.state.start ? moment(this.state.start).format('ddd, MMM Do YYYY') : ''}
                                            </Text>
                                            <Icon type="Octicons" name="calendar" style={{color: appColors.textColor}} />
                                        </View>
                                    </TouchableOpacity>
                                </FormItemContainer>

                                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                                    <FormItemContainer
                                        style={{width: 110}}
                                        title={strings.Visit.start}
                                        error={this.state.errors.start}>
                                        <TouchableOpacity
                                            onPress={() => this.setState({selectedVisitIndex: newIndex, showingVisitStartTimePicker: true})}>
                                            <View style={{flexDirection: 'row', padding: 11, paddingVertical: 17, alignItems: 'center'}}>
                                                <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                                    {this.state.start ? moment(this.state.start).format(uses24HourClock() ? 'HH:mm' : 'hh:mm A') : ' '}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </FormItemContainer>
                                    <FormItemContainer
                                        style={{width: 110}}
                                        title={strings.Visit.end}
                                        error={this.state.errors.end}>
                                        <TouchableOpacity
                                            onPress={() => this.setState({selectedVisitIndex: newIndex, showingVisitEndTimePicker: true})}>
                                            <View style={{flexDirection: 'row', padding: 11, paddingVertical: 17, alignItems: 'center'}}>
                                                <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                                    {this.state.end ? moment(this.state.end).format(uses24HourClock() ? 'HH:mm' : 'hh:mm A') : ' '}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </FormItemContainer>
                                </View>
                            </Form>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={[commonStyles.line, {marginBottom: 20}]} />

                <TouchableOpacity
                    onPress={() => this.selectVisit(removeIndex)}>

                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        {renderRadioButton(this.state.selectedVisitIndex === removeIndex)}
                        <Text style={[commonStyles.contentText, {color: 'red', flex: 1, marginLeft: 20}]}>
                            {strings.Visit.removeSchedule}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={[commonStyles.line, {marginVertical: 20}]} />

                <Text style={[commonStyles.contentText, commonStyles.medium, {marginLeft: 44}]}>
                    {strings.Visit.addToExisting}
                </Text>
            </View>
        );
    };

    renderVisit = ({item, index}) => {

        let visit: Visit = item;

        let disabled = moment(visit.start).startOf('day') < moment().startOf('day');

        if (disabled && this.state.selectedVisitIndex !== index ) {
            return <View style={{marginTop: -10}} />
        }

        return (
            <TouchableOpacity
                disabled={disabled}
                style={{paddingHorizontal: 20,}}
                onPress={() => this.selectVisit(index)}>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {renderRadioButton(this.state.selectedVisitIndex === index)}
                    <Text style={[commonStyles.contentText, disabled && {color: '#cccccc'}, {flex: 1, marginLeft: 20}]}>
                        {
                            moment(visit.start).format(
                            uses24HourClock() ? 'ddd, MMM-DD-YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A'
                            ) +
                            moment(visit.end).format(
                            uses24HourClock() ? ' - HH:mm' : ' - hh:mm A'
                            )
                        }
                    </Text>
                </View>
            </TouchableOpacity>
        )
    };

    renderListFooter = () => {
        return <View />
    };

    render() {

        if (this.state.loading) {
            return (
                <View style={commonStyles.screenContainer}>
                    {renderLoading(this.state.loading)}
                </View>
            )
        }

        return (
            <View style={commonStyles.screenContainer} onPress={Keyboard.dismiss}>
                <FlatList contentContainerStyle={{ flexGrow: 1 }}
                          data={this.state.visits}
                          renderItem={this.renderVisit}
                          ListHeaderComponent={this.renderListHeader}
                          ListFooterComponent={this.renderListFooter}
                          keyExtractor={item => item.id}
                          ItemSeparatorComponent={() => renderSeparator()}
                />

                {renderLoading(this.state.loading)}

                <DateTimePickerModal
                    isVisible={this.state.showingVisitDatePicker}
                    date={this.state.start || new Date()}
                    mode="date"
                    minimumDate={new Date()}
                    onConfirm={(date) => {
                        let errors = this.state.errors;
                        errors.start = false;
                        errors.end = false;
                        this.setState({
                            start: date,
                            end: moment(date).add(1, 'h').toDate(),
                            showingVisitDatePicker: false,
                            errors: errors,
                        })
                    }}
                    onCancel={() => this.setState({showingVisitDatePicker: false,})}
                />

                <DateTimePickerModal
                    isVisible={this.state.showingVisitStartTimePicker}
                    headerTextIOS={strings.Visit.pickStartTime}
                    date={this.state.start ?? new Date()}
                    minimumDate={new Date()}
                    mode="time"
                    is24Hour={uses24HourClock()}
                    onConfirm={(date) => {
                        let errors = this.state.errors;
                        errors.start = false;
                        errors.end = false;
                        this.setState({
                            start: date,
                            end: moment(date).add(1, 'h').toDate(),
                            showingVisitStartTimePicker: false,
                            errors: errors,
                        })
                    }}
                    onCancel={() => this.setState({showingVisitStartTimePicker: false,})}
                />

                <DateTimePickerModal
                    isVisible={this.state.showingVisitEndTimePicker}
                    headerTextIOS={strings.Visit.pickEndTime}
                    date={this.state.end ?? new Date()}
                    mode="time"
                    minimumDate={new Date()}
                    is24Hour={uses24HourClock()}
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

                        let errors = this.state.errors;
                        errors.end = false;

                        this.setState({
                            end: date,
                            showingVisitEndTimePicker: false,
                            errors: errors,
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
