import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput, Image} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {commonStyles} from '../../support/CommonStyles';
import {strings} from '../../localization/strings';
import {Container, Header, Content, List, ListItem, Text, Icon, Left, Body, Right, Switch, Button} from 'native-base';

export default class ImageQualityScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Settings.imageQuality,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        selectedValue: null,
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        const selectedValue = this.props.navigation.getParam('value', null);
        this.setState({
            selectedValue: selectedValue,
        })
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    setSelectedValue = (value) => {
        this.setState({selectedValue: value});
        const update = this.props.navigation.getParam('update', null);
        update && update(value);
        this.pop();
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {
        return (
            <View style={commonStyles.screenContainer}>
                <Container>
                    <Content bounces={false} contentContainerStyle={{flexGrow: 1}}>
                        <List>
                            <ListItem icon onPress={() => this.setSelectedValue('original')}>
                                <Body>
                                    <Text>{strings.Settings.original}</Text>
                                </Body>
                                {
                                    this.state.selectedValue === 'original' &&
                                        <Right>
                                            <Icon active name="md-checkmark" />
                                        </Right>
                                }
                            </ListItem>

                            <ListItem icon onPress={() => this.setSelectedValue('medium')}>
                                <Body>
                                    <Text>{strings.Settings.medium}</Text>
                                </Body>
                                {
                                    this.state.selectedValue === 'medium' &&
                                    <Right>
                                        <Icon active name="md-checkmark" />
                                    </Right>
                                }
                            </ListItem>

                            <ListItem icon onPress={() => this.setSelectedValue('small')}>
                                <Body>
                                    <Text>{strings.Settings.small}</Text>
                                </Body>
                                {
                                    this.state.selectedValue === 'small' &&
                                    <Right>
                                        <Icon active name="md-checkmark" />
                                    </Right>
                                }
                            </ListItem>
                        </List>
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
