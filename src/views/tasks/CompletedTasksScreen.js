import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput, Text, Image, TouchableHighlight} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {commonStyles, renderLoading, renderSeparator} from '../../support/CommonStyles';
import {strings} from '../../localization/strings';
import {APIRequest} from '../../api/API';
import {Status, Task} from '../../models/Task';
import {Patient} from '../../models/Patient';
import {SwipeListView} from 'react-native-swipe-list-view';
import {Card, Icon} from 'native-base';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";

export default class CompletedTasksScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.CompletedTasks.completedTasks,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        tasks: [],
        responses: [],
    };

    get patient(): Patient {
        return this.props.navigation.getParam('patient', null);
    }

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
        const tasks = await this.getTasks(refresh);
        const responses = await this.getResponses(refresh);
        this.setState({...tasks, ...responses, loading: false});
    };

    getTasks = async (refresh = true) => {
        if (this.patient) {
            let result: APIRequest = await this.api.getTasks(this.patient.id, [Status.COMPLETED]);
            if (result.success) {
                return {tasks: result.data};
            } else {
                this.showError(result.data);
            }
        }

        return {tasks: []};
    };

    getResponses = async (refresh = true) => {
        if (this.patient) {
            let result: APIRequest = await this.api.getQuestionnaireResponses(this.patient.id);
            if (result.success) {
                return {responses: result.data};
            } else {
                this.showError(result.data);
            }
        }

        return {responses: []};
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    selectTask = (task: Task) => {
        this.navigateTo('QuestionnaireResponse',{
            task: task,
            response: this.state.responses.find(response => response.taskId === task.id),
        });
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
                <Text style={commonStyles.smallContentText}>{strings.CompletedTasks.noData}</Text>
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
                    <Image style={commonStyles.menuIcon} source={require('../../assets/icons/flags/delete.png')} />
                </TouchableOpacity>
            </View>
        );
    };

    renderTask = ({item}) => {

        let task: Task = item;

        return (

            <TouchableHighlight
                style={commonStyles.listItemContainer}
                underlayColor='#FFFFFFFF'
                activeOpacity={0.3}
                onPress={() => this.selectTask(task)}>
                <Card style={[commonStyles.cardStyle]}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems:'center'}}>
                        <Image source={require('../../assets/icons/tasks/completed_task.png')} style={{width: 48, height: 48}} />
                        <View style={{flex: 1, marginLeft: 10}}>
                            <Text
                                style={[commonStyles.contentText]}
                                numberOfLines={2}>
                                {task.text}
                            </Text>
                            {
                                task.executionDate &&
                                <Text style={[commonStyles.smallInfoText, {marginTop: 5}]}>
                                    {
                                        task.visit && task.visit.start && task.visit.end ?
                                            moment(task.visit.start).format(
                                                uses24HourClock() ? 'ddd, MMM DD YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A'
                                            ) +
                                            moment(task.visit.end).format(
                                                uses24HourClock() ? ' - HH:mm' : ' - hh:mm A'
                                            )

                                            : ''
                                    }
                                </Text>
                            }
                        </View>
                    </View>
                </Card>
            </TouchableHighlight>
        )
    };

    render() {
        return (
            <View style={commonStyles.screenContainer}>
                <SwipeListView
                    ref={(list) => {
                        this.list = list;
                    }}
                    style={styles.list}
                    contentContainerStyle={{ flexGrow: 1 }}
                    data={this.state.tasks}
                    keyExtractor={item => item.id}
                    renderItem={this.renderTask}
                    renderHiddenItem={this.renderHiddenItem}
                    ItemSeparatorComponent={() => renderSeparator()}
                    ListEmptyComponent={this.renderListEmpty}
                    ListHeaderComponent={this.renderListHeader}
                    ListFooterComponent={this.renderListFooter}
                    onRefresh={this.getData}
                    refreshing={false}
                    rightOpenValue={0}
                    leftOpenValue={0}
                    disableLeftSwipe
                    disableRightSwipe
                    closeOnRowBeginSwipe
                    recalculateHiddenLayout
                />
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
