import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {strings} from '../../localization/strings';
import MenuButton from '../menu/MenuButton';

export default class TasksScreen extends AppScreen {

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Tasks.title,
            headerLeft: () =>
                <MenuButton />
            ,
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <Text>Tasks</Text>
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
