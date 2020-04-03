import React, {Component} from 'react';
import {commonStyles} from '../../support/CommonStyles';
import {Card} from "native-base";
import {Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import {strings} from '../../localization/strings';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import PropTypes from 'prop-types';
import {Task} from '../../models/Task';

export default class TaskRenderer extends Component {

    static priorityColor = {
        routine: '#E6B12E',
        urgent: '#F72807',
        asap: '#F72807',
        stat: '#F72807',
    };

    static statusImage = {
        draft: require('../../assets/icons/tasks/task.png'),
        active: require('../../assets/icons/tasks/task.png'),
        'on-hold': require('../../assets/icons/tasks/task.png'),
        revoked: require('../../assets/icons/tasks/task.png'),
        completed: require('../../assets/icons/tasks/task.png'),
        'entered-in-error': require('../../assets/icons/tasks/task.png'),
        unknown: require('../../assets/icons/tasks/task.png'),
    }

    static statusColor = {
        draft: '#080808',
        active: '#1BBC0F',
        'on-hold': '#080808',
        revoked: '#080808',
        completed: '#080808',
        'entered-in-error': '#F72807',
        unknown: '#080808',
    };

    selectTask = (task: Task) => {
        this.props.selectTask && this.props.selectTask(task);
    };

    render () {

        const task: Task = this.props.task;

        return (
            <TouchableHighlight style={commonStyles.listItemContainer}
                                onPress={() => this.selectTask(task)}
                                underlayColor='#FFFFFFFF'
                                activeOpacity={0.3}
                                {...this.props}

            >
                <Card style={commonStyles.cardStyle}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                        <Image source={TaskRenderer.statusImage[task.status]} style={{width: 48, height: 48}}/>
                        <Text
                            style={[commonStyles.titleText, {
                                flex: 1,
                                marginLeft: 10
                            }]}
                            numberOfLines={2}>
                            {task.text}
                        </Text>
                    </View>
                    <View style={{flex: 1, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
                        <View style={[styles.priorityContainer, {backgroundColor: TaskRenderer.priorityColor[task.priority] + '26'}]}>
                            <Text numberOfLines={1} style={[
                                commonStyles.text,
                                {fontSize: 14,},
                                commonStyles.medium,
                                {color: TaskRenderer.priorityColor[task.priority]}
                                ]}>
                                {strings.Priorities[task.priority]?.toUpperCase()}
                            </Text>
                        </View>
                        <View style={[styles.statusContainer, {backgroundColor: TaskRenderer.statusColor[task.status] + '26'}]}>
                            <Text numberOfLines={1} style={[
                                commonStyles.medium,
                                {fontSize: 14,},
                                {color: TaskRenderer.statusColor[task.status]}
                                ]}>
                                {strings.Statuses[task.status]?.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <View style={{flex: 1, marginTop: 10, flexDirection: 'row',}}>
                        {
                            task.visit && task.visit.start && task.visit.end ?
                                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10,}}>
                                    <View>
                                        <Text numberOfLines={1} style={[commonStyles.smallContentText, commonStyles.bold, {marginRight: 5,}]}>
                                            {moment(task.visit.start).format('ddd')}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text numberOfLines={1} style={[commonStyles.smallContentText, commonStyles.bold, {marginRight: 5,}]}>
                                            {moment(task.visit.start).format('MMM-DD-YYYY')}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text numberOfLines={1} style={[commonStyles.smallContentText, {fontWeight: 'bold'}]}>
                                            {moment(task.visit.start).format(uses24HourClock() ? 'HH:mm' : 'hh:mm A')}
                                            &nbsp;-&nbsp;
                                            {moment(task.visit.end).format(uses24HourClock() ? 'HH:mm' : 'hh:mm A')}
                                        </Text>
                                    </View>
                                </View>
                                :
                                <Text style={[commonStyles.smallContentText, commonStyles.bold, {textAlign: 'center', flex: 1, color: '#FF0000'}]}>
                                    {strings.Tasks.noSchedule?.toUpperCase()}
                                </Text>
                        }
                    </View>
                </Card>
            </TouchableHighlight>
        );
    }
}

TaskRenderer.propTypes = {
    task: PropTypes.object.isRequired,
    selectTask: PropTypes.func,
};

const styles = StyleSheet.create({
    priorityContainer: {
        marginLeft: -12,
        paddingHorizontal: 12,
        minWidth: 120,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,

    },

    statusContainer: {
        marginRight: -12,
        paddingHorizontal: 12,
        minWidth: 120,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
});
