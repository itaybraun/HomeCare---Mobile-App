import React from 'react';
import {View, Platform, ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import { I18nManager } from 'react-native';
import {Icon} from "native-base";

export const appColors = {
    mainColor: '#6E78F7',
    textColor: '#0D0D0D',
    linkColor: '#5C00EC',
    lineColor: '#CCCCCC',
    yellowColor: '#FEC260',
    headerBackground: '#E9BD08',
    headerFontColor: '#FFFFFF',
    backgroundYellowColor: '#DEBB4A',
    pinkColor: '#F1A5BD',
};

function commonTextProperties() {
    return {
        fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue' : 'Roboto',
        //writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr'
    };
}

function light() {
    return {
        ...Platform.select({
            ios: {
                fontWeight: '300',
            },
            android: {
                fontFamily: 'Roboto_light',
            },
        }),
    }
}

function medium() {
    return {
        ...Platform.select({
            ios: {
                fontWeight: '600',
            },
            android: {
                fontFamily: 'Roboto_medium',
            },
        }),
    }
}

function bold() {
    return {
        ...Platform.select({
            ios: {
                fontWeight: 'bold',
            },
            android: {
                fontFamily: 'Roboto_bold',
            },
        }),
    }
}

export const commonStyles = {
    text: {
        ...commonTextProperties(),
    },
    light: {
        ...commonTextProperties(),
        ...light(),
    },
    medium: {
        ...commonTextProperties(),
        ...medium(),
    },

    bold: {
        ...commonTextProperties(),
        ...bold(),
    },

    h1: {
        fontSize: 56,
        ...commonTextProperties(),
        ...medium(),
    },

    h2: {
        fontSize: 26,
        ...commonTextProperties(),
        ...medium(),
    },
    smallInfoText: {
        fontSize: 16,
        color: '#888888',
        ...commonTextProperties()
    },

    infoText: {
        fontSize: 18,
        color: '#888888',
        ...commonTextProperties()
    },

    buttonText: {
        fontSize: 16,
        ...commonTextProperties(),
        ...medium(),
    },

    titleText: {
        fontSize: 22,
        color: appColors.textColor,
        ...commonTextProperties()
    },

    boldTitleText: {
        fontSize: 22,
        color: appColors.textColor,
        ...commonTextProperties(),
        ...bold(),

    },

    mainColorTitle: {
        fontSize: 20,
        color: appColors.mainColor,
        ...commonTextProperties()
    },

    yellowTitleText: {
        fontSize: 22,
        color: appColors.yellowColor,
        ...commonTextProperties()
    },

    yellowText: {
        fontSize: 20,
        color: appColors.yellowColor,
        ...commonTextProperties()
    },

    contentText: {
        fontSize: 18,
        color: appColors.textColor,
        ...commonTextProperties()
    },

    smallContentText: {
        fontSize: 16,
        color: appColors.textColor,
        ...commonTextProperties()
    },

    link: {
        textTransform: 'uppercase',
        color: appColors.linkColor,
        ...commonTextProperties()
    },

    purpleTitleText: {
        fontSize: 22,
        color: appColors.linkColor,
        ...commonTextProperties()
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
        ...commonTextProperties()
    },


    tabBar: {
        backgroundColor: appColors.mainColor,
        flexDirection: 'row',
        padding: 10,
        paddingTop: 0,
    },

    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#707070',
    },
    tabItemText: {
        fontSize: 16,
        ...medium(),
        textTransform: 'uppercase',
        color: '#FFFFFFB3',
    },
    tabItemSelected: {
        borderBottomWidth: 2,
        borderBottomColor: '#FFFFFF',
    },
    tabItemTextSelected: {
        color: '#FFFFFF',
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
        ...commonTextProperties()
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
                            <Text numberOfLines={1} style={[commonStyles.tabItemText, selectedIndex === i ? commonStyles.tabItemTextSelected : {}]}>{route.title}</Text>
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

