import React from 'react';
import { View } from 'react-native';


export const commonStyles = {
    input: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        height: 40,
        padding: 5,
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
