import React, {Component} from 'react';
import {commonStyles} from '../../../../support/CommonStyles';
import {Card} from "native-base";
import {Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import {strings} from '../../../../localization/strings';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import PropTypes from 'prop-types';
import {Condition} from '../../../../models/Condition';

export default class ConditionRenderer extends Component {

    selectCondition = (condition: Condition) => {
        this.props.selectCondition && this.props.selectCondition(condition);
    };

    render () {

        const condition: Condition = this.props.condition;

        return (
            <TouchableHighlight style={commonStyles.listItemContainer}
                                onPress={() => this.selectCondition(condition)}
                                underlayColor='#FFFFFFFF'
                                activeOpacity={0.3}
                                {...this.props}

            >
                <Card style={commonStyles.cardStyle}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'flex-start'}}>
                        <Image source={require('../../../../assets/icons/patients/stethoscope.png')} style={{width: 24, height: 24}}/>
                        <Text
                            style={[commonStyles.titleText, {
                                flex: 1,
                                marginLeft: 10
                            }]}>
                            {condition.text}
                        </Text>
                    </View>
                    <View style={{flex: 1, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <View>
                            <Text style={[commonStyles.smallInfoText]}>
                                {strings.Conditions.lastUpdate} {moment(condition.lastUpdate).format(
                                    uses24HourClock() ? 'ddd, MMM-DD-YYYY, HH:mm' : 'ddd, MMM-DD-YYYY, hh:mm A'
                                )}
                            </Text>
                        </View>
                    </View>
                </Card>
            </TouchableHighlight>
        );
    }
}

ConditionRenderer.propTypes = {
    condition: PropTypes.object.isRequired,
    selectCondition: PropTypes.func,
};

const styles = StyleSheet.create({

});
