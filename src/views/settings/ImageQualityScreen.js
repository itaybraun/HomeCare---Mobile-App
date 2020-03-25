import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {commonStyles} from '../../support/CommonStyles';
import {strings} from '../../localization/strings';
import {Container, Header, Content, List, ListItem, Text, Icon, Left, Body, Right, Switch, Button} from 'native-base';

export default class PickerScreen extends AppScreen {

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
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {
        return (
            <View style={commonStyles.screenContainer}>
                <Container>
                    <Content>
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
                    </Content>
                </Container>
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
