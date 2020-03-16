import React, {Component} from 'react';
import {StatusBar, Platform, Image, View} from 'react-native';
import LoginScreen from './src/views/login/LoginScreen';
import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import PatientsScreen from './src/views/patients/PatientsScreen';
import WorkScreen from './src/views/work/WorkScreen';
import MessagesScreen from './src/views/messages/MessagesScreen';
import SettingsScreen from './src/views/settings/SettingsScreen';
import {strings} from './src/localization/strings';
import {Utils} from './src/support/Utils';
import FlagsScreen from './src/views/patients/patient/flags/FlagsScreen';
import PatientScreen from './src/views/patients/patient/PatientScreen';
import FlagScreen from './src/views/patients/patient/flags/FlagScreen';
import {appColors} from './src/support/CommonStyles';
import TaskScreen from './src/views/work/TaskScreen';
import VisitScreen from './src/views/work/VisitScreen';
import RESTAPI from './src/api/REST/RESTAPI';
import CalendarScreen from './src/views/work/calendar/CalendarScreen';
import {Settings} from './src/models/Settings';
import AsyncStorage from '@react-native-community/async-storage';
import {Consts} from './src/support/Consts';
import EventEmitter from 'eventemitter3';

// TODO: find a way to move this to RESTAPI
import './src/api/REST/RESTAPI+Tasks';
import './src/api/REST/RESTAPI+Flags';
import './src/api/REST/RESTAPI+Patients';
import './src/api/REST/RESTAPI+Practitioners';
import './src/api/REST/RESTAPI+Visits';
import './src/api/REST/RESTAPI+Questionnaire';
import QuestionnaireScreen from './src/views/patients/patient/questionnaire/QuestionnaireScreen';
import {API} from './src/api/API';

export default class App extends React.Component {

    constructor() {
        super();
    }

    state = {
        loading: true,
    };

    componentDidMount(): void {
        this.getData();
    }

    getData = async () => {
        this.setState({loading: true});
        Utils.initialize();
        this.eventEmitter = new EventEmitter();

        let settings = new Settings();
        try {
            const savedSettings = await AsyncStorage.getItem(Consts.STORAGE_SETTINGS);
            if (savedSettings) {
                settings = JSON.parse(savedSettings);
            }
        } catch (error) {console.log(error)}
        this.settings = settings;

        if (Platform.OS === 'ios')
            StatusBar.setBarStyle('dark-content');
        else
            StatusBar.setBarStyle('light-content');

        this.setState({loading: false});
    };

    render() {

        if (this.state.loading) {
            return <View />
        }

        return (
            <AppNavigator
                screenProps={{
                    settings: this.settings,
                    eventEmitter: this.eventEmitter,
                }}
            />
        );
    }
}


const defaultNavigationOptions = {
    headerStyle: {
        backgroundColor: appColors.headerBackground,
    },
    headerTintColor: appColors.headerFontColor,
};

const PatientsStack = createStackNavigator({
    Patients: PatientsScreen,
    Patient: PatientScreen,
    Flags: FlagsScreen,
    Flag: FlagScreen,
    Questionnaire: QuestionnaireScreen,
}, {
    defaultNavigationOptions: defaultNavigationOptions
});
const WorkStack = createStackNavigator({
    Work: WorkScreen,
    Task: TaskScreen,
    Visit: VisitScreen,
    Calendar: CalendarScreen,
}, {
    defaultNavigationOptions: defaultNavigationOptions
});
const MessagesStack = createStackNavigator({
    Messages: MessagesScreen,
}, {
    defaultNavigationOptions: defaultNavigationOptions
});
const SettingsStack = createStackNavigator({
    Settings: SettingsScreen,
}, {
    defaultNavigationOptions: defaultNavigationOptions
});

const Tabs = createBottomTabNavigator({
    Work: {
        screen: WorkStack,
        navigationOptions: {
            tabBarLabel: strings.Tabs.work,
        },
    },
    Patients: {
        screen: PatientsStack,
        navigationOptions: {
            tabBarLabel: strings.Tabs.patients,
        },
    },
    Messages: MessagesStack,
    Settings: SettingsStack,
}, {
    defaultNavigationOptions: ({navigation}) => ({
        tabBarIcon: ({focused, horizontal, tintColor}) => {
            const {routeName} = navigation.state;
            let tabStyle = {tintColor: tintColor};
            if (routeName === 'Patients') {
                return <Image source={require('./src/assets/icons/tabs/patients.png')} style={tabStyle}/>;
            } else if (routeName === 'Work') {
                return <Image source={require('./src/assets/icons/tabs/work.png')} style={tabStyle}/>;
            } else if (routeName === 'Messages') {
                return <Image source={require('./src/assets/icons/tabs/chat.png')} style={tabStyle}/>;
            } else if (routeName === 'Settings') {
                return <Image source={require('./src/assets/icons/tabs/settings.png')} style={tabStyle}/>;
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

const AppNavigator = createAppContainer(
    createSwitchNavigator({
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
    })
);
