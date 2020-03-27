import React from 'react';
import {View, StyleSheet} from 'react-native';
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

    logout = async () => {
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
                        <ListItem icon>
                            <Left>
                                <Button style={{backgroundColor: "#FF9501"}}>
                                    <Icon active name="bug"/>
                                </Button>
                            </Left>
                            <Body>
                                <Text>{strings.Settings.qa}</Text>
                            </Body>
                            <Right>
                                <Switch value={this.settings.qaMode} onValueChange={(value) => {
                                    this.updateSettings('qaMode', value);
                                }}/>
                            </Right>
                        </ListItem>
                        <ListItem icon onPress={this.changeImageQuality}>
                            <Left>
                                <Button style={{backgroundColor: "#3CD340"}}>
                                    <Icon active name="ios-image"/>
                                </Button>
                            </Left>
                            <Body>
                                <Text>{strings.Settings.imageQuality}</Text>
                            </Body>
                            <Right>
                                <Text>{strings.Settings[this.settings.imageQuality]}</Text>
                                <Icon name="arrow-forward"/>
                            </Right>
                        </ListItem>
                        <ListItem itemDivider>
                            <Body>
                                <Text></Text>
                            </Body>
                        </ListItem>
                        <ListItem icon onPress={this.logout}>
                            <Left>
                                <Button style={{backgroundColor: "#007AFF"}}>
                                    <Icon active name="md-exit"/>
                                </Button>
                            </Left>
                            <Body>
                                <Text>{strings.Settings.logout}</Text>
                            </Body>
                        </ListItem>
                    </Content>
                </Container>
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
