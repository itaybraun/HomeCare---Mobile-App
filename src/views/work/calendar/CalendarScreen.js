import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput, Text} from 'react-native';
import AppScreen from '../../../support/AppScreen';
import {commonStyles, renderLoading, renderSeparator} from '../../../support/CommonStyles';
import {strings} from '../../../localization/strings';
import {Calendar} from 'react-native-calendars';
import {Utils} from '../../../support/Utils';
import {APIRequest} from '../../../api/API';
import {uses24HourClock} from "react-native-localize";
import moment from 'moment';
import {Visit} from '../../../models/Visit';
import {Card, Icon} from 'native-base';
import {Task} from '../../../models/Task';
import { Tooltip } from 'react-native-elements';

export default class CalendarScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Calendar.myCalendar,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        visits: [],
        tasks: [],
        selectedDate: moment(new Date()).format('YYYY-MM-DD'),
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
        const visits = await this.getVisits();
        this.setState({
            ...visits,
            loading: false,
        });
    };

    getVisits = async () => {
        let result: APIRequest = await this.api.getVisits();
        if (result.success) {
            let visits = result.data;
            return {visits: visits};
        } else {
            this.showError(result.data);
            return {visits: []};
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    generateMarkedDates = () => {
        let markedDates = {};

        for (const visit of this.state.visits) {
            markedDates[moment(visit.start).format('YYYY-MM-DD')] = {marked: true}
        }

        if (markedDates.hasOwnProperty(this.state.selectedDate)) {
            markedDates[this.state.selectedDate].selected = true;
        } else {
            markedDates[this.state.selectedDate] = {selected: true};
        }

        return markedDates;
    };

    getSelectedDateVisits = () => {

        return this.state.visits.filter(visit => {
            if (moment(visit.start).isSame(this.state.selectedDate, 'day')) {
                return visit;
            }
        });
    };

    addVisit = () => {

    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    //List

    renderListHeader = () => {
        return (
            <Card style={{marginLeft: 10, marginRight: 10, marginTop: 10, }}>
                <Calendar
                    hideExtraDays={true}
                    firstDay={Utils.getFirstDayOfWeek()}
                    markedDates={this.generateMarkedDates()}
                    onDayPress={(day) => {this.setState({selectedDate: day.dateString})}}
                    theme={{
                        selectedDayBackgroundColor: '#CFE0FF',
                        selectedDayTextColor: '#000000',
                        todayFontWeight: 'bold',
                        textDayHeaderFontWeight: 'bold',
                        dotColor: '#00adf5',
                        selectedDotColor: '#00adf5',
                        'stylesheet.day.basic': {
                            selectedText: {
                                fontWeight: 'bold',
                            },
                            todayText: {
                                fontWeight: 'bold',
                                color: '#3871F5',
                            },
                        },
                    }}
                />
            </Card>
        );

    };

    renderListFooter = () => {
        return (
            <View style={{height: 74}} />
        );
    };

    renderListEmpty = () => {
        return (
            <View style={commonStyles.emptyScreen}>
                <Text>{strings.formatString(strings.Calendar.noVisits, this.state.selectedDate)}</Text>
            </View>
        )
    };

    renderVisit = ({item}) => {
        let visit: Visit = item;
        const width = uses24HourClock() ? 45 : 75;
        return (
            <TouchableOpacity style={styles.visitContainer}>
                <Card style={commonStyles.cardStyle}>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{width: width, justifyContent: 'center'}}>
                            <Text style={styles.timeStyle}>
                                {moment(visit.start).format(uses24HourClock() ? 'HH:mm' : 'hh:mm A')}
                            </Text>
                            <Text style={styles.timeStyle}>
                                {moment(visit.end).format(uses24HourClock()  ? 'HH:mm' : 'hh:mm A')}
                            </Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={{flex: 1, justifyContent: 'center'}}>
                            <Text style={visit.tasks && visit.tasks.length > 0 ? commonStyles.yellowText : commonStyles.titleText}>
                                {visit.tasks?.[0]?.text || strings.Calendar.noTask}
                            </Text>
                            {
                                visit?.patient?.fullName &&
                                <Text style={commonStyles.contentText}>{visit.patient.fullName}</Text>
                            }

                        </View>
                        {
                            this.settings.qaMode &&
                            <View style={{justifyContent: 'center', alignSelf: 'stretch'}}>
                                <Tooltip
                                    overlayColor={'#FFFFFF00'}
                                    backgroundColor={'#EEEEEEEE'}
                                    height={200}
                                    width={320}
                                    popover={
                                             <View>
                                                 <Text>Encounter ID:</Text>
                                                 <Text>{visit.id}</Text>
                                                 {
                                                     visit.taskIds &&
                                                         <View>
                                                             <Text> </Text>
                                                             <Text>ServiceRequest IDs: </Text>
                                                             <Text>{visit.taskIds.join(", ")}</Text>
                                                         </View>
                                                 }
                                                 <Text> </Text>
                                                 <Text>Patient ID:</Text>
                                                 <Text>{visit.patientId}</Text>

                                             </View>
                                         }>
                                    <Icon type='AntDesign' name='infocirlceo' />
                                </Tooltip>
                            </View>
                        }
                    </View>
                </Card>
            </TouchableOpacity>
        )
    };

    render() {

        return (
            <View style={commonStyles.screenContainer}>
                <FlatList style={styles.list}
                          contentContainerStyle={{ flexGrow: 1 }}
                          data={this.getSelectedDateVisits()}
                          renderItem={this.renderVisit}
                          ItemSeparatorComponent={() => renderSeparator({height: 0})}
                          ListEmptyComponent={this.renderListEmpty}
                          ListHeaderComponent={this.renderListHeader}
                          ListFooterComponent={this.renderListFooter}
                          keyExtractor={item => item.id}
                          onRefresh={this.getData}
                          refreshing={false}
                />
                <View style={{position: 'absolute', right: 10, bottom: 10}}>
                    <TouchableOpacity
                        style={commonStyles.blackButtonContainer}
                        onPress={this.addVisit}
                    >
                        <Icon type="Feather" name="plus" style={commonStyles.plusText}/>
                    </TouchableOpacity>
                </View>
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },

    visitContainer: {
        marginHorizontal: 10,
    },

    timeStyle: {
        fontSize: 16,
        color: '#9296FE',
    },

    separator: {
        marginHorizontal: 10,
        width: 1,
        backgroundColor: '#807979'
    }
});
