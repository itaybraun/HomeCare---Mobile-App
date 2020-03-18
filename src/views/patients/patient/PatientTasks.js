import React, {Component} from 'react';
import {View, Text, TouchableHighlight, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Image} from 'react-native';
import PropTypes from 'prop-types';
import {Task, Status} from '../../../models/Task';
import {commonStyles, renderSeparator} from '../../../support/CommonStyles';
import {Card, Icon} from 'native-base';
import moment from 'moment';
import {strings} from '../../../localization/strings';
import {uses24HourClock} from "react-native-localize";
import {Patient} from '../../../models/Patient';
import {SwipeListView} from 'react-native-swipe-list-view';


export default class PatientTasks extends Component {

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    selectTask = (task: Task) => {
        this.props.selectTask && this.props.selectTask(task);
        this.closeRow();
    };

    deleteTask = async (task: Task) => {
        await this.props.deleteTask && this.props.deleteTask(task);
        this.closeRow();
    };

    closeRow = () => {
        this.list.safeCloseOpenRow()
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
            <View style={{height: 74}} />
        );
    };

    renderListEmpty = () => {
        return (
            <View style={commonStyles.emptyScreen}>
                <Text>{strings.Work.noData}</Text>
            </View>
        )
    };

    renderHiddenItem = ({item}, rowMap) => {
        return (
            <View style={commonStyles.menuContainer}>
                <TouchableOpacity
                    style={[commonStyles.itemMenuContainer, {backgroundColor: '#8CE69B', width: 0, height: 0}]}
                    onPress={() => this.selectTask(item)}>
                    <Icon type="Feather" name="edit"/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[commonStyles.itemMenuContainer, {backgroundColor: '#DA8EA0'}]}
                    onPress={() => this.deleteTask(item)}>
                    <Image style={commonStyles.menuIcon} source={require('../../../assets/icons/flags/delete.png')} />
                </TouchableOpacity>
            </View>
        );
    };

    renderTask = ({item}) => {

        let task: Task = item;
        let created = task.openDate ? moment(task.openDate).fromNow() : null;
        let statusText = task.status && strings.Statuses.hasOwnProperty(task.status) ? strings.Statuses[task.status] : null

        return (

            <TouchableHighlight
                style={commonStyles.listItemContainer}
                underlayColor='#FFFFFFFF'
                disabled={!task.activity?.questionnaireId}
                activeOpacity={0.3}
                onPress={() => this.selectTask(task)}>
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
            </TouchableHighlight>
        )
    };

    render() {

        const tasks = this.props.tasks;

        return (
            <View style={{flex: 1}}>
                <SwipeListView
                    ref={(list) => {
                        this.list = list;
                    }}
                    style={styles.list}
                    contentContainerStyle={{ flexGrow: 1 }}
                    data={tasks}
                    keyExtractor={item => item.id}
                    renderItem={this.renderTask}
                    renderHiddenItem={this.renderHiddenItem}
                    ItemSeparatorComponent={() => renderSeparator()}
                    ListEmptyComponent={this.renderListEmpty}
                    ListHeaderComponent={this.renderListHeader}
                    ListFooterComponent={this.renderListFooter}
                    onRefresh={this.props.refresh}
                    refreshing={false}
                    rightOpenValue={-103}
                    leftOpenValue={0}
                    disableRightSwipe
                    closeOnRowBeginSwipe
                    recalculateHiddenLayout
                />
            </View>
        );
    }
}

PatientTasks.propTypes = {
    patient: PropTypes.instanceOf(Patient).isRequired,
    selectTask: PropTypes.func.isRequired,
    deleteTask: PropTypes.func.isRequired,
    tasks: PropTypes.array.isRequired,
    refresh: PropTypes.func,
};

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
});
