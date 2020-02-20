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
import FlagsScreen from './src/views/patients/patient/flags/FlagsScreen';
import PatientScreen from './src/views/patients/patient/PatientScreen';
import FlagScreen from './src/views/patients/patient/flags/FlagScreen';
import {appColors} from './src/support/CommonStyles';
import TaskScreen from './src/views/tasks/TaskScreen';
import VisitScreen from './src/views/tasks/VisitScreen';

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
    Flags: FlagsScreen,
    Flag: FlagScreen,
});
const TasksStack = createStackNavigator({
    Tasks: TasksScreen,
    Task: TaskScreen,
    Visit: VisitScreen,
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
            backgroundColor: appColors.backgroundYellowColor,
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
