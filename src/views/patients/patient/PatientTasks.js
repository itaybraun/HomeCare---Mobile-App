import React, {Component} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {Task} from '../../../models/Task';
import {commonStyles, renderSeparator} from '../../../support/CommonStyles';
import {Card} from "native-base";
import moment from 'moment';
import {strings} from '../../../localization/strings';
import {uses24HourClock} from "react-native-localize";
import {Patient} from '../../../models/Patient';


export default class PatientTasks extends Component {

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    executeTask = (task: Task) => {
        this.props.navigateTo('Questionnaire', {task: task});
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
            <View style={{height: 12}} />
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

        return (
            <TouchableOpacity onPress={() => {}}>
                <Card style={[commonStyles.cardStyle, task.isPriorityImportant ? {backgroundColor: '#F9E3E6'} : {}]}>
                    <Text style={[commonStyles.contentText]}>{created ? strings.formatString(strings.Patient.created, created) : null}</Text>
                    <View style={{flex: 1,}}>
                        <Text
                            style={[commonStyles.yellowTitle, {paddingVertical: 10}]}
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
                            task.questionnaireId &&
                                <TouchableOpacity style={{marginTop: 15}}
                                                  onPress={() => this.executeTask(task)}
                                >
                                    <Text style={[commonStyles.link, {fontWeight: 'bold'}]}>{strings.Patient.executeTask}</Text>
                                </TouchableOpacity>
                        }

                    </View>
                </Card>
            </TouchableOpacity>
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
                          onRefresh={this.getData}
                          refreshing={false}
                />
            </View>
        );
    }
}

PatientTasks.propTypes = {
    patient: PropTypes.instanceOf(Patient).isRequired,
    navigateTo: PropTypes.func.isRequired,
    tasks: PropTypes.array.isRequired,
};

const styles = StyleSheet.create({
    list: {
        flex: 1,
        padding: 10,
    },
});
