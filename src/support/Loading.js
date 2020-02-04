import React, {Component} from 'react';
import {View, Image, StyleSheet} from 'react-native';

export default class Loading extends Component {
    render() {
        return(
            this.props.loading &&
            <View style={styles.container}>
                <Image source={require('../assets/images/loading.gif')}
                       style={{width: 105, height: 60 }} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: -100,
        bottom: -100,
        right: -100,
        left: -100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#CCCCCC90'
    }
});
