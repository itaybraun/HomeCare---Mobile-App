import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {Patient} from '../../models/Patient';
import Loading from '../../support/Loading';
import {APIRequest} from '../../api/API';
import {strings} from '../../localization/strings';
import { Card, Icon, Text } from 'native-base';
import {commonStyles, renderSeparator} from '../../support/CommonStyles';

export default class EmptyScreen extends AppScreen {

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Empty Screen',
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
    };

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();
    }

    getData = async (refresh = true) => {
        this.setState({loading: true});
        this.setState({loading: false});
    };

    navigateTo = (view) => {
        this.props.navigation.navigate(view);
    };

    render() {
        return (
            <View style={styles.container}>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
});