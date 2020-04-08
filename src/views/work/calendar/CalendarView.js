import React, {Component} from 'react';
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
import PropTypes from 'prop-types';
import PatientTasks from '../../patients/patient/PatientTasks';

export default class CalendarView extends Component {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    state = {
        selectedDate: moment(new Date()).format('YYYY-MM-DD'),
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    generateMarkedDates = () => {
        let markedDates = {};

        for (const visit of this.props.visits) {
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

        return this.props.visits.filter(visit => {
            if (moment(visit.start).isSame(this.state.selectedDate, 'day')) {
                return visit;
            }
        });
    };

    selectVisit = (visit) => {
        this.props.selectVisit && this.props.selectVisit(visit);
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    //List

    renderListHeader = () => {
        return (
            <Card style={{marginLeft: 10, marginRight: 10, marginTop: 10, marginBottom: 10, }}>
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
            <View style={{height: 12}} />
        );
    };

    renderListEmpty = () => {
        return (
            <View style={commonStyles.emptyScreen}>
                <Text style={commonStyles.smallContentText}>{strings.formatString(strings.Calendar.noVisits, this.state.selectedDate)}</Text>
            </View>
        )
    };

    renderVisit = ({item}) => {
        let visit: Visit = item;

        const width = uses24HourClock() ? 50 : 80;
        return (
            <TouchableOpacity style={styles.visitContainer} onPress={() => this.selectVisit(visit)}>
                <Card style={commonStyles.cardStyle}>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{width: width, justifyContent: 'center'}}>
                            <Text style={styles.timeStyle}>
                                {moment(visit.start).format(uses24HourClock() ? 'HH:mm' : 'hh:mm A')}
                            </Text>
                            <Text style={[styles.timeStyle, {marginTop: 5,}]}>
                                {moment(visit.end).format(uses24HourClock()  ? 'HH:mm' : 'hh:mm A')}
                            </Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={{flex: 1, justifyContent: 'center'}}>
                            {
                                visit.patient?.fullName &&
                                <Text style={commonStyles.contentText}>{visit.patient.fullName}</Text>
                            }
                            {
                                visit.tasks && visit.tasks.length > 0 ?
                                visit.tasks?.map((task, index) => {
                                    return (
                                        <View key={task.id} style={{marginTop: 5}}>
                                            {index > 0 &&
                                                <View style={[commonStyles.line, {marginBottom: 5}]}/>
                                            }
                                            <Text style={[commonStyles.contentText, {color: '#F37E08', marginBottom: 5}]}>
                                                {task.text}
                                            </Text>

                                        </View>
                                    );
                                }) :
                                    <Text style={commonStyles.titleText}>
                                        {strings.Calendar.noTask}
                                    </Text>
                            }

                        </View>
                        {
                            this.props.additionalData &&
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
                          ItemSeparatorComponent={() => renderSeparator()}
                          ListEmptyComponent={this.renderListEmpty}
                          ListHeaderComponent={this.renderListHeader}
                          ListFooterComponent={this.renderListFooter}
                          keyExtractor={item => item.id}
                          onRefresh={this.getData}
                          refreshing={false}
                />
            </View>
        );
    }
}

CalendarView.propTypes = {
    visits: PropTypes.array.isRequired,
    selectVisit: PropTypes.func,
    additionalData: PropTypes.bool,
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
        ...commonStyles.contentText,
        color: '#6E78F7',
    },

    separator: {
        marginHorizontal: 10,
        width: 1,
        backgroundColor: '#707070'
    }
});
