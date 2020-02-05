import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {Patient} from '../../models/Patient';
import Loading from '../../support/Loading';
import {APIRequest} from '../../api/API';
import {strings} from '../../localization/strings';
import { Card, Icon, Text } from 'native-base';
import {commonStyles, renderSeparator} from '../../support/CommonStyles';

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
    };

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();
    }

    getData = async (refresh = true) => {
        this.setState({loading: true});
        this.setState({loading: false});
    };

    navigateTo = (view) => {
        const patient: Patient = this.props.navigation.getParam('patient', null);
        this.props.navigation.navigate(view, {patient: patient});
    };

    render() {
        return (
            <View style={styles.container}>
                <Text>This view is not complete at all. Only notes link works:</Text>
                <TouchableOpacity onPress={() => this.navigateTo('Notes')}>
                    <Text>{strings.Patient.notes}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
});
