import React, {Component} from 'react';
import {View, StyleSheet, Text, KeyboardAvoidingView, Animated} from 'react-native';
import {appColors} from '../../support/CommonStyles';
import PropTypes from 'prop-types';


export default class FormItemContainer extends Component {

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

        let color = appColors.linkColor;
        this.shakeAnimation = new Animated.Value(0);

        if (this.props.error) {
            color = '#FF0000';
        }
        if (this.props.disabled)
            color = appColors.textColor;

        return (
            <KeyboardAvoidingView>
                <Animated.View style={[
                    styles.container,
                    {...this.props.style},
                    {borderColor: color},
                    {transform: [{translateX: this.shakeAnimation}]}
                ]}>
                    {this.props.children}
                    {
                        this.props.title &&
                        <View style={styles.titleContainer}>
                            <View style={styles.borderEraser}/>
                            <Text style={[styles.titleText, {color: color}]}>{this.props.title}</Text>

                        </View>
                    }
                </Animated.View>
            </KeyboardAvoidingView>
        );
    }
}

FormItemContainer.propTypes = {
    title: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    error: PropTypes.bool,
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 4,
        borderWidth: 2,
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

    },
    borderEraser: {
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        height: 3,
        left: 0,
        right: 0,
    }
});
