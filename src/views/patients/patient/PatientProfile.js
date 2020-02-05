import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {strings} from '../../../localization/strings';


export default class PatientProfile extends Component {
    render() {
        return (
            <View style={{flex: 1, padding: 20}}>
                <TouchableOpacity onPress={() => this.props.navigateTo('Notes')}>
                    <Text>{strings.Patient.notes}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}
