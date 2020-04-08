import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {strings} from '../../localization/strings';
import MenuButton from '../menu/MenuButton';
import { Container, Header, Content, Button, ListItem, Text, Icon, Left, Body, Right, Switch } from 'native-base';
import {appColors, commonStyles} from '../../support/CommonStyles';
import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorageConsts} from './../../support/Consts';
import CookieManager from '@react-native-community/cookies';

export default class CurrentUserScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        return {
            title: strings.Settings.currentUser,
            headerBackTitle: ' ',
        }
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();
    }

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    logout = async (deleteCookies = true) => {
        if (deleteCookies)
            await CookieManager.clearAll(true)
        this.navigateTo('Login');
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {
        return (
            <View style={{flex: 1}}>
                <Container>
                    <Content bounces={false}>
                        <ListItem>
                            <Body>
                                <Text style={commonStyles.contentText}>{strings.Settings.authentication}</Text>
                            </Body>
                            <Right style={{minWidth: 60, justifyContent: 'flex-end'}}>
                                {
                                    this.api.token ?
                                        <Text style={commonStyles.infoText}>{strings.Settings.azureAD}</Text> :
                                        <Text style={commonStyles.infoText}>{strings.Settings.noAuth}</Text>
                                }

                            </Right>
                        </ListItem>
                        {
                            this.api.upn &&
                            <ListItem>
                                <Body>
                                    <Text style={commonStyles.smallInfoText}>{strings.Settings.upn}</Text>
                                    <Text style={[{flex: 1}, commonStyles.contentText]}>
                                        {this.api.upn}
                                    </Text>
                                </Body>
                            </ListItem>
                        }
                        {
                            this.api.user &&
                            <ListItem>
                            <Body>
                            <Text style={commonStyles.smallInfoText}>{strings.Settings.practitionerId}</Text>
                                    <Text style={[{flex: 1}, commonStyles.contentText]}>
                                        {this.api.user.id}
                                    </Text>
                                </Body>
                            </ListItem>
                        }
                        {
                            this.api.token ?
                                <ListItem>
                                    <Body>
                                        <Text style={commonStyles.contentText}>{strings.Settings.accessToken}</Text>
                                    </Body>
                                    <Right style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Button small bordered onPress={() => this.logout(true)} style={{borderColor: appColors.mainColor}}>
                                            <Text style={[commonStyles.medium, {color: appColors.mainColor}]}>{strings.Settings.deleteToken?.toUpperCase()}</Text>
                                        </Button>
                                    </Right>
                                </ListItem> :
                                <ListItem>
                                    <Body></Body>
                                    <Right style={{flexDirection: 'row', alignItems: 'center', minWidth: 60, justifyContent: 'flex-end',}}>

                                        <Button small bordered onPress={() => this.logout(false)} style={{borderColor: appColors.mainColor}}>
                                            <Text style={[commonStyles.medium, {color: appColors.mainColor}]}>{strings.Settings.logout?.toUpperCase()}</Text>
                                        </Button>
                                    </Right>
                                </ListItem>
                        }

                    </Content>
                    <View style={{alignItems: 'flex-end', marginTop: 10,}}>
                        <Image source={require('../../assets/icons/settings/settings.png')}/>
                    </View>
                </Container>
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
