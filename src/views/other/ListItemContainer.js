import React, {Component} from 'react';
import {View, StyleSheet, Text, KeyboardAvoidingView, Animated} from 'react-native';
import {appColors} from '../../support/CommonStyles';
import PropTypes from 'prop-types';
import {ListItem, NativeBase} from 'native-base';
import {strings} from '../../localization/strings';


export default class ListItemContainer extends React.Component<NativeBase.ListItem, any> {

    constructor(props) {
        super(props)
    }

    startShake = () => {
        Animated.sequence([
            Animated.timing(this.shakeAnimation, {toValue: 10, duration: 50, useNativeDriver: true}),
            Animated.timing(this.shakeAnimation, {toValue: -8, duration: 50, useNativeDriver: true}),
            Animated.timing(this.shakeAnimation, {toValue: 6, duration: 50, useNativeDriver: true}),
            Animated.timing(this.shakeAnimation, {toValue: -4, duration: 50, useNativeDriver: true}),
            Animated.timing(this.shakeAnimation, {toValue: 2, duration: 50, useNativeDriver: true}),
            Animated.timing(this.shakeAnimation, {toValue: 0, duration: 50, useNativeDriver: true})
        ]).start();
    };

    componentDidUpdate(prevProps) {
        if (this.props.error !== prevProps.error && this.props.error) {
            this.startShake();
        }
    }

    render() {

        let color = appColors.textColor;
        this.shakeAnimation = new Animated.Value(0);

        if (this.props.error) {
            color = '#FF0000';
        }
        if (this.props.disabled)
            color = appColors.textColor;

        return (
            <Animated.View style={[
                {...this.props.style},
                {transform: [{translateX: this.shakeAnimation}]}
            ]}>
                <ListItem {...this.props} style={{marginBottom: 20,}}>

                        {this.props.children}

                </ListItem>
            </Animated.View>
        );
    }
}

ListItemContainer.propTypes = {
    error: PropTypes.bool,
};

const styles = StyleSheet.create({

});
