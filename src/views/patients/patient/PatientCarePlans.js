import React, {Component} from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import {Patient} from '../../../models/Patient';


export default class PatientCarePlans extends Component {
    render() {
        return (
            <View style={{flex: 1, padding: 20}}>

            </View>
        );
    }
}

PatientCarePlans.propTypes = {
    patient: PropTypes.instanceOf(Patient).isRequired,
    navigateTo: PropTypes.func.isRequired
};
