import React from 'react';
import {View, Platform, ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import {Icon} from "native-base";


export const appColors = {
    textColor: '#333333',
    linkColor: '#5C00EC',
    lineColor: '#CCCCCC',
    yellowColor: '#FEC260',
    headerBackground: '#E9BD08',
    headerFontColor: '#FFFFFF',
    backgroundYellowColor: '#DEBB4A',
    pinkColor: '#F1A5BD',
};

export const commonStyles = {

    smallInfoText: {
        fontSize: 16,
        color: '#888888',
    },

    infoText: {
        fontSize: 18,
        color: '#888888',
    },

    titleText: {
        fontSize: 22,
        color: appColors.textColor,
    },

    boldTitleText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: appColors.textColor,
    },

    yellowTitleText: {
        fontSize: 22,
        color: appColors.yellowColor,
    },

    yellowText: {
        fontSize: 20,
        color: appColors.yellowColor,
    },

    contentText: {
        fontSize: 18,
        color: appColors.textColor,
    },

    link: {
        textTransform: 'uppercase',
        color: appColors.linkColor,
    },

    purpleTitleText: {
        fontSize: 22,
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

    plusText: {
        fontSize: 36,
        color: '#FFFFFF',
        paddingTop: Platform.OS === 'ios' ? 4 : 0
    },

    cardStyle: {
        padding: 12,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 0,
        marginTop: 0,
    },

    listItemContainer: {
        marginHorizontal: 10,
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
        fontSize: 16,
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



    radioButton: {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#999999',
    },

    radioButtonSelected: {
        borderColor: '#0F7152',
    },

    radioButtonInner: {
        height: 14,
        width: 14,
        backgroundColor: '#0F7152',
        borderRadius: 7,
    },



    pinkHeader:{
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: appColors.pinkColor,
        marginBottom: 5,
    },

    pinkHeaderText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },


    menuContainer: {
        marginHorizontal: 14,
        marginVertical: 6,
        justifyContent: 'space-between',
        flex: 1,
        flexDirection: 'row',
    },

    itemMenuContainer: {
        marginHorizontal: 1,
        borderWidth: 1,
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#000000',
    },

    menuIcon: {
        width: 30,
        height: 30,
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
};

export const renderRadioButton = (selected) => {
    return (
        <View style={[commonStyles.radioButton, selected ? commonStyles.radioButtonSelected : {}]}>
            {
                selected && <View style={commonStyles.radioButtonInner} />
            }
        </View>
    );
};
