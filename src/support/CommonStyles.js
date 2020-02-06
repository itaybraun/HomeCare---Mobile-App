import React from 'react';
import {View, Platform} from 'react-native';
import {Icon} from "native-base";


export const appColors = {
    textColor: '#555555',
    linkColor: '#5C00EC',
    lineColor: '#CCCCCC',
};

export const commonStyles = {

    smallInfoText: {
        fontSize: 12,
        color: '#888888',
    },

    titleText: {
        fontSize: 18,
        color: appColors.textColor,
    },

    boldTitleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: appColors.textColor,
    },

    contentText: {
        fontSize: 14,
        color: appColors.textColor,
    },

    link: {
        textTransform: 'uppercase',
        color: appColors.linkColor,
    },

    input: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        height: 40,
        padding: 5,
        color: '#000000',

    },
    emptyScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    listSeparator: {
        height: 10,
    },
};

export const renderSeparator = () => {
    return (
        <View style={commonStyles.listSeparator} />
    );
};

export const renderDisclosureIndicator = () => {
    return (
        <Icon type="SimpleLineIcons" name="arrow-right" style={{color: appColors.textColor, marginBottom: -4}} />
    );
};
