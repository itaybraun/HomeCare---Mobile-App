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

export default class SettingsScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        return {
            title: strings.Settings.title,
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
                this.updateSettings('imageQuality', value)
                this.forceUpdate();
            },
        });
    };

    showUser = async () => {
        this.navigateTo('CurrentUser', {});
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
                                <Text style={commonStyles.contentText}>{strings.Settings.qa}</Text>
                            </Body>
                            <Right>
                                <Switch value={this.settings.qaMode} onValueChange={(value) => {
                                    this.updateSettings('qaMode', value);
                                }}/>
                            </Right>
                        </ListItem>
                        <ListItem onPress={this.changeImageQuality}>
                            <Body>
                                <Text style={commonStyles.contentText}>{strings.Settings.imageQuality}</Text>
                            </Body>
                            <Right style={{minWidth: 60, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={commonStyles.infoText}>{strings.Settings[this.settings.imageQuality]}</Text>
                                    <Icon style={{marginLeft: 10}} name="arrow-forward"/>
                            </Right>
                        </ListItem>
                        <ListItem onPress={this.showUser}>
                            <Body>
                                <Text style={commonStyles.smallInfoText}>{strings.Settings.currentUser}</Text>
                                <Text style={[{flex: 1}, commonStyles.smallContentText]}>
                                    {this.api.user?.id}
                                </Text>
                            </Body>
                            <Right style={{flex: 0}}>
                                <Icon style={{marginLeft: 10}} name="arrow-forward"/>
                            </Right>
                        </ListItem>

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
