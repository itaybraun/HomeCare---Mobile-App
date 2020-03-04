import React from 'react';
import {View, Platform, ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import {Icon} from "native-base";


export const appColors = {
    textColor: '#333333',
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

    infoText: {
        fontSize: 16,
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

    yellowText: {
        fontSize: 18,
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
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
    },

    cardStyle: {
        padding: 12,
        borderRadius: 4,
        overflow: 'hidden',
    },

    formItem: {
        padding: 0,
        paddingLeft: 11,
        paddingRight: 11,
        fontSize: 16,
    },

    formItemText: {
        fontSize: 18,
        color: appColors.textColor,
    },

    tabBar: {
        flexDirection: 'row',
    },

    tabItem: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#88888822',
    },
    tabItemText: {
        textTransform: 'uppercase',
        color: appColors.textColor,
    },
    tabItemSelected: {
        borderBottomColor: appColors.linkColor,
    },
    tabItemTextSelected: {
        color: appColors.linkColor,
    },

    headerButtonContainer: {
        marginRight: 15,
    },
};

export const renderSeparator = (style = null) => {
    return (
        <View style={style ? style : commonStyles.listSeparator} />
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

export const renderTabBar = (props, selectedIndex, onIndexChange) => {
    return (
        <View style={commonStyles.tabBar}>
            {
                props.navigationState.routes.map((route, i) => {
                    return (
                        <TouchableOpacity
                            activeOpacity={1}
                            key={route.key}
                            style={[commonStyles.tabItem, selectedIndex === i ? commonStyles.tabItemSelected : {}]}
                            onPress={() => onIndexChange && onIndexChange(i)}>
                            <Text style={[commonStyles.tabItemText, selectedIndex === i ? commonStyles.tabItemTextSelected : {}]}>{route.title}</Text>
                        </TouchableOpacity>
                    );
                })
            }
        </View>
    );
};

export const renderNavigationHeaderButton = (component, onPress) => {

    return (
        <TouchableOpacity style={commonStyles.headerButtonContainer} onPress={onPress}>
            {component}
        </TouchableOpacity>
    );
}
