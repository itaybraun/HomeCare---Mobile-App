import React, {Component} from 'react';
import {View, StyleSheet, Text, KeyboardAvoidingView, Animated} from 'react-native';
import {appColors, commonStyles} from '../../support/CommonStyles';
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
            <View {...this.props}>
                <Animated.View style={[
                    styles.container,
                    {...this.props.style},
                    {borderColor: color},
                    {transform: [{translateX: this.shakeAnimation}]}
                ]}>
                    {
                        this.props.title &&
                        <View style={styles.titleContainer}>
                            <Text style={[commonStyles.smallInfoText]}>{this.props.title}</Text>
                        </View>
                    }
                    {this.props.children}
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
        paddingVertical: 10,
        paddingHorizontal: 15,
        overflow: 'visible',
        borderBottomColor: '#70707026',
        borderBottomWidth: 1,
    },

    titleContainer: {
        marginBottom: 5,
    },

    titleText: {
        ...commonStyles.infoText,
    },
    borderEraser: {
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        height: 3,
        left: 0,
        right: 0,
    }
});
