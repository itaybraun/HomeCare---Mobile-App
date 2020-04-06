import React, {Component} from 'react';
import {commonStyles} from '../../../../support/CommonStyles';
import {Card} from "native-base";
import {Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import {strings} from '../../../../localization/strings';
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import PropTypes from 'prop-types';
import {Flag} from '../../../../models/Flag';

export default class FlagRenderer extends Component {

    static categoryImage = {
        admin: require('../../../../assets/icons/flags/caution.png'),
        behavioral: require('../../../../assets/icons/flags/caution.png'),
        clinical: require('../../../../assets/icons/flags/caution.png'),
        contact: require('../../../../assets/icons/flags/caution.png'),
        drug: require('../../../../assets/icons/flags/caution.png'),
        lab: require('../../../../assets/icons/flags/caution.png'),
        safety: require('../../../../assets/icons/flags/caution.png'),
    }

    static categoryColor = {
        admin: '#E6B12E',
        behavioral: '#E6B12E',
        clinical: '#E6B12E',
        contact: '#E6B12E',
        drug: '#E6B12E',
        lab: '#E6B12E',
        safety: '#E6B12E',
    };

    selectFlag = (flag: Flag) => {
        this.props.selectFlag && this.props.selectFlag(flag);
    };

    render () {

        const flag: Flag = this.props.flag;
        let categoryString = flag.category?.toLowerCase();

        return (
            <TouchableHighlight style={commonStyles.listItemContainer}
                                onPress={() => this.selectFlag(flag)}
                                underlayColor='#FFFFFFFF'
                                activeOpacity={0.3}
                                {...this.props}

            >
                <Card style={commonStyles.cardStyle}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'flex-start'}}>
                        <Image source={FlagRenderer.categoryImage[categoryString]} style={{width: 48, height: 48}}/>
                        <Text
                            style={[commonStyles.contentText, {
                                flex: 1,
                                marginLeft: 10
                            }]}
                            numberOfLines={2}>
                            {flag.text}
                        </Text>
                    </View>
                    <View style={{flex: 1, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <View style={[styles.priorityContainer, {backgroundColor: FlagRenderer.categoryColor[categoryString] + '26'}]}>
                            <Text numberOfLines={1} style={[
                                commonStyles.text,
                                {fontSize: 14,},
                                commonStyles.medium,
                                {color: FlagRenderer.categoryColor[categoryString]}
                                ]}>
                                {strings.Categories[categoryString]?.toUpperCase()}
                            </Text>
                        </View>
                        <View>
                            <Text numberOfLines={1} style={[commonStyles.smallContentText, commonStyles.bold]}>
                                {moment(flag.startDate).format('MMM-DD-YYYY')}
                                &nbsp;{strings.Flags.to}&nbsp;
                                {moment(flag.endDate).format('MMM-DD-YYYY')}
                            </Text>
                        </View>
                    </View>
                </Card>
            </TouchableHighlight>
        );
    }
}

FlagRenderer.propTypes = {
    flag: PropTypes.object.isRequired,
    selectFlag: PropTypes.func,
};

const styles = StyleSheet.create({
    priorityContainer: {
        marginLeft: -12,
        paddingHorizontal: 12,
        minWidth: 120,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,

    },

    statusContainer: {
        marginRight: -12,
        paddingHorizontal: 12,
        minWidth: 120,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
});
