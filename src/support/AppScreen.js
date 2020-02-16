import React from 'react';
import {Alert} from 'react-native';
import API from '../api/API';

export default class AppScreen extends React.Component {
    get api():API {
        return this.props.screenProps.api;
    }

    componentDidMount(): void {
        this.willFocusListener = this.props.navigation.addListener("willFocus", () => {
            this.willFocus();
        });
        this.didFocusListener = this.props.navigation.addListener("didFocus", () => {
            this.didFocus();
        });
    }

    componentWillUnmount() {
        this.willFocusListener.remove();
        this.didFocusListener.remove();
    }

    willFocus() {

    }

    didFocus() {

    }

    showError = (error) => {
        this.showAlert(error.message);
    };

    showAlert = (message, title = null, buttons = null) => {
        Alert.alert(title, message, buttons);
    };

    navigateTo = (view, params) => {
        this.props.navigation.navigate(view, params);
    };

    pop = () => {
        this.props.navigation.pop();
    }
}
