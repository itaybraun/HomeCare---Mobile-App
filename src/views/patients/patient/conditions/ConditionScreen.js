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
import {
    Body,
    Button,
    Container,
    Content,
    ActionSheet,
    Icon,
    Left,
    List,
    ListItem,
    Text,
    Textarea,
    Right,
} from 'native-base';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import {Condition} from '../../../../models/Condition';
import ListItemContainer from '../../../other/ListItemContainer';

export default class ConditionScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Conditions.details,
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
        condition: this.props.navigation.getParam('condition', null),
    };

    static clinicalStatusColor = {
        active:'#1BBC0F',
        recurrence:'#1BBC0F',
        relapse:'#1BBC0F',
        inactive:'#1BBC0F',
        remission:'#1BBC0F',
        resolved:'#1BBC0F',
    };

    static severityColor = {
        Severe: '#FF0000',
        Moderate: '#FF0000',
        Mild: '#FF0000',
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
            strings.Conditions.menuEdit,
            strings.Conditions.menuDelete,
            strings.Common.cancelButton,
        ];
        ActionSheet.show({
                options: options,
                destructiveButtonIndex: options.length - 2,
                cancelButtonIndex: options.length - 1,
            },
            (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        this.editCondition();
                        break;
                    case 1:
                        this.deleteCondition();
                        break;
                }
            });
    };

    editCondition = () => {
        this.navigateTo('EditCondition', {
            condition: this.state.condition,
            updateCondition: this.updateCondition,
        });
    };

    updateCondition = async (condition) => {
        await this.setState({
            condition: condition,
        });

        const refresh = this.props.navigation.getParam('refresh', null);
        refresh && refresh();
    };

    deleteCondition = () => {
        this.showAlert(strings.Conditions.deleteCondition, null, [
            {
                text: strings.Common.noButton,
                style: 'cancel',
                onPress: () => {

                }
            },
            {
                text: strings.Common.yesButton,
                style: 'destructive',
                onPress: async () => {
                    let condition: Condition = this.state.condition;
                    this.setState({loading: true});
                    const result = await this.api.deleteCondition(condition);
                    this.setState({loading: false});
                    if (!result.success) {
                        this.showError(result.data);
                    } else {
                        const refresh = this.props.navigation.getParam('refresh', null);
                        refresh && refresh();
                        this.pop();
                    }
                },
            }
        ]);
    };

    showNotes = () => {
        this.navigateTo('ConditionNotes', {
            condition: this.state.condition,
            updateCondition: this.updateCondition,
        });
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {
        const condition: Condition = this.state.condition;
        return (

            <View style={commonStyles.screenContainer} onPress={Keyboard.dismiss}>
                {condition &&
                <Container>
                    <Content bounces={false}>
                        <View style={{flex: 1, margin: 10, marginTop: 20, alignItems: 'center', flexDirection: 'row'}}>
                            <Text style={[commonStyles.titleText, {marginHorizontal: 10, flex: 1}]}
                                  numberOfLines={3}>{condition.text}</Text>
                        </View>
                        <List>
                            <ListItem>
                                <Body style={{flexDirection: 'row'}}>
                                    <Image source={require('../../../../assets/icons/patients/stethoscope.png')} style={{width: 22, height: 22}}/>
                                    <Text style={[commonStyles.formItemText]}>{condition.id}</Text>
                                </Body>
                            </ListItem>
                            <ListItem>
                                <Body>
                                    <View style={{minHeight: 45, justifyContent: 'center'}}>
                                        <Text style={commonStyles.contentText}>
                                            {strings.Conditions.clinicalStatus}
                                        </Text>
                                    </View>
                                </Body>
                                <Right style={{minWidth: 60, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center'}}>
                                    {condition.status &&
                                    <View style={[commonStyles.roundedContainer, {backgroundColor: ConditionScreen.clinicalStatusColor[condition.status] + '26'}]}>
                                        <Text style={[commonStyles.roundedContainerText, {color: ConditionScreen.clinicalStatusColor[condition.status] }]}>
                                            {condition.status.toUpperCase()}
                                        </Text>
                                    </View>
                                    }
                                </Right>
                            </ListItem>

                            <ListItemContainer>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Conditions.recordedDate}</Text>
                                    <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                        {
                                            condition.recordedDate ?
                                                moment(condition.recordedDate).format(
                                                    uses24HourClock() ?
                                                        'ddd, MMM DD YYYY HH:mm' :
                                                        'ddd, MMM DD YYYY hh:mm A'
                                                ) : ''
                                        }
                                    </Text>
                                </Body>
                            </ListItemContainer>

                            <ListItem>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Conditions.recorder}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{condition.recorder?.fullName}</Text>
                                </Body>
                            </ListItem>
                            <ListItem>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Conditions.patientName}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{condition.patient?.fullName}</Text>
                                </Body>
                            </ListItem>
                            <ListItem>
                                <Body>
                                    <View style={{minHeight: 45, justifyContent: 'center'}}>
                                        <Text style={commonStyles.contentText}>
                                            {strings.Conditions.severity}
                                        </Text>
                                    </View>
                                </Body>
                                <Right style={{minWidth: 60, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center'}}>
                                    {condition.severity &&
                                        <View style={[commonStyles.roundedContainer, {backgroundColor: ConditionScreen.severityColor[condition.severity] + '26'}]}>
                                            <Text style={[commonStyles.roundedContainerText, {color: ConditionScreen.severityColor[condition.severity] }]}>
                                                {condition.severity.toUpperCase()}
                                            </Text>
                                        </View>
                                    }
                                </Right>
                            </ListItem>

                            <ListItem>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Conditions.bodySite}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{condition.bodySite}</Text>
                                </Body>
                            </ListItem>

                            <ListItem onPress={this.showNotes}>
                                <Body>
                                    <View style={{minHeight: 45, justifyContent: 'center'}}>
                                        <Text style={commonStyles.contentText}>
                                            {strings.Conditions.notes}
                                        </Text>
                                    </View>
                                </Body>
                                <Right style={{minWidth: 60, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center'}}>
                                    {condition.notes && condition.notes.length > 0 &&
                                        <Text style={[commonStyles.infoText, {marginRight: 5}]}>{condition.notes.length}</Text>
                                    }
                                    <Icon style={{marginLeft: 10}} name="arrow-forward"/>
                                </Right>
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
