import React, {Component} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, TouchableWithoutFeedback} from 'react-native';
import PropTypes from 'prop-types';
import {Task, Status} from '../../../models/Task';
import {commonStyles, renderSeparator} from '../../../support/CommonStyles';
import {Card, Icon} from 'native-base';
import moment from 'moment';
import {strings} from '../../../localization/strings';
import {uses24HourClock} from "react-native-localize";
import {Patient} from '../../../models/Patient';


export default class PatientTasks extends Component {

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    selectTask = (task: Task) => {
        this.props.selectTask && this.props.selectTask(task);
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderListHeader = () => {
        return (
            <View style={{height: 12}} />
        );
    };

    renderListFooter = () => {
        return (
            <View style={{height: 80}} />
        );
    };

    renderListEmpty = () => {
        return (
            <View style={commonStyles.emptyScreen}>
                <Text>{strings.Work.noData}</Text>
            </View>
        )
    };

    renderTask = ({item}) => {

        let task: Task = item;
        let created = task.openDate ? moment(task.openDate).fromNow() : null;
        let statusText = task.status && strings.Statuses.hasOwnProperty(task.status) ? strings.Statuses[task.status] : null

        let Component = task.activity?.questionnaireId ? TouchableOpacity : TouchableWithoutFeedback;

        return (
            <Component onPress={() => this.selectTask(task)}>
                <Card style={[commonStyles.cardStyle, task.isPriorityImportant ? {backgroundColor: '#F9E3E6'} : {}]}>
                    <Text style={[commonStyles.contentText]}>
                        {created ? strings.formatString(strings.Patient.created, created) : null}
                    </Text>

                    <View style={{flex: 1,}}>
                        <Text
                            style={[commonStyles.yellowTitleText, {paddingVertical: 10}]}
                            numberOfLines={2}>
                            {task.text}
                        </Text>
                        { statusText &&
                            <Text style={[commonStyles.infoText, {marginBottom: 10}]}>
                                {strings.formatString(strings.Task.status, statusText)}
                            </Text>
                        }
                        {
                            task.visit ?
                                <Text style={[commonStyles.contentText]}>
                                    {
                                        task.visit && task.visit.start && task.visit.end ?
                                            moment(task.visit.start).format(
                                                uses24HourClock() ? 'ddd, MMM-DD-YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A'
                                            ) +
                                            moment(task.visit.end).format(
                                                uses24HourClock() ? ' - HH:mm' : ' - hh:mm A'
                                            )

                                            : ''
                                    }
                                </Text>
                                :
                                <Text style={[commonStyles.contentText, {color: '#FF0000'}]}>{strings.Tasks.noSchedule}</Text>
                        }

                        {
                            task.status === Status.ACTIVE && task.activity?.questionnaireId &&
                                <Text style={[commonStyles.link, {fontWeight: 'bold', marginTop: 15}]}>{strings.Patient.executeTask}</Text>
                        }

                    </View>
                </Card>
            </Component>
        )
    };

    render() {

        const tasks = this.props.tasks;

        return (
            <View style={{flex: 1}}>
                <FlatList style={styles.list}
                          contentContainerStyle={{flexGrow: 1}}
                          data={tasks}
                          renderItem={this.renderTask}
                          ItemSeparatorComponent={() => renderSeparator()}
                          ListEmptyComponent={this.renderListEmpty}
                          ListHeaderComponent={this.renderListHeader}
                          ListFooterComponent={this.renderListFooter}
                          keyExtractor={item => item.id}
                          onRefresh={this.props.refresh}
                          refreshing={false}
                />
            </View>
        );
    }
}

PatientTasks.propTypes = {
    patient: PropTypes.instanceOf(Patient).isRequired,
    selectTask: PropTypes.func.isRequired,
    tasks: PropTypes.array.isRequired,
};

const styles = StyleSheet.create({
    list: {
        flex: 1,
        padding: 10,
    },
});
