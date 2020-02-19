import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import AppScreen from '../../../support/AppScreen';
import { TabView, TabBar } from 'react-native-tab-view';
import {Patient} from '../../../models/Patient';
import Loading from '../../../support/Loading';
import {APIRequest} from '../../../api/API';
import {strings} from '../../../localization/strings';
import { Card, Icon, Text } from 'native-base';
import {appColors, commonStyles, renderSeparator, renderTabBar} from '../../../support/CommonStyles';
import PatientProfile from './PatientProfile';
import PatientCarePlans from './PatientCarePlans';
import PatientTasks from './PatientTasks';


export default class PatientScreen extends AppScreen {

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
    };

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();
    }

    getData = async (refresh = true) => {
        //this.setState({loading: true});
        //this.setState({loading: false});
    };

    navigateToView = (view) => {
        const patient: Patient = this.props.navigation.getParam('patient', null);
        this.navigateTo(view, {patient: patient});
    };

    handleTabIndexChange = index => {
        this.setState({ index });
    };

    renderTabBar = (props) => {
        return renderTabBar(props, this.state.index);
    };

    renderScene = ({ route }) => {
        switch (route.key) {
            case 'profile':
                return <PatientProfile navigateTo={this.navigateToView} />;
            case 'care':
                return <PatientCarePlans />;
            case 'tasks':
                return <PatientTasks />;
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
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
