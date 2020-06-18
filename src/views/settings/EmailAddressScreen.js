import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput, Image} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {appColors, commonStyles} from '../../support/CommonStyles';
import {strings} from '../../localization/strings';
import {Container, Header, Content, List, ListItem, Text, Icon, Left, Body, Right, Switch, Button} from 'native-base';
import FormItemContainer from '../other/FormItemContainer';
import {string} from 'prop-types';

export default class EmailAddressScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Settings.emailAddress,
            headerBackTitle: ' ',
            headerRight: () => {
                return (
                    <TouchableOpacity style={{paddingHorizontal: 12}} onPress={navigation.getParam('done')}>
                        <Text style={[commonStyles.secondColorTitle, commonStyles.medium]}>{strings.Common.doneButton}</Text>
                    </TouchableOpacity>
                )
            }
        }
    };

    state = {
        loading: false,
        email: this.props.navigation.getParam('email', null),
        error: false,
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.props.navigation.setParams({
            done: this.submit,
        });
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    validate = (text) => {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return reg.test(this.state.email) !== false;
    }

    submit = () => {

        if (this.validate()) {

            const update = this.props.navigation.getParam('update', null);
            update && update(this.state.email);
            this.pop();
        } else {
            this.setState({error: true});
        }
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {
        return (
            <View style={commonStyles.screenContainer}>
                <Container>
                    <Content contentContainerStyle={{flexGrow: 1}}>
                        <FormItemContainer style={{margin: 20}} title={strings.Settings.emailAddress} error={this.state.error}>
                            <TextInput
                                style={[{fontSize: 18, minHeight: 50, paddingHorizontal: 10,}, this.state.error && {color: appColors.errorColor}]}
                                value={this.state.email}
                                autoCapitalize='none'
                                autoCorrect={false}
                                keyboardType='email-address'
                                returnKeyType='done'
                                onSubmitEditing={this.submit}
                                onChangeText={text => this.setState({email: text, error: false})}
                                placeholder={'user@domain.com'}
                            />
                        </FormItemContainer>
                        <View style={{flex: 1, justifyContent: 'flex-end'}}>
                            <View style={{alignSelf: 'flex-end', marginTop: 10,}}>
                                <Image source={require('../../assets/icons/settings/settings.png')}/>
                            </View>
                        </View>
                    </Content>
                </Container>
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
