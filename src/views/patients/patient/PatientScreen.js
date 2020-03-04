import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import AppScreen from '../../../support/AppScreen';
import { TabView, TabBar } from 'react-native-tab-view';
import {Patient} from '../../../models/Patient';
import Loading from '../../../support/Loading';
import {APIRequest} from '../../../api/API';
import {strings} from '../../../localization/strings';
import { Card, Icon, Text } from 'native-base';
import {appColors, commonStyles, renderLoading, renderSeparator, renderTabBar} from '../../../support/CommonStyles';
import PatientProfile from './PatientProfile';
import PatientCarePlans from './PatientCarePlans';
import PatientTasks from './PatientTasks';


export default class PatientScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        const patient: Patient = navigation.getParam('patient', null);
        let title = strings.Patient.title;
        if (patient) {
            title = patient.fullName;
        }

        return {
            title: title,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        index: 0,
        routes: [
            { key: 'profile', title: strings.Patient.profile },
            { key: 'care', title: strings.Patient.carePlans },
            { key: 'tasks', title: strings.Patient.tasks },
        ],

        tasks: [],
    };

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
        this.setState({...tasks, loading: false});
    };

    getTasks = async (refresh = true) => {
        const patient: Patient = this.props.navigation.getParam('patient', null);
        if (patient) {
            let result: APIRequest = await this.api.getTasks(patient.id);
            if (result.success) {
                return {tasks: result.data};
            } else {
                this.showError(result.data);
            }
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    navigateToView = (view) => {
        const patient: Patient = this.props.navigation.getParam('patient', null);
        this.navigateTo(view, {patient: patient});
    };

    handleTabIndexChange = index => {
        this.setState({ index });
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderTabBar = (props) => {
        return renderTabBar(props, this.state.index, (index) => this.setState({index: index}));
    };

    renderScene = ({ route }) => {
        switch (route.key) {
            case 'profile':
                return <PatientProfile navigateTo={this.navigateToView} />;
            case 'care':
                return <PatientCarePlans />;
            case 'tasks':
                return <PatientTasks tasks={this.state.tasks} navigateTo={this.navigateToView} />;
            default:
                return null;
        }
    };

    render() {
        return (
            <View style={commonStyles.screenContainer}>
                <TabView
                    navigationState={this.state}
                    onIndexChange={this.handleTabIndexChange}
                    renderScene={this.renderScene}
                    renderTabBar={this.renderTabBar}
                />
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
