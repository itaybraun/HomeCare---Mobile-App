import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput, Text, Image, TouchableHighlight} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {appColors, commonStyles, renderLoading, renderSeparator} from '../../support/CommonStyles';
import {strings} from '../../localization/strings';
import {APIRequest} from '../../api/API';
import {Status, Task} from '../../models/Task';
import {Patient} from '../../models/Patient';
import {SwipeListView} from 'react-native-swipe-list-view';
import {Card, Icon} from 'native-base';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import ActionSheet from 'react-native-simple-action-sheet';
import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorageConsts} from '../../support/Consts';

export default class CompletedTasksScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.CompletedTasks.completedTasks,
            headerBackTitle: ' ',
            headerRight: () => {
                return (
                    <TouchableOpacity style={{padding: 12}} onPress={navigation.getParam('showSortMenu')}>
                        <Icon type="MaterialCommunityIcons" name="sort" style={{fontSize: 22, color: appColors.headerFontColor}}/>
                    </TouchableOpacity>
                )
            }
        }
    };

    state = {
        loading: false,
        tasks: [],
        responses: [],
        sortBy: null,
    };

    possibleSortValues = [
        {key: 'name', label: strings.CompletedTasks.sortByName},
        {key: 'dateAsc', label: strings.CompletedTasks.sortByDateAsc},
        {key: 'dateDesc', label: strings.CompletedTasks.sortByDateDesc},
    ];

    get patient(): Patient {
        return this.props.navigation.getParam('patient', null);
    }

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();

        this.props.navigation.setParams({
            showSortMenu: this.showSortMenu,
        });
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        this.setState({loading: true});
        const tasks = await this.getTasks(refresh);
        const responses = await this.getResponses(refresh);
        const sortBy = await AsyncStorage.getItem(AsyncStorageConsts.COMPLETED_TASKS_SORT) || this.possibleSortValues[0].key;
        this.setState({...tasks, ...responses, sortBy: sortBy, loading: false});
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

    showSortMenu = async () => {
        let options = this.possibleSortValues.map(value => value.label);
        if (Platform.OS === 'ios')
            options.push(strings.Common.cancelButton);

        ActionSheet.showActionSheetWithOptions({
                options: options,
                title: strings.CompletedTasks.sorting,
                cancelButtonIndex: options.length - 1,
            },
            async (buttonIndex) => {
                if (buttonIndex < this.possibleSortValues.length) {
                    let value = this.possibleSortValues[buttonIndex].key;
                    AsyncStorage.setItem(AsyncStorageConsts.COMPLETED_TASKS_SORT, value);
                    this.setState({
                        sortBy: value,
                    })
                }
            });
    };

    selectTask = (task: Task) => {
        this.navigateTo('QuestionnaireResponse',{
            task: task,
            response: this.state.responses.find(response => response.taskId === task.id),
        });
    };

    sortByName = (a: Task, b: Task) => {
        if (a.text > b.text) {
            return 1;
        }
        if (a.text < b.text) {
            return -1;
        }
        return 0;
    };

    sortByDateAsc = (a: Task, b: Task) => {
        return a.executionDate - b.executionDate;
    };

    sortByDateDesc = (a: Task, b: Task) => {
        return b.executionDate - a.executionDate;
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
                                        task.executionDate &&
                                            moment(task.executionDate).format(
                                                uses24HourClock() ? 'ddd, MMM DD YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A')
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

        let tasks = this.state.tasks;

        console.log(this.hasOwnProperty('sort' + this.state.sortBy))

        if (this.state.sortBy && this.hasOwnProperty('sortBy' + this.state.sortBy.capitalize())) {
            tasks = tasks.sort(this['sortBy' + this.state.sortBy.capitalize()]);
        }

        return (
            <View style={commonStyles.screenContainer}>
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
