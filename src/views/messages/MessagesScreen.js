import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {strings} from '../../localization/strings';
import MenuButton from '../menu/MenuButton';

export default class MessagesScreen extends AppScreen {

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Chat.title,
            headerLeft: () =>
                <MenuButton />
            ,
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <Text>Messages</Text>
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
