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
    renderLoading, renderRadioButton,
    renderSeparator,
} from '../../support/CommonStyles';
import {strings} from '../../localization/strings';
import {Button, Content, Form, Icon, Text, Textarea} from 'native-base';
import FormItemContainer from '../other/FormItemContainer';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import {APIRequest} from '../../api/API';
import {Visit} from '../../models/Visit';


export default class VisitScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Visit.editVisit,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        visit: null,

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
        const visit: Visit = this.props.navigation.getParam('visit', null);
        this.setState({
            visit: visit,
            start: visit.start,
            end: visit.end,
        });
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    submit = async () => {
        let visit: Visit = this.state.visit;
        visit.start = this.state.start;
        visit.end = this.state.end;

        this.setState({loading: true});
        let result: APIRequest = await this.api.updateVisit(visit);
        if (result.success) {
            visit = result.data;
            const refresh = this.props.navigation.getParam('refresh', null);
            refresh && refresh();
            this.pop();
        } else {
            this.showError(result.data);
            this.setState({loading: false,});
        }
    };

    cancel = () => {
        this.pop();
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {
        return (
            <View style={commonStyles.screenContainer} >
                <Content
                    style={{flex: 1}}
                    contentContainerStyle={{padding: 20}}
                    bounces={false}
                    automaticallyAdjustContentInsets={false}>

                <Form>
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
                                        {this.state.start ? moment(this.state.start).format(uses24HourClock() ? 'HH:mm' : 'hh:mm A') : ' '}
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
                                        {this.state.end ? moment(this.state.end).format(uses24HourClock() ? 'HH:mm' : 'hh:mm A') : ' '}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </FormItemContainer>
                    </View>
                </Form>
                </Content>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 20, marginTop: 10,}}>
                    <Button block
                            style={{backgroundColor: '#CCF4C9', width: 120,}}
                            onPress={this.submit}>
                        <Text style={{color: '#32C02B', fontWeight: 'bold'}}>{strings.Common.submitButton?.toUpperCase()}</Text>
                    </Button>
                    <Button block
                            style={{backgroundColor: '#F5BEC0', width: 120,}}
                            onPress={this.cancel}>
                        <Text style={{color: '#EC1A31', fontWeight: 'bold'}}>{strings.Common.cancelButton?.toUpperCase()}</Text>
                    </Button>
                </View>
                {renderLoading(this.state.loading)}



                <DateTimePickerModal
                    isVisible={this.state.showingVisitDatePicker}
                    date={this.state.start || new Date()}
                    mode="date"
                    minimumDate={new Date()}
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
                    minimumDate={new Date()}
                    is24Hour={uses24HourClock()}
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
