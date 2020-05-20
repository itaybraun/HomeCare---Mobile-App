import React, {Component} from 'react';
import {StatusBar, Platform, Text, Image, View, AppState} from 'react-native';
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
import EditFlagScreen from './src/views/patients/patient/flags/edit/EditFlagScreen';
import {appColors, commonStyles, defaultNavigationOptions} from './src/support/CommonStyles';
import TaskScreen from './src/views/tasks/TaskScreen';
import RESTAPI from './src/api/REST/RESTAPI';
import {Settings} from './src/models/Settings';
import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorageConsts} from './src/support/Consts';
import EventEmitter from 'eventemitter3';
import VisitScreen from './src/views/visits/VisitScreen';
import SelectVisitScreen from './src/views/visits/SelectVisitScreen';
import {setCustomText} from 'react-native-global-props/src/CustomFunctions/setCustomText';
import {setCustomTextInput} from 'react-native-global-props/src/CustomFunctions/setCustomTextInput';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import QuestionnaireScreen from './src/views/tasks/questionnaire/QuestionnaireScreen';
import NewTaskScreen from './src/views/tasks/edit/NewTaskScreen';
import SelectActivityScreen from './src/views/tasks/edit/SelectActivityScreen';
import GeneralScreen from './src/views/patients/patient/general/GeneralScreen';
import ImageQualityScreen from './src/views/settings/ImageQualityScreen';
import PatientsTasksScreen from './src/views/patients/patient/PatientsTasksScreen';
import QuestionnaireResponseScreen from './src/views/tasks/questionnaire/QuestionnaireResponseScreen';
import EditTaskScreen from './src/views/tasks/edit/EditTaskScreen';
import SelectPriorityScreen from './src/views/tasks/edit/SelectPriorityScreen';
import SelectPerformerScreen from './src/views/tasks/edit/SelectPerformerScreen';
import FlagScreen from './src/views/patients/patient/flags/FlagScreen';
import CurrentUserScreen from './src/views/settings/CurrentUserScreen';
import SelectPatientScreen from './src/views/tasks/edit/SelectPatientScreen';
import QuestionnaireChoiceItemScreen from './src/views/tasks/questionnaire/QuestionnaireChoiceItemScreen';
import QuestionnaireInputItemScreen from './src/views/tasks/questionnaire/QuestionnaireInputItemScreen';
import TaskSendMailScreen from './src/views/tasks/TaskSendMailScreen';
import EmailAddressScreen from './src/views/settings/EmailAddressScreen';

// TODO: find a way to move this to RESTAPI
import './src/api/REST/RESTAPI+Tasks';
import './src/api/REST/RESTAPI+Flags';
import './src/api/REST/RESTAPI+Patients';
import './src/api/REST/RESTAPI+Practitioners';
import './src/api/REST/RESTAPI+Visits';
import './src/api/REST/RESTAPI+Questionnaire';
import './src/api/REST/RESTAPI+Relatives';
import NewFlagScreen from './src/views/patients/patient/flags/edit/NewFlagScreen';
import SelectCategoryScreen from './src/views/patients/patient/flags/edit/SelectCategoryScreen';
import SelectTextScreen from './src/views/other/SelectTextScreen';
import LogsScreen from './src/views/settings/LogsScreen';
import {Logger} from './src/support/Logger';
import DeviceInfo from 'react-native-device-info';

const axios = require('axios');
axios.interceptors.request.use(request => {
    log.debug('Starting Request: ' + request.url);
    return request
});

axios.interceptors.response.use(response => {
    log.debug('Response: ' + response.status);
    return response;
});

export default class App extends React.Component {

    constructor() {
        super();
    }

    state = {
        loading: true,
    };

    componentDidMount(): void {
        Logger.init();
        log.raw('-------------------------------');
        log.info('App started. Welcome!');
        AppState.addEventListener('change', this.handleAppStateChange);
        this.getData();
    }

    componentWillUnmount(): void {
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    getData = async () => {
        this.setState({loading: true});
        setCustomText({style: commonStyles.text});
        setCustomTextInput({style: commonStyles.text});
        Utils.initialize();
        this.eventEmitter = new EventEmitter();
        try {

            const deviceName = await DeviceInfo.getDeviceName();

            let deviceFeatures = [
                {'getVersion': DeviceInfo.getVersion() + "." + DeviceInfo.getBuildNumber()},
                {'getDeviceName': deviceName},
                {'getModel': DeviceInfo.getModel()},
                {'getSystemName': DeviceInfo.getSystemName()},
                {'getSystemVersion': DeviceInfo.getSystemVersion()},
            ];
            log.info('Device info: ' + JSON.stringify(deviceFeatures));
        } catch (error) {
            log.error('Error getting device info: ' + error.message);
        }

        let settings = new Settings();
        try {
            const savedSettings = await AsyncStorage.getItem(AsyncStorageConsts.STORAGE_SETTINGS);
            if (savedSettings) {
                log.info('Saved settings: ' + savedSettings);
                settings = new Settings(JSON.parse(savedSettings));
            } else {
                log.info('No saved settings. Applying defaults')
            }
        } catch (error) {log.error(error)}
        this.settings = settings;

        this.setState({loading: false});
    };

    handleAppStateChange = (nextAppState) => {
        log.debug('App state changed to ' + nextAppState);
    };

    // gets the current screen from navigation state
    getActiveRouteName = (navigationState) => {
        if (!navigationState) {
            return null;
        }
        const route = navigationState.routes[navigationState.index];
        // dive into nested navigators
        if (route.routes) {
            return this.getActiveRouteName(route);
        }
        return route.routeName;
    }

    render() {

        if (this.state.loading) {
            return <View />
        }

        return (
            <SafeAreaProvider>
                <AppNavigator
                    screenProps={{
                        settings: this.settings,
                        eventEmitter: this.eventEmitter,
                    }}
                    onNavigationStateChange={(prevState, currentState, action) => {
                        const currentRouteName = this.getActiveRouteName(currentState);
                        const previousRouteName = this.getActiveRouteName(prevState);

                        if (previousRouteName !== currentRouteName) {
                            log.info('Showing ' + currentRouteName);
                        }
                    }}
                />
            </SafeAreaProvider>
        );
    }
}

const tabBarLabel = (focused, title) => {
    return <Text style={[{textAlign: 'center'}, focused && commonStyles.bold]}>{title}</Text>
};

const LoginStack = createStackNavigator({
    Login: LoginScreen,
    Logs: LogsScreen,
}, {
    defaultNavigationOptions: defaultNavigationOptions
});

const PatientsStack = createStackNavigator({
    Patients: PatientsScreen,
    Patient: PatientScreen,

    General: GeneralScreen,

    Flags: FlagsScreen,
    Flag: FlagScreen,
    EditFlag: EditFlagScreen,
    NewFlag: NewFlagScreen,
    SelectText: SelectTextScreen,
    SelectCategory: SelectCategoryScreen,

    Questionnaire: QuestionnaireScreen,
    QuestionnaireChoiceItem: QuestionnaireChoiceItemScreen,
    QuestionnaireInputItem: QuestionnaireInputItemScreen,
    QuestionnaireResponse: QuestionnaireResponseScreen,
    TaskSendMail: TaskSendMailScreen,

    PatientsTasks: PatientsTasksScreen,
    Task: TaskScreen,
    NewTask: NewTaskScreen,
    EditTask: EditTaskScreen,
    SelectPatient: SelectPatientScreen,
    SelectActivity: SelectActivityScreen,
    SelectVisit: SelectVisitScreen,
    SelectPriority: SelectPriorityScreen,
    SelectPerformer: SelectPerformerScreen,
}, {
    defaultNavigationOptions: defaultNavigationOptions
});
const WorkStack = createStackNavigator({
    Work: WorkScreen,

    Task: TaskScreen,
    NewTask: NewTaskScreen,
    EditTask: EditTaskScreen,
    SelectPatient: SelectPatientScreen,
    SelectActivity: SelectActivityScreen,
    SelectVisit: SelectVisitScreen,
    SelectPriority: SelectPriorityScreen,
    SelectPerformer: SelectPerformerScreen,

    Flag: FlagScreen,
    EditFlag: EditFlagScreen,
    NewFlag: NewFlagScreen,
    SelectText: SelectTextScreen,
    SelectCategory: SelectCategoryScreen,

    Questionnaire: QuestionnaireScreen,
    QuestionnaireChoiceItem: QuestionnaireChoiceItemScreen,
    QuestionnaireInputItem: QuestionnaireInputItemScreen,

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
    CurrentUser: CurrentUserScreen,
    EmailAddress: EmailAddressScreen,
    Logs: LogsScreen,
}, {
    defaultNavigationOptions: defaultNavigationOptions
});

const Tabs = createBottomTabNavigator({
    Work: {
        screen: WorkStack,
        navigationOptions: {
            tabBarLabel: ({focused}) => {
                return tabBarLabel(focused, strings.Tabs.work)
            },
        },
    },
    Patients: {
        screen: PatientsStack,
        navigationOptions: {
            tabBarLabel: ({focused}) => {
                return tabBarLabel(focused, strings.Tabs.patients)
            }
        },
    },
    Settings: {
        screen: SettingsStack,
        navigationOptions: {
            tabBarLabel: ({focused}) => {
                return tabBarLabel(focused, strings.Tabs.settings)
            }
        },
    },
}, {
    defaultNavigationOptions: ({navigation}) => ({
        tabBarIcon: ({focused, horizontal, tintColor}) => {
            const {routeName} = navigation.state;
            let tabStyle = {tintColor: tintColor};
            if (routeName === 'Patients') {
                return (
                <View style={{marginTop: 6}}>
                    <Image source={require('./src/assets/icons/tabs/patients.png')} style={tabStyle}/>
                </View>
                );
            } else if (routeName === 'Work') {
                return (
                    <View style={{marginTop: 6}}>
                        <Image source={require('./src/assets/icons/tabs/work.png')} style={tabStyle}/>
                    </View>
                );
            } else if (routeName === 'Settings') {
                return (
                    <View style={{marginTop: 6}}>
                        <Image source={require('./src/assets/icons/tabs/settings.png')} style={tabStyle}/>
                    </View>
                );
            }
        }
    }),
    tabBarOptions: {
        activeTintColor: '#000000',
        inactiveTintColor: '#000000',
        adaptive: false,
        labelStyle: {
            ...commonStyles.text,
            fontSize: 12,
        },
        style: {
            backgroundColor: appColors.mainColor,
        }
    }
});

WorkStack.navigationOptions = ({ navigation }) => {
    let hideTabBar = navigation.state.routes[navigation.state.index].params?.hideTabBar || false;
    return {
        tabBarVisible: !hideTabBar
    }
};

PatientsStack.navigationOptions = ({ navigation }) => {
    let hideTabBar = navigation.state.routes[navigation.state.index].params?.hideTabBar || false;
    return {
        tabBarVisible: !hideTabBar
    }
};

const AppNavigator = createAppContainer(
    createSwitchNavigator({
        Login: LoginStack,
        Tabs: Tabs,
    })
);
