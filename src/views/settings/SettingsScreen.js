import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {strings} from '../../localization/strings';
import MenuButton from '../menu/MenuButton';
import { Container, Header, Content, Button, ListItem, Text, Icon, Left, Body, Right, Switch } from 'native-base';
import {commonStyles} from '../../support/CommonStyles';
import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorageConsts} from './../../support/Consts';
import CookieManager from '@react-native-community/cookies';
import ListItemContainer from '../other/ListItemContainer';
import DeviceInfo from 'react-native-device-info';

export default class SettingsScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        return {
            title: strings.Settings.title,
            headerBackTitle: ' ',
            // headerLeft: () =>
            //     <MenuButton />
            // ,
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

    updateSettings = async (property, value) => {
        if (this.settings.hasOwnProperty(property)) {
            this.settings[property] = value;
            this.eventEmitter.emit('settings');
            await AsyncStorage.setItem(AsyncStorageConsts.STORAGE_SETTINGS, JSON.stringify(this.settings));
        }
    }

    changeImageQuality = () => {
        this.navigateTo('ImageQuality', {
            value: this.settings.imageQuality,
            update: (value) => {
                this.updateSettings('imageQuality', value);
                this.forceUpdate();
            },
        });
    };

    changeEmail = () => {
        this.navigateTo('EmailAddress', {
            email: this.settings.email,
            update: (value) => {
                this.updateSettings('email', value);
                this.forceUpdate();
            }
        })
    };

    showUser = async () => {
        this.navigateTo('CurrentUser', {});
    };

    showLogs = () => {
        this.navigateTo('Logs');
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {
        return (
            <View style={{flex: 1}}>
                <Container>
                    <Content bounces={false} contentContainerStyle={{flexGrow: 1}}>
                        <ListItem>
                            <Body>
                                <View style={{minHeight: 45, justifyContent: 'center'}}>
                                    <Text style={commonStyles.contentText}>{strings.Settings.qa}</Text>
                                </View>
                            </Body>
                            <Right>
                                <Switch value={this.settings.qaMode} onValueChange={(value) => {
                                    this.updateSettings('qaMode', value);
                                }}/>
                            </Right>
                        </ListItem>

                        <ListItem onPress={this.changeImageQuality}>
                            <Body>
                                <View style={{minHeight: 45, justifyContent: 'center'}}>
                                    <Text style={commonStyles.contentText}>{strings.Settings.imageQuality}</Text>
                                </View>
                            </Body>
                            <Right style={{minWidth: 60, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={commonStyles.infoText}>{strings.Settings[this.settings.imageQuality]}</Text>
                                    <Icon style={{marginLeft: 10}} name="arrow-forward"/>
                            </Right>
                        </ListItem>

                        <ListItem onPress={this.changeEmail}>

                            {this.settings.email != null ?
                                <Body>
                                    <View style={{minHeight: 45, justifyContent: 'center'}}>
                                        <Text style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>
                                            {strings.Settings.emailAddress}
                                        </Text>
                                        <Text style={[commonStyles.formItemText]}>
                                            {this.settings.email}
                                        </Text>
                                    </View>
                                </Body> :

                                <Body>
                                    <View style={{minHeight: 45, justifyContent: 'center'}}>
                                        <Text style={commonStyles.infoText}>
                                            {strings.Settings.emailAddress}
                                        </Text>
                                    </View>
                                </Body>
                            }
                            <Right>
                                <Icon name="arrow-forward"/>
                            </Right>
                        </ListItem>

                        <ListItem>
                            <Body>
                                <View style={{minHeight: 45, justifyContent: 'center'}}>
                                    <Text style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>
                                        {strings.Settings.servername}
                                    </Text>
                                    <Text style={[commonStyles.formItemText]}>
                                        {this.api.serverUrl}
                                    </Text>
                                </View>
                            </Body>
                        </ListItem>

                        <ListItem onPress={this.showUser}>
                            <Body>
                                <View style={{minHeight: 45, justifyContent: 'center'}}>
                                    <Text style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>
                                        {strings.Settings.currentUser}
                                    </Text>
                                    <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                        {this.api.user?.id}
                                    </Text>
                                </View>
                            </Body>
                            <Right style={{flex: 0}}>
                                <Icon style={{marginLeft: 10}} name="arrow-forward"/>
                            </Right>
                        </ListItem>
                        <ListItem onPress={this.showLogs}>
                            <Body>
                                <View style={{minHeight: 45, justifyContent: 'center'}}>
                                    <Text style={commonStyles.contentText}>
                                        {strings.Logs.showLogs}
                                    </Text>
                                </View>
                            </Body>
                            <Right>
                                <Icon name="arrow-forward"/>
                            </Right>
                        </ListItem>
                        <ListItem>
                            <Body>
                                <View style={{minHeight: 45, justifyContent: 'center'}}>
                                    <Text style={commonStyles.contentText}>
                                        {strings.Settings.version}
                                    </Text>
                                </View>
                            </Body>
                            <Right style={{minWidth: 60, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={commonStyles.infoText}>
                                    {DeviceInfo.getVersion()}.{DeviceInfo.getBuildNumber()}
                                </Text>
                            </Right>
                        </ListItem>
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
