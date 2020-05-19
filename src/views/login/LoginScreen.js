import React from 'react';
import {
    View, Image, StyleSheet, TextInput, Platform,
    Keyboard, TouchableOpacity, TouchableWithoutFeedback, StatusBar,
} from 'react-native';
import {Button, Text, Form, Icon} from 'native-base';
import AppScreen from '../../support/AppScreen';
import Loading from '../../support/Loading';
import {appColors, commonStyles, renderLoading} from '../../support/CommonStyles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import {strings} from '../../localization/strings';
import DeviceInfo from 'react-native-device-info';
import RESTAPI, {APIRequest} from '../../api/REST/RESTAPI';
import {jwtDecode} from 'fhirclient/lib/lib';
import {Utils} from '../../support/Utils';
import { SafeAreaView } from 'react-navigation';
import FHIR from 'fhirclient/lib/entry/browser';
import AzureLoginView from '../../api/Azure/AzureLoginView';
import AzureInstance from '../../api/Azure/AzureInstance';
import {Content} from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorageConsts} from '../../support/Consts';

export const environments = {
    evgeny: {
        title: 'Evgeny',
        server: 'https://fhir1.azurewebsites.net',
        user: 'user4@itaybraunhotmail.onmicrosoft.com',
        debug: true,
        visibleByDefault: false,
    },
    develop: {
        title: 'Development Server',
        server: 'https://fhir1.azurewebsites.net',
        user: 'user1@itaybraunhotmail.onmicrosoft.com',
        visibleByDefault: false,
    },
    secured: {
        title: 'Development Secured',
        server: 'https://cs2.azurewebsites.net',
        visibleByDefault: false,
        securedOptions: {
            client_id: '6b1d9c3b-df12-4a15-9a66-0e299f9a9bd2',
            client_secret: '[v3NLm?k?1YqxJ7Gcvz6_F:]:?12s/z4',
            redirect_uri: 'https://www.getpostman.com/oauth2/callback',
            scope: 'https://cs2.azurewebsites.net/user_impersonation'
        }
    },
    sal: {
        title: 'Sal - Secured',
        server: 'https://cs005.azurewebsites.net',
        visibleByDefault: true,
        securedOptions: {
            tenant: '2a6d8fcb-df56-47e6-a117-e5f8dab16dbe',
            client_id: '066da47a-2ad5-489d-83ac-31836963b39a',
            client_secret: 'apFH8[Qu2zqF=p4=sXyJNbkfB8-p346B',
            redirect_uri: 'https://www.getpostman.com/oauth2/callback',
            scope: 'https://cs005.azurewebsites.net/user_impersonation'
        }
    },
};

export default class LoginScreen extends AppScreen {

    static navigationOptions = {
        headerShown: false,
    };

    state = {
        ready: false,
        loading: false,
        appVersion: null,
        selectedEnvironmentKey: null,
        azureADInstance: null,
    };

    lastTapTime = 0;
    taps = 0;

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();

        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android')
            StatusBar.setBackgroundColor('#FFFFFF');

    }

    getData = async () => {
        const savedEnvironmentKey = await AsyncStorage.getItem(AsyncStorageConsts.SAVED_ENVIRONMENT);
        if (savedEnvironmentKey) {
            this.onEnvironmentPress(savedEnvironmentKey);
        }

        const version = await this.getAppVersion();
        this.setState({...version, ready: true});
    };

    getAppVersion = () => {
        return {
            appVersion: DeviceInfo.getVersion() + "." + DeviceInfo.getBuildNumber()
        }
    };

    onEnvironmentPress = async (environmentKey) => {
        const environment = environments[environmentKey];
        await this.setState({
            selectedEnvironmentKey: environmentKey,
        });
        log.info('Trying to log in to ' + environment.title);
        if (environment.securedOptions) {
            this.setState({
                azureADInstance: new AzureInstance(environment.securedOptions)
            })
        } else {
            this.onLoginSuccess();
        }
    };

    onLoginSuccess = async () => {
        log.info('Logged in successfully');
        const environment = environments[this.state.selectedEnvironmentKey];
        if (environment) {
            await AsyncStorage.setItem(AsyncStorageConsts.SAVED_ENVIRONMENT, this.state.selectedEnvironmentKey);
            const api = new RESTAPI(environment.server, this.state.azureADInstance);
            this.props.screenProps.api = api;
            this.setState({loading: true});
            let result: APIRequest = await this.api.setCurrentUser(environment.user);
            this.setState({loading: false});
            if (result.success)
                this.navigateTo('Tabs');
            else
                this.showError(result.data);
        } else {
            this.setState({
                selectedEnvironmentKey: null,
                azureADInstance: null,
            })
        }
    };

    onCancelLogin = () => {
        this.setState({
            azureADInstance: null,
        });
    };

    countTaps = () => {
        let time = new Date().getTime();
        if (time - this.lastTapTime > 500) {
            this.taps = 0;
        }

        this.taps++;
        if (this.taps >= 10) {
            this.taps = 0;
            this.navigateTo('Logs');
        }

        this.lastTapTime = time;
    };

    render() {

        if (this.state.loading) {
            return renderLoading(this.state.loading);
        }

        return (
            <SafeAreaView style={styles.container}
                          onStartShouldSetResponder={this.countTaps}>
                <View style={{flex: 1}}>
                    {
                        this.state.ready && !this.state.azureADInstance &&
                        <Content contentContainerStyle={{flexGrow: 1}} bounces={false}>

                            <Form style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                <View style={{alignItems: 'center'}}>
                                    <Text
                                        style={[commonStyles.h1, {color: appColors.mainColor}]}>{strings.Login.appName}</Text>
                                    <View style={styles.imageContainer}>
                                        <Image style={styles.image}
                                               source={require('../../assets/images/login.png')}/>
                                    </View>
                                    <Text
                                        style={[commonStyles.h2, {color: appColors.mainColor}]}>{strings.Login.homecarePlatform}</Text>
                                </View>
                                {
                                    Object.keys(environments).map(key => {
                                        const environment = environments[key];

                                        if (environment.debug && !__DEV__) {
                                            return null;
                                        }

                                        return (
                                            <Button
                                                key={key}
                                                style={{
                                                backgroundColor: appColors.mainColor,
                                                width: 230,
                                                marginTop: 20,
                                                justifyContent: 'center'
                                            }} onPress={() => this.onEnvironmentPress(key)}>
                                                <Text
                                                    style={commonStyles.buttonText}>{environment.title?.toUpperCase()}</Text>
                                            </Button>
                                        )
                                    })
                                }
                            </Form>

                            <View style={{
                                flexDirection: 'row',
                                marginHorizontal: 10,
                                alignItems: 'flex-end',
                            }}>
                                <Image style={styles.bottomLogo} source={require('../../assets/images/logo.png')}/>
                                <View style={{flex: 1,}}/>
                                <Text style={commonStyles.smallInfoText}>{this.state.appVersion}</Text>
                            </View>

                        </Content>
                    }

                    {
                        this.state.azureADInstance &&
                        <View style={{position: 'absolute', flex: 1, top: 0, bottom: 0, left: 0, right: 0}}>
                            <AzureLoginView
                                azureInstance={this.state.azureADInstance}
                                loadingMessage=" "
                                loadingView={renderLoading(true)}
                                onSuccess={this.onLoginSuccess}
                                onCancel={this.onCancelLogin}
                            />
                            <TouchableOpacity style={{position: 'absolute', padding: 12, right: 5, top: 5,}}
                                              onPress={this.onCancelLogin}>
                                <Icon type="AntDesign" name="close" style={{fontSize: 22, color: appColors.textColor}}/>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {

    },
    formContainer: {
        flex: 1,
        padding: 30,
    },
    formItem: {
        marginTop: 20,
    },

    bottomLogo: {
        width: 80,
        height: 60,
    }
});
