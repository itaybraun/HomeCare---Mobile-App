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
    commonStyles,
    renderDisclosureIndicator,
    renderLoading,
    renderSeparator,
} from '../../support/CommonStyles';
import {strings} from '../../localization/strings';
import {Button, Form, Icon, Text, Textarea} from 'native-base';
import FormItemContainer from '../other/FormItemContainer';
import {Task} from '../../models/Task';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import * as RNLocalize from "react-native-localize";
import {APIRequest} from '../../api/API';
import {Visit} from '../../models/Visit';
import {Request} from '../../support/Utils';

export default class VisitScreen extends AppScreen {

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
        task: null,
        visits: [],
        selectedVisitIndex: 0,
        showingVisitDatePicker: false,
        showingVisitStartTimePicker: false,
        showingVisitEndTimePicker: false,
        is24Hour: false,

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
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        this.setState({loading: true});
        const task: Task = this.props.navigation.getParam('task', null);
        const is24Hour = RNLocalize.uses24HourClock();
        const visits = task && task.patient ? await this.getVisits(task.patient.id) : null;
        const selectedVisit = this.getSelectedVisit(visits.visits);
        this.setState({
            ...visits,
            ...selectedVisit,
            task: task,
            is24Hour: is24Hour,
            loading: false,
        });
    };

    getVisits = async (patientId) => {
        let result: APIRequest = await this.api.getVisits(patientId);
        if (result.success) {
            let visits = result.data;
            return {visits: visits};
        } else {
            this.showError(result.data);
            return {visits: []};
        }
    };

    getSelectedVisit = (visits) => {
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

        visit = new Visit();
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
            }
        }

        if (visit) {
            const submitVisit = this.props.navigation.getParam('submitVisit', null)
            submitVisit && submitVisit(visit);
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
                <Text style={commonStyles.titleText}>{strings.Visit.patient}: {this.state.task?.patient?.fullName}</Text>
            </View>
        );
    };

    renderVisit = ({item, index}) => {
        return (
            <TouchableOpacity
                style={{paddingHorizontal: 20,}}
                onPress={() => this.selectVisit(index)}>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {this.renderRadioButton(this.state.selectedVisitIndex === index)}
                    <Text style={{marginLeft: 10}}>
                        {
                            moment(item.start).format(
                            this.state.is24Hour ? 'ddd, MMM-DD-YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A'
                            ) +
                            moment(item.end).format(
                            this.state.is24Hour ? ' - HH:mm' : ' - hh:mm A'
                            )
                        }
                    </Text>
                </View>
            </TouchableOpacity>
        )
    };

    renderListFooter = () => {
        let index = this.state.visits.length;
        return (
            <TouchableOpacity
                style={{paddingHorizontal: 20}}
                onPress={() => this.selectVisit(index)}>
                {renderSeparator()}
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {this.renderRadioButton(this.state.selectedVisitIndex === index)}
                    <Text style={{marginLeft: 10}}>{strings.Visit.newVisit}</Text>
                </View>
                {
                    this.state.selectedVisitIndex === index &&
                    <Form style={{marginTop: 20}}>
                        <FormItemContainer
                            style={{padding: 11,}}
                            title={strings.Visit.date}
                            error={this.state.errors.start}>
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
                                title={strings.Visit.start}
                                error={this.state.errors.start}>
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
                                title={strings.Visit.end}
                                error={this.state.errors.end}>
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
                    </Form>
                }
            </TouchableOpacity>
        );
    };

    renderRadioButton = (selected) => {
        return (
            <View style={[styles.radioButton, selected ? styles.radioButtonSelected : {}]}>
                {
                    selected && <View style={styles.radioButtonInner} />
                }
            </View>
        )
    };

    render() {

        if (this.state.loading) {
            return renderLoading(this.state.loading)
        }

        return (
            <View style={commonStyles.screenContainer} onPress={Keyboard.dismiss}>
                <FlatList contentContainerStyle={{ flexGrow: 1 }}
                          data={this.state.visits}
                          renderItem={this.renderVisit}
                          ListHeaderComponent={this.renderListHeader}
                          ListFooterComponent={this.renderListFooter}
                          keyExtractor={item => item.id}
                          ItemSeparatorComponent={renderSeparator}
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 30, marginTop: 10,}}>
                    <Button block
                            style={{backgroundColor: '#CCF4C9', width: 120,}}
                            onPress={this.submit}>
                        <Text style={{color: '#32C02B', fontWeight: 'bold'}}>{strings.Common.okButton?.toUpperCase()}</Text>
                    </Button>
                    <Button block
                            style={{backgroundColor: '#F5BEC0', width: 120,}}
                            onPress={this.cancel}>
                        <Text style={{color: '#EC1A31', fontWeight: 'bold'}}>{strings.Common.cancelButton?.toUpperCase()}</Text>
                    </Button>
                </View>

                <DateTimePickerModal
                    isVisible={this.state.showingVisitDatePicker}
                    date={this.state.start ?? new Date()}
                    mode="date"
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
                    mode="time"
                    is24Hour={this.state.is24Hour}
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
    radioButton: {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#999999',
    },

    radioButtonSelected: {
        borderColor: '#0F7152',
    },

    radioButtonInner: {
        height: 14,
        width: 14,
        backgroundColor: '#0F7152',
        borderRadius: 7,
    }
});
