import React from 'react';
import {Alert} from 'react-native';
import {Settings} from '../models/Settings';
import EventEmitter from 'eventemitter3';
import {strings} from '../localization/strings';
import RESTAPI from '../api/REST/RESTAPI';

export default class AppScreen extends React.Component {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    get api(): RESTAPI {
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
        log.error(error);
        if (error.message === 'relog') {
            this.showAlert(strings.System.sessionExpired, null, [
                {
                    text: strings.Common.okButton,
                    style: 'cancel',
                    onPress: () => {
                        this.navigateTo('Login');
                    }
                },
            ]);
            return;
        }
        this.showAlert(error.message);
    };

    showAlert = (message, title = null, buttons = null) => {
        log.info('Showing message: ' + message);
        Alert.alert(title, message, buttons);
    };

    navigateTo = (view, params) => {
        log.info('Navigate to ' + view);
        this.props.navigation.navigate(view, params);
    };

    pop = () => {
        log.info('Navigation pop');
        this.props.navigation.pop();
    };
}
