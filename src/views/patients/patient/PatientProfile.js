import React, {Component} from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet, Image} from 'react-native';
import {strings} from '../../../localization/strings';
import PropTypes from 'prop-types';
import {appColors, commonStyles, renderDisclosureIndicator} from '../../../support/CommonStyles';
import {Icon} from "native-base";
import {Patient} from '../../../models/Patient';


export default class PatientProfile extends Component {

    renderSections = (title, route, image, disabled = false) => {
        return (
            <TouchableOpacity
                activeOpacity={disabled ? 0.5 : 0.2}
                style={{opacity: disabled ? 0.5 : 1}}
                onPress={() => this.props.navigateTo(route, {patient: this.props.patient})}>
                <View style={styles.sectionContainer}>
                    {
                        image ?
                            <Image source={image} style={styles.sectionIcon}/> :
                            <Icon type='Entypo' name='heart' style={styles.sectionIcon}  />
                    }
                    <View style={styles.sectionTextContainer}>
                        <Text style={[commonStyles.contentText, {fontSize: 16}]}>{title}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    render() {
        return (
            <View style={{flex: 1, padding: 12}}>
                <ScrollView bounces={false} style={{flex: 1,}}>
                    {this.renderSections(strings.Patient.general, 'General', require('../../../assets/icons/profile/general.png'), true)}
                    {this.renderSections(strings.Patient.flags, 'Flags', require('../../../assets/icons/profile/flags.png'))}
                    {this.renderSections(strings.Patient.vital, 'Vital',  require('../../../assets/icons/profile/vital.png'), true)}
                    {this.renderSections(strings.Patient.mental, 'Metal', require('../../../assets/icons/profile/mental.png'), true)}
                    {this.renderSections(strings.Patient.body, 'Body', require('../../../assets/icons/profile/body.png'), true)}
                    {this.renderSections(strings.Patient.conditions, 'Conditions', null, true)}
                    {this.renderSections(strings.Patient.timeline, 'Timeline', null , true)}
                </ScrollView>
            </View>
        );
    }
}

PatientProfile.propTypes = {
    patient: PropTypes.instanceOf(Patient).isRequired,
    navigateTo: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
    sectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionIcon: {
        height: 30,
        width: 30,
        margin: 12,
        marginRight: 24,
    },
    sectionTextContainer: {
        flex: 1,
        paddingVertical: 12,
        justifyContent: 'center',
        alignSelf: 'stretch',
        borderBottomColor: '#CCCCCC',
        borderBottomWidth: 1
    },
    quickActionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginTop: 16,
    },
    linkContainer: {
        padding: 12,
    }
});
