import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import AppScreen from '../../support/AppScreen';

export default class ChatScreen extends AppScreen {

    render() {
        return (
            <View style={styles.container}>
                <Text>Chat</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
