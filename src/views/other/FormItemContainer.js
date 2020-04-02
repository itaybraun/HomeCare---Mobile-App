import React, {Component} from 'react';
import {View, StyleSheet, Text, KeyboardAvoidingView, Animated} from 'react-native';
import {appColors} from '../../support/CommonStyles';
import PropTypes from 'prop-types';
import {strings} from '../../localization/strings';


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

        let color = appColors.textColor;
        this.shakeAnimation = new Animated.Value(0);

        if (this.props.error) {
            color = '#FF0000';
        }
        if (this.props.disabled)
            color = appColors.textColor;

        return (
            <View {...this.props} style={{marginBottom: 20,}}>
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
                {
                    this.props.bottomInfo &&
                    <Text style={{fontSize: 12, marginLeft: 12, marginTop: 3, color: appColors.linkColor}}>{this.props.bottomInfo}</Text>
                }
            </View>
        );
    }
}

FormItemContainer.propTypes = {
    title: PropTypes.string,
    disabled: PropTypes.bool,
    error: PropTypes.bool,
    bottomInfo: PropTypes.string,
    borderless: PropTypes.bool,
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 4,
        borderWidth: 2,
        overflow: 'visible',
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
