import React, {Component} from 'react';
import {appColors, commonStyles} from '../../support/CommonStyles';
import {Body, Card, Icon, ListItem} from 'native-base';
import {Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import {strings} from '../../localization/strings';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import PropTypes from 'prop-types';
import {Priority, Status, Task} from '../../models/Task';
import ListItemContainer from '../other/ListItemContainer';

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

    render() {

        const task: Task = this.props.task;

        let schedule = strings.Tasks.noSchedule?.toUpperCase();
        let scheduleStyle = {color: appColors.errorColor};

        if (task.visit?.start && task.visit?.end) {
            const start = moment(task.visit.start);
            const end = moment(task.visit.end);

            schedule = `${moment(task.visit.start).format('MMM DD YYYY')} | ${moment(task.visit.start).format(uses24HourClock() ? 'HH:mm' : 'hh:mm A')} - ${moment(task.visit.end).format(uses24HourClock() ? 'HH:mm' : 'hh:mm A')}`;
            scheduleStyle = {};

            const twoDaysAgo = moment().subtract(2, 'days');

            if (twoDaysAgo > end && task.status === Status.ACTIVE) {
                scheduleStyle = {color: appColors.warningColor};
            }
        }

        return (
            <ListItem style={{marginLeft: 12, marginRight: 12, paddingLeft: 12, paddingRight: 0}}
                      onPress={() => this.selectTask(task)}>
                <Body>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Text
                            style={[commonStyles.titleText, {
                                flex: 1,
                                ...commonStyles.bold,
                            }]}
                            numberOfLines={2}>
                            {task.text}
                        </Text>
                        {task.priority !== Priority.ROUTINE &&
                            <Icon type="Ionicons" name="md-arrow-round-up" style={{fontSize: 20}}/>
                        }

                    </View>
                    <View style={{flex: 1, marginTop: 8}}>
                        <Text style={[commonStyles.smallInfoText, scheduleStyle]}>
                            {schedule}
                        </Text>
                    </View>
                </Body>
            </ListItem>
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
