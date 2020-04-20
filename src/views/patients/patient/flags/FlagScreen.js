import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView, Image,
} from 'react-native';
import AppScreen from '../../../../support/AppScreen';
import {strings} from '../../../../localization/strings';
import {appColors, commonStyles, renderLoading} from '../../../../support/CommonStyles';
import FormItemContainer from '../../../other/FormItemContainer';
import {Body, Button, Container, Content, ActionSheet, Icon, Left, List, ListItem, Text, Textarea} from 'native-base';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import {Flag} from '../../../../models/Flag';
import {Request} from '../../../../support/Utils';
import {APIRequest} from '../../../../api/API';
import {Patient} from '../../../../models/Patient';
import {Task} from '../../../../models/Task';
import TaskRenderer from '../../../tasks/TaskRenderer';
import {uses24HourClock} from "react-native-localize";
import FlagRenderer from './FlagRenderer';

export default class FlagScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Flags.details,
            headerBackTitle: ' ',
            headerRight: () => {
                return (
                    <TouchableOpacity style={{padding: 12}} onPress={navigation.getParam('showMenu')}>
                        <Icon type="Entypo" name="dots-three-horizontal"
                              style={{fontSize: 22, color: appColors.headerFontColor}}/>
                    </TouchableOpacity>
                )
            }
        }
    };

    state = {
        loading: false,
        flag: this.props.navigation.getParam('flag', null),
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.props.navigation.setParams({
            showMenu: this.showMenu,
        });
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    showMenu = () => {
        let options = [
            strings.Flag.menuEdit,
            strings.Common.cancelButton,
        ];
        ActionSheet.show({
                options: options,
                cancelButtonIndex: options.length - 1,
            },
            (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        this.editFlag();
                        break;
                }
            });
    };

    editFlag = () => {
        this.navigateTo('EditFlag', {
            flag: this.state.flag,
            updateFlag: this.updateFlag,
        });
    };

    updateFlag = async (flag) => {
        await this.setState({
            flag: flag,
        });

        const refresh = this.props.navigation.getParam('refresh', null);
        refresh && refresh();
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {
        const flag: Flag = this.state.flag;

        return (

            <View style={commonStyles.screenContainer} onPress={Keyboard.dismiss}>
                {flag &&
                <Container>
                    <Content bounces={false}>
                        <View style={{flex: 1, margin: 10, marginTop: 20, alignItems: 'center', flexDirection: 'row'}}>
                            <Text style={[commonStyles.titleText, {marginHorizontal: 10, flex: 1}]}
                                  numberOfLines={3}>{flag.text}</Text>
                        </View>
                        <List>
                            <ListItem>
                                <Body style={{flexDirection: 'row'}}>
                                    <Image style={{width: 22, height: 22}} source={FlagRenderer.categoryImage[flag.category?.toLowerCase()]}/>
                                    <Text style={[commonStyles.formItemText]}>{flag.id}</Text>
                                </Body>
                            </ListItem>

                            <ListItem>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Flag.status}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{flag.status?.capitalize()}</Text>
                                </Body>
                            </ListItem>

                            <ListItem>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Flag.lastUpdate}</Text>
                                    <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                        {
                                            flag.lastUpdate ?
                                                moment(flag.lastUpdate).format(
                                                    uses24HourClock() ?
                                                        'ddd, MMM DD YYYY HH:mm' :
                                                        'ddd, MMM DD YYYY hh:mm A'
                                                ) : ''
                                        }
                                    </Text>
                                </Body>
                            </ListItem>

                            <ListItem>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Flag.patientName}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{flag.patient?.fullName}</Text>
                                </Body>
                            </ListItem>

                            <ListItem>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Flag.category}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{strings.Categories[flag.category?.toLowerCase()]}</Text>
                                </Body>
                            </ListItem>

                            <ListItem>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Flag.validFrom}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{moment(flag.startDate).format('MMM-DD-YYYY')}</Text>
                                </Body>
                            </ListItem>

                            <ListItem>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Flag.validTo}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{moment(flag.endDate).format('MMM-DD-YYYY')}</Text>
                                </Body>
                            </ListItem>
                        </List>
                        <View style={{alignItems: 'flex-end', marginTop: 10,}}>
                            <Image source={require('../../../../assets/icons/flags/alert.png')}/>
                        </View>
                    </Content>
                </Container>
                }
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
