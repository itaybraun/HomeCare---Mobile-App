import React from 'react';
import {
    View, Image, StyleSheet, TextInput, Platform,
    Keyboard, TouchableOpacity, TouchableWithoutFeedback, StatusBar,
} from 'react-native';
import {Button, Text, Form} from 'native-base';
import AppScreen from '../../support/AppScreen';
import Loading from '../../support/Loading';
import {commonStyles} from '../../support/CommonStyles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import {strings} from '../../localization/strings';
import {API, APIRequest} from '../../api/API';
import DeviceInfo from 'react-native-device-info';
import {AzureInstance, AzureLoginView} from 'react-native-azure-ad-2';
import RESTAPI from '../../api/REST/RESTAPI';
import {jwtDecode} from 'fhirclient/lib/lib';
import {Utils} from '../../support/Utils';
import { SafeAreaView } from 'react-navigation';

export default class LoginScreen extends AppScreen {

    state = {
        loading: false,
        username: 'user1@itaybraunhotmail.onmicrosoft.com',
        password: 'Kuju0746987',
        appVersion: null,
        production: null,
    };

    instance = new AzureInstance({
        client_id: '6b1d9c3b-df12-4a15-9a66-0e299f9a9bd2',
        client_secret: '[v3NLm?k?1YqxJ7Gcvz6_F:]:?12s/z4',
        redirect_uri: 'https://www.getpostman.com/oauth2/callback',
        scope: 'https://cs2.azurewebsites.net/user_impersonation'
    });

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();

        StatusBar.setBarStyle('dark-content');

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
        api.token = null;
        this.props.screenProps.api = api;

        // await this.setCurrentUser('8cba6c16-4f07-42de-9b06-b5af4f05f23c');
        await this.api.setCurrentUser('user1@itaybraunhotmail.onmicrosoft.com');

        this.navigateTo('Tabs');
    };

    onProdPress = () => {
        this.setState({
            production: true
        });
    };

    _onLoginSuccess = async (event) => {
        let api = new RESTAPI('https://cs2.azurewebsites.net');

        const token = this.instance.getToken().accessToken;
        console.log(token);

        const decodedToken = Utils.parseJwt(token);

        api.token = token;
        this.props.screenProps.api = api;

        await this.api.setCurrentUser(decodedToken.unique_name);

        this.navigateTo('Tabs');
    };

    _onLoginCancel = (event) => {
        console.log(event);
    };


    render() {

        return (
            <SafeAreaView style={{flex: 1}}>

                {
                    this.state.production === true &&
                        <AzureLoginView
                            azureInstance={this.instance}
                            loadingMessage=" "
                            onSuccess={this._onLoginSuccess}
                            onCancel={this._onLoginCancel}
                        />
                }

                {
                    this.state.production === null &&
                        <Form style={{flex: 1, alignItems: 'center', justifyContent: 'space-evenly'}}>
                            <View style={styles.imageContainer}>
                                <Image style={styles.image} source={require('../../assets/images/logo.png')}/>
                            </View>
                            <Button warning style={{width: 230, justifyContent: 'center'}} onPress={this.onDevelopPress}>
                                <Text style={{fontWeight: 'bold'}}>{strings.Login.develop.toUpperCase()}</Text>
                            </Button>
                            <Button warning style={{width: 230, justifyContent: 'center'}} onPress={this.onProdPress}>
                                <Text style={{fontWeight: 'bold'}}>{strings.Login.production.toUpperCase()}</Text>
                            </Button>
                        </Form>
                }


                { false &&
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <KeyboardAwareScrollView style={styles.container}
                                                 getTextInputRefs={() => {
                                                     return [this.usernameInput, this.passwordInput]
                                                 }}
                                                 contentContainerStyle={{flex: 1}}>
                            <View style={styles.imageContainer}>
                                <Image style={styles.image} source={require('../../assets/images/logo.png')}/>
                            </View>
                            <View style={styles.formContainer}>
                                <View style={styles.formItem}>
                                    <TextInput ref={obj => this.usernameInput = obj}
                                               value={this.state.username}
                                               style={commonStyles.input}
                                               placeholder={strings.Login.username}
                                               autoCapitalize='none'
                                               autoCompleteType='username'
                                               returnKeyType="next"
                                               autoCorrect={false}
                                               enablesReturnKeyAutomatically={true}
                                               placeholderTextColor="#CCCCCC"
                                               paddingRight={12}
                                               paddingLeft={12}
                                               onChangeText={text => this.setState({username: text})}
                                               onSubmitEditing={() => this.passwordInput.focus()}
                                    />
                                </View>
                                <View style={styles.formItem}>
                                    <TextInput ref={obj => this.passwordInput = obj}
                                               value={this.state.password}
                                               style={commonStyles.input}
                                               secureTextEntry
                                               autoCompleteType='password'
                                               returnKeyType="go"
                                               autoCorrect={false}
                                               placeholder={strings.Login.password}
                                               enablesReturnKeyAutomatically={true}
                                               placeholderTextColor="#CCCCCC"
                                               paddingRight={12}
                                               paddingLeft={12}
                                               onChangeText={text => this.setState({password: text})}
                                               onSubmitEditing={() => this.login()}
                                    />
                                </View>
                                <View style={[styles.formItem, {marginTop: 40, alignItems: 'center',}]}>
                                    <Button warning style={{paddingHorizontal: 40,}} onPress={this.login}>
                                        <Text style={{fontWeight: 'bold'}}>{strings.Login.login.toUpperCase()}</Text>
                                    </Button>
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                    </TouchableWithoutFeedback>
                }
                <View style={styles.appVersion}>
                    <Text>{this.state.appVersion}</Text>
                </View>
                <Loading loading={this.state.loading} />

            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {

    },
    appVersion: {
        alignItems: 'flex-end',
        padding: 20,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    image: {
        width: 248,
        height: 200,
    },
    formContainer: {
        flex: 1,
        padding: 30,
    },
    formItem: {
        marginTop: 20,
    },
});
