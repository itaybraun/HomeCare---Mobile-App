import React, {Component} from 'react';
import {StatusBar, Platform, Text, Image, View} from 'react-native';
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
import PatientsTasksScreen from './src/views/tasks/PatientsTasksScreen';
import QuestionnaireResponseScreen from './src/views/tasks/QuestionnaireResponseScreen';
import EditTaskScreen from './src/views/tasks/edit/EditTaskScreen';
import SelectPriorityScreen from './src/views/tasks/edit/SelectPriorityScreen';
import SelectPerformerScreen from './src/views/tasks/edit/SelectPerformerScreen';
import FlagScreen from './src/views/patients/patient/flags/FlagScreen';
import CurrentUserScreen from './src/views/settings/CurrentUserScreen';

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
            <SafeAreaProvider>
                <AppNavigator
                    screenProps={{
                        settings: this.settings,
                        eventEmitter: this.eventEmitter,
                    }}
                />
            </SafeAreaProvider>
        );
    }
}

const tabBarLabel = (focused, title) => {
    return <Text style={[{textAlign: 'center'}, focused && commonStyles.bold]}>{title}</Text>
};

const PatientsStack = createStackNavigator({
    Patients: PatientsScreen,
    Patient: PatientScreen,
    Flags: FlagsScreen,
    Flag: FlagScreen,
    EditFlag: EditFlagScreen,
    Questionnaire: QuestionnaireScreen,
    PatientsTasks: PatientsTasksScreen,
    Task: TaskScreen,
    EditTask: EditTaskScreen,
    NewTask: NewTaskScreen,
    SelectActivity: SelectActivityScreen,
    SelectVisit: SelectVisitScreen,
    SelectPriority: SelectPriorityScreen,
    SelectPerformer: SelectPerformerScreen,
    General: GeneralScreen,
    QuestionnaireResponse: QuestionnaireResponseScreen,
}, {
    defaultNavigationOptions: defaultNavigationOptions
});
const WorkStack = createStackNavigator({
    Work: WorkScreen,
    Task: TaskScreen,
    EditTask: EditTaskScreen,
    Flag: FlagScreen,
    EditFlag: EditFlagScreen,
    SelectVisit: SelectVisitScreen,
    SelectPriority: SelectPriorityScreen,
    SelectPerformer: SelectPerformerScreen,
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
    CurrentUser: CurrentUserScreen,
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
    // Messages: {
    //     screen: MessagesStack,
    //     navigationOptions: {
    //         tabBarLabel: ({focused}) => {
    //             return tabBarLabel(focused, strings.Tabs.messages)
    //         }
    //     },
    // },
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
        Login: {
            screen: LoginScreen,
        },
        Tabs: {
            screen: Tabs,
        }
    })
);
