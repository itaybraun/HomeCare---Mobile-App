import React, {Component} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {Task} from '../../../models/Task';
import {commonStyles, renderSeparator} from '../../../support/CommonStyles';
import {Card} from "native-base";
import moment from 'moment';
import {strings} from '../../../localization/strings';
import {uses24HourClock} from "react-native-localize";


export default class PatientTasks extends Component {

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

        return (
            <TouchableOpacity onPress={() => {}}>
                <Card style={[commonStyles.cardStyle, item.isPriorityImportant ? {backgroundColor: '#F9E3E6'} : {}]}>
                    <Text style={[commonStyles.titleText]}>{created ? strings.formatString(strings.Patient.created, created) : null}</Text>
                    <View style={{flex: 1,}}>
                        <Text
                            style={[commonStyles.yellowTitle, {paddingVertical: 10}]}
                            numberOfLines={2}>
                            {item.text}
                        </Text>
                        {
                            item.visit ?
                                <Text style={[commonStyles.contentText]}>
                                    {
                                        item.visit && item.visit.start && item.visit.end ?
                                            moment(item.visit.start).format(
                                                uses24HourClock() ? 'ddd, MMM-DD-YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A'
                                            ) +
                                            moment(item.visit.end).format(
                                                uses24HourClock() ? ' - HH:mm' : ' - hh:mm A'
                                            )

                                            : ''
                                    }
                                </Text>
                                :
                                <Text style={[commonStyles.contentText, {color: '#FF0000'}]}>{strings.Tasks.noSchedule}</Text>
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
    tasks: PropTypes.array.isRequired,
    navigateTo: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
    list: {
        flex: 1,
        padding: 10,
    },
});
