import React from 'react';
import {Alert} from 'react-native';
import API from '../api/API';

export default class AppScreen extends React.Component {
    get api():API {
        return this.props.screenProps.api;
    }

    componentDidMount(): void {

    }

    showError = (error) => {
        this.showAlert(error.message);
    };

    showAlert = (message, title = null, buttons = null) => {
        Alert.alert(title, message, buttons);
    };
}
