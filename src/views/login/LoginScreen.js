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
import {API, APIRequest} from '../../api/API';
import DeviceInfo from 'react-native-device-info';
import RESTAPI from '../../api/REST/RESTAPI';
import {jwtDecode} from 'fhirclient/lib/lib';
import {Utils} from '../../support/Utils';
import { SafeAreaView } from 'react-navigation';
import FHIR from 'fhirclient/lib/entry/browser';
import AzureLoginView from '../../api/Azure/AzureLoginView';
import AzureInstance from '../../api/Azure/AzureInstance';

const options = {
    client_id: '6b1d9c3b-df12-4a15-9a66-0e299f9a9bd2',
    client_secret: '[v3NLm?k?1YqxJ7Gcvz6_F:]:?12s/z4',
    redirect_uri: 'https://www.getpostman.com/oauth2/callback',
    scope: 'https://cs2.azurewebsites.net/user_impersonation'
};

export default class LoginScreen extends AppScreen {

    state = {
        loading: false,
        username: 'user1@itaybraunhotmail.onmicrosoft.com',
        password: 'Kuju0746987',
        appVersion: null,
        production: null,
    };

    azureADInstance;

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();

        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android')
            StatusBar.setBackgroundColor('#FFFFFF');

        //this.login();
    }

    getData = async (refresh = true) => {
        const version = await this.getAppVersion(refresh);
        this.setState({...version, loading: false});
    };

    getAppVersion = () => {
        return {
            appVersion: DeviceInfo.getVersion() + "." + DeviceInfo.getBuildNumber()
        }
    };

    onDevelopPress = async () => {
        let api = new RESTAPI('https://fhir1.azurewebsites.net');
        this.props.screenProps.api = api;

        this.setState({loading: true});
        let result: APIRequest = await this.api.setCurrentUser('user1@itaybraunhotmail.onmicrosoft.com');
        this.setState({loading: false});

        if (result.success)
            this.navigateTo('Tabs');
        else
            this.showError(result.data);
    };

    onEvgenyPress = async () => {
        let api = new RESTAPI('https://fhir1.azurewebsites.net');
        this.props.screenProps.api = api;

        this.setState({loading: true});
        let result: APIRequest = await this.api.setCurrentUser('user4@itaybraunhotmail.onmicrosoft.com');
        this.setState({loading: false});

        if (result.success)
            this.navigateTo('Tabs');
        else
            this.showError(result.data);
    };

    onSalHealthPress = async () => {
        let api = new RESTAPI('https://cs004.azurewebsites.net');
        this.props.screenProps.api = api;

        this.setState({loading: true});
        let result: APIRequest = await this.api.setCurrentUser('user1');
        this.setState({loading: false});

        if (result.success)
            this.navigateTo('Tabs');
        else
            this.showError(result.data);
    };

    onProdPress = async () => {
        // this.setState({loading: true});
        // let api = new RESTAPI('https://cs2.azurewebsites.net');
        // this.props.screenProps.api = api;
        // await this.api.login();
        // this.setState({loading: false});

        this.azureADInstance = new AzureInstance(options);
        this.setState({
            production: true
        });
    };

    _onLoginSuccess = async (event) => {
        this.setState({loading: true, production: false});

        let api = new RESTAPI('https://cs2.azurewebsites.net', this.azureADInstance);
        this.props.screenProps.api = api;

        let result: APIRequest = await this.api.setCurrentUser();
        this.setState({loading: false});

        if (result.success)
            this.navigateTo('Tabs');
        else
            this.showError(result.data);
    };

    _onLoginCancel = (event) => {
        console.log(event);
        this.setState({
            production: false
        });
    };


    render() {

        return (
            <SafeAreaView style={styles.container}>

                {
                    this.state.production === true &&
                        <View style={{flex: 1}}>
                            <AzureLoginView
                                azureInstance={this.azureADInstance}
                                loadingMessage=" "
                                loadingView={renderLoading(true)}
                                onSuccess={this._onLoginSuccess}
                                onCancel={this._onLoginCancel}
                            />
                            <TouchableOpacity style={{position: 'absolute', padding: 12, right: 5, top: 5,}}
                                              onPress={() => this.setState({production: null})}>
                                <Icon type="AntDesign" name="close" style={{fontSize: 22, color: appColors.textColor}}/>
                            </TouchableOpacity>
                        </View>
                }
                {
                    this.state.production === null &&
                        <View style={{flex: 1}}>
                            <Form style={{flex: 1, alignItems: 'center', justifyContent: 'space-evenly'}}>
                                <View style={{alignItems: 'center'}}>
                                    <Text style={[commonStyles.h1, {color: appColors.mainColor}]}>{strings.Login.appName}</Text>
                                    <View style={styles.imageContainer}>
                                        <Image style={styles.image} source={require('../../assets/images/login.png')}/>
                                    </View>
                                    <Text style={[commonStyles.h2, {color: appColors.mainColor}]}>{strings.Login.homecarePlatform}</Text>
                                </View>
                                {
                                    __DEV__ &&
                                    <Button style={{backgroundColor: appColors.mainColor, width: 230, justifyContent: 'center'}} onPress={this.onEvgenyPress}>
                                        <Text style={commonStyles.buttonText}>EVGENY</Text>
                                    </Button>
                                }
                                <Button style={{backgroundColor: appColors.mainColor, width: 230, justifyContent: 'center'}} onPress={this.onDevelopPress}>
                                    <Text style={commonStyles.buttonText}>{strings.Login.develop.toUpperCase()}</Text>
                                </Button>
                                <Button style={{backgroundColor: appColors.mainColor, width: 230, justifyContent: 'center'}} onPress={this.onProdPress}>
                                    <Text style={commonStyles.buttonText}>{strings.Login.production.toUpperCase()}</Text>
                                </Button>
                                <Button style={{backgroundColor: appColors.mainColor, width: 230, justifyContent: 'center'}} onPress={this.onSalHealthPress}>
                                    <Text style={commonStyles.buttonText}>{'SAL HEALTH'}</Text>
                                </Button>
                            </Form>

                            <View style={{flexDirection: 'row', marginHorizontal: 10, alignItems: 'flex-end', justifyContent:'space-between' }}>
                                <Image style={styles.bottomLogo} source={require('../../assets/images/logo.png')} />
                                <Text style={commonStyles.smallInfoText}>{this.state.appVersion}</Text>
                            </View>

                        </View>
                }
                {renderLoading(this.state.loading)}
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
