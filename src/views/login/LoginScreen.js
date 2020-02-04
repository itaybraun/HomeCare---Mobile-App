import React from 'react';
import {SafeAreaView, View, Image, StyleSheet, TextInput, Platform,
    Keyboard, TouchableOpacity, TouchableWithoutFeedback} from 'react-native';
import {Button, Text} from 'native-base';
import AppScreen from '../../support/AppScreen';
import Loading from '../../support/Loading';
import {commonStyles} from '../../support/CommonStyles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import {strings} from '../../localization/strings';

export default class LoginScreen extends AppScreen {

    state = {
        loading: false,
        username: 'Eyal.Shalit',
        password: '123',
    }

    login = async () => {
        this.setState({loading: true});
        let result = await this.api.login(this.state.username, this.state.password);
        this.setState({loading: false});

        if (result === true)
            this.props.navigation.navigate('Tabs')
        else
            alert(result);
    };

    render() {
        return (
            <SafeAreaView style={{flex: 1}}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <KeyboardAwareScrollView style={styles.container}
                                             getTextInputRefs={() => { return [this.usernameInput, this.passwordInput]}}
                                             contentContainerStyle={{flex: 1}}>
                        <View style={styles.imageContainer}>
                            <Image style={styles.image} source={require('../../assets/images/logo.png')} />
                        </View>
                        <View style={styles.formContainer}>
                            <View style={styles.formItem}>
                                <TextInput ref={obj => this.usernameInput = obj}
                                           value={this.state.username}
                                           style={styles.input}
                                           placeholder={strings.Login.username}
                                           autoCapitalize='none'
                                           autoCompleteType='username'
                                           returnKeyType="next"
                                           autoCorrect={false}
                                           enablesReturnKeyAutomatically={true}
                                           paddingRight={12}
                                           paddingLeft={12}
                                           onChangeText={text => this.setState({username: text})}
                                           onSubmitEditing={_ => this.passwordInput.focus()}
                                />
                            </View>
                            <View style={styles.formItem}>
                                <TextInput ref={obj => this.passwordInput = obj}
                                           value={this.state.password}
                                           style={styles.input}
                                           secureTextEntry
                                           autoCompleteType='password'
                                           returnKeyType="go"
                                           autoCorrect={false}
                                           placeholder={strings.Login.password}
                                           enablesReturnKeyAutomatically={true}
                                           paddingRight={12}
                                           paddingLeft={12}
                                           onChangeText={text => this.setState({password: text})}
                                           onSubmitEditing={_ => this.login()}
                                />
                            </View>
                            <View style={[styles.formItem, {marginTop: 40, alignItems: 'center',}]}>
                                <Button warning style={{paddingHorizontal: 40,}} onPress={this.login}>
                                    <Text style={{fontWeight: 'bold'}}>{strings.Login.login}</Text>
                                </Button>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </TouchableWithoutFeedback>
                <Loading loading={this.state.loading} />
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {

    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
        flex: 1,
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
    input: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        height: 40,
        padding: 5,
    },
});
