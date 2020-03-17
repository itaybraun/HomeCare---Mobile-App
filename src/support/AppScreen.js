import React from 'react';
import {Alert} from 'react-native';
import API from '../api/API';
import {Settings} from '../models/Settings';
import EventEmitter from 'eventemitter3';

export default class AppScreen extends React.Component {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    get api(): API {
        return this.props.screenProps.api;
    }

    get settings(): Settings {
        return this.props.screenProps.settings;
    }

    get eventEmitter(): EventEmitter {
        return this.props.screenProps.eventEmitter;
    }

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        this.willFocusListener = this.props.navigation.addListener("willFocus", () => {
            this.willFocus();
        });
        this.didFocusListener = this.props.navigation.addListener("didFocus", () => {
            this.didFocus();
        });

        this.eventEmitter.on('settings', this.update);
    }

    componentWillUnmount = () => {
        this.willFocusListener.remove();
        this.didFocusListener.remove();
        this.eventEmitter.removeListener('settings');
    };

    willFocus = () => {

    };

    didFocus = () => {

    };

    update = () => {
        this.forceUpdate();
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    showError = (error) => {
        console.log(error);
        this.showAlert(error.message);
    };

    showAlert = (message, title = null, buttons = null) => {
        console.log(message);
        Alert.alert(title, message, buttons);
    };

    navigateTo = (view, params) => {
        this.props.navigation.navigate(view, params);
    };

    pop = () => {
        this.props.navigation.pop();
    };
}
