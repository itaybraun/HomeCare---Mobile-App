import React from 'react';
import {View, Platform, ActivityIndicator, Text} from 'react-native';
import {Icon} from "native-base";


export const appColors = {
    textColor: '#555555',
    linkColor: '#5C00EC',
    lineColor: '#CCCCCC',
    yellowColor: '#FEC260',
    backgroundYellowColor: '#DEBB4A',
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

    yellowTitle: {
        fontSize: 24,
        color: appColors.yellowColor,
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

    screenContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    emptyScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    listSeparator: {
        height: 10,
    },

    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },

    blackButtonContainer: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
    }
};

export const renderSeparator = () => {
    return (
        <View style={commonStyles.listSeparator} />
    );
};

export const renderLoading = (loading)  => {
    return ( loading &&
        <View style={commonStyles.loadingContainer}>
            <ActivityIndicator size="large" />
        </View>
    );
}

export const renderDisclosureIndicator = () => {
    return (
        <Icon type="SimpleLineIcons" name="arrow-right" style={{color: appColors.textColor, marginBottom: -4}} />
    );
};
