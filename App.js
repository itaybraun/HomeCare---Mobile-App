import React, {Component} from 'react';
import {StatusBar, Platform, Image, View} from 'react-native';
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
import {Utils} from './src/support/Utils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NotesScreen from './src/views/patients/NotesScreen';
import PatientScreen from './src/views/patients/PatientScreen';

export default class App extends React.Component {

    constructor() {
        super();

        Utils.initialize();
        this.api = new RESTAPI();

        if (Platform.OS === 'ios')
            StatusBar.setBarStyle('dark-content');
        else
            StatusBar.setBarStyle('light-content');
    }

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
}

const PatientsStack = createStackNavigator({
    Patients: PatientsScreen,
    Patient: PatientScreen,
    Notes: NotesScreen,
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
}, {
    defaultNavigationOptions: ({navigation}) => ({
        tabBarIcon: ({focused, horizontal, tintColor}) => {
            const {routeName} = navigation.state;
            let tabStyle = {tintColor: tintColor};
            if (routeName === 'Patients') {
                return <Image source={require('./src/assets/icons/tabs/patients.png')} style={tabStyle}/>
            } else if (routeName === 'Tasks') {
                return <Image source={require('./src/assets/icons/tabs/tasks.png')} style={tabStyle}/>
            } else if (routeName === 'Chat') {
                return <Image source={require('./src/assets/icons/tabs/chat.png')} style={tabStyle}/>
            } else if (routeName === 'Settings') {
                return <Image source={require('./src/assets/icons/tabs/settings.png')} style={tabStyle}/>
            }
        },
    }),
    tabBarOptions: {
        activeTintColor: '#000000',
        inactiveTintColor: '#777777',
        adaptive: false,
        labelStyle: {
            fontSize: 10,
        },
        style: {
            backgroundColor: 'rgba(229, 197, 92, 1)',
        }
    }
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
