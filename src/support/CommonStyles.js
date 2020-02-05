import React from 'react';
import {View, Platform} from 'react-native';


export const commonStyles = {
    smallInfoText: {
        fontSize: 12,
        color: '#888888',
    },

    titleText: {
        fontSize: 18,
        color: '#000000',
    },

    boldTitleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },

    contentText: {
        fontSize: 14,
        color: '#000000',
    },

    link: {
        textTransform: 'uppercase',
        color: '#5C00EC',
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
