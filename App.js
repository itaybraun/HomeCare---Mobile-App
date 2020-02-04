import React, {Component} from 'react';
import LoginScreen from './src/views/login/LoginScreen';
import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import RESTAPI from './src/api/REST/RESTAPI';
import PatientsScreen from './src/views/patients/PatientsScreen';
import TasksScreen from './src/views/tasks/TasksScreen';
import ChatScreen from './src/views/chat/ChatScreen';
import SettingsScreen from './src/views/settings/SettingsScreen';
import {strings} from './src/localization/strings';

export default class App extends React.Component {

    api = new RESTAPI();

    render() {
        return (
            <AppNavigator
                screenProps={
                    {
                        api: this.api,
                    }
                }
            />
        );
    }
};

const PatientsStack = createStackNavigator({
    Patients: PatientsScreen,
});
const TasksStack = createStackNavigator({
    Tasks: TasksScreen,
});
const ChatStack = createStackNavigator({
    Chat: ChatScreen,
});
const SettingsStack = createStackNavigator({
    Settings: SettingsScreen,
});

const Tabs = createBottomTabNavigator({
    Patients: {
        screen: PatientsStack,
        navigationOptions: {
            tabBarLabel: strings.Tabs.patients,
        },
    },
    Tasks: TasksStack,
    Chat: ChatStack,
    Settings: SettingsStack,
});

const AppNavigator = createAppContainer(createSwitchNavigator({
    Login: {
        screen: LoginScreen,
        navigationOptions: {
            headerShown: false,
        },
    },
    Tabs: {
        screen: Tabs,
        navigationOptions: {
            headerShown: false,
        },
    }
}));
