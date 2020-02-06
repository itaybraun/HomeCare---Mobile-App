import React, {Component} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Icon} from 'native-base';
import {appColors} from '../../support/CommonStyles';


export default class MenuButton extends Component {
    render() {
        return (
            <TouchableOpacity style={styles.buttonContainer}>
                <Icon type="SimpleLineIcons" name="menu" style={{fontSize: 22, color: appColors.textColor}} />
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        padding: 12,
    }
});
