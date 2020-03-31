import React, {Component} from 'react';
import {StatusBar, Platform, Image, View} from 'react-native';
import LoginScreen from './src/views/login/LoginScreen';
import {createStackNavigator, TransitionPresets} from 'react-navigation-stack';
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
import {appColors, commonStyles} from './src/support/CommonStyles';
import TaskScreen from './src/views/tasks/TaskScreen';
import RESTAPI from './src/api/REST/RESTAPI';
import CalendarScreen from './src/views/work/calendar/CalendarScreen';
import {Settings} from './src/models/Settings';
import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorageConsts} from './src/support/Consts';
import EventEmitter from 'eventemitter3';
import VisitScreen from './src/views/visits/VisitScreen';
import SelectVisitScreen from './src/views/visits/SelectVisitScreen';
import {setCustomText} from 'react-native-global-props/src/CustomFunctions/setCustomText';
import {setCustomTextInput} from 'react-native-global-props/src/CustomFunctions/setCustomTextInput';

// TODO: find a way to move this to RESTAPI
import './src/api/REST/RESTAPI+Tasks';
import './src/api/REST/RESTAPI+Flags';
import './src/api/REST/RESTAPI+Patients';
import './src/api/REST/RESTAPI+Practitioners';
import './src/api/REST/RESTAPI+Visits';
import './src/api/REST/RESTAPI+Questionnaire';
import './src/api/REST/RESTAPI+Relatives';
import QuestionnaireScreen from './src/views/patients/patient/questionnaire/QuestionnaireScreen';
import {API} from './src/api/API';
import NewTaskScreen from './src/views/tasks/NewTaskScreen';
import SelectActivityScreen from './src/views/tasks/SelectActivityScreen';
import GeneralScreen from './src/views/patients/patient/general/GeneralScreen';
import ImageQualityScreen from './src/views/settings/ImageQualityScreen';
import CompletedTasksScreen from './src/views/tasks/CompletedTasksScreen';
import QuestionnaireResponseScreen from './src/views/tasks/QuestionnaireResponseScreen';

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
        setCustomText({style: commonStyles.text});
        setCustomTextInput({style: commonStyles.text});
        Utils.initialize();
        this.eventEmitter = new EventEmitter();

        let settings = new Settings();
        try {
            const savedSettings = await AsyncStorage.getItem(AsyncStorageConsts.STORAGE_SETTINGS);
            if (savedSettings) {
                settings = new Settings(JSON.parse(savedSettings));
            }
        } catch (error) {console.log(error)}
        this.settings = settings;

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
    headerTitleStyle: {
        fontSize: 20,
        color: appColors.headerFontColor,
    },
    headerTintColor: appColors.headerFontColor,
    ...TransitionPresets.SlideFromRightIOS,
};

const PatientsStack = createStackNavigator({
    Patients: PatientsScreen,
    Patient: PatientScreen,
    Flags: FlagsScreen,
    Flag: FlagScreen,
    Questionnaire: QuestionnaireScreen,
    CompletedTasks: CompletedTasksScreen,
    NewTask: NewTaskScreen,
    SelectActivity: SelectActivityScreen,
    SelectVisit: SelectVisitScreen,
    General: GeneralScreen,
    QuestionnaireResponse: QuestionnaireResponseScreen,
}, {
    defaultNavigationOptions: defaultNavigationOptions
});
const WorkStack = createStackNavigator({
    Work: WorkScreen,
    Task: TaskScreen,
    Flag: FlagScreen,
    SelectVisit: SelectVisitScreen,
    Calendar: CalendarScreen,
    NewTask: NewTaskScreen,
    Visit: VisitScreen
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
    ImageQuality: ImageQualityScreen,
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
            fontSize: 12,
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
        },
        Tabs: {
            screen: Tabs,
        }
    })
);
