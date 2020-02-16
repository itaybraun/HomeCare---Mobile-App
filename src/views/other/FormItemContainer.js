import React, {Component} from 'react';
import {View, StyleSheet, Text, KeyboardAvoidingView} from 'react-native';
import {appColors} from '../../support/CommonStyles';


export default class FormItemContainer extends Component {

    render() {
        return (
            <KeyboardAvoidingView style={[styles.container, {...this.props.style}]}>
                {this.props.children}
                {
                    this.props.title &&
                        <View style={styles.titleContainer}>
                            <View style={styles.borderEraser} />
                            <Text style={styles.titleText}>{this.props.title}</Text>

                        </View>
                }
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 4,
        borderWidth: 2,
        borderColor: appColors.linkColor,
        overflow: 'visible',
        marginBottom: 20,
    },

    titleContainer: {
        position: 'absolute',
        paddingHorizontal: 5,
        top: -10,
        left: 6,
        height: 17,
        justifyContent: 'center',
        alignItems: 'center',
    },

    titleText: {
        color: appColors.linkColor,
    },
    borderEraser: {
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        height: 3,
        left: 0,
        right: 0,
    }

});
