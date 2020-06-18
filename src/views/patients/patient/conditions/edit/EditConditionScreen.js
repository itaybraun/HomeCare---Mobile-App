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
import AppScreen from '../../../../../support/AppScreen';
import {strings} from '../../../../../localization/strings';
import {appColors, commonStyles, popupNavigationOptions, renderLoading} from '../../../../../support/CommonStyles';
import FormItemContainer from '../../../../other/FormItemContainer';
import {List, Content, ListItem, Icon, Text, Textarea, Left, Body, Right} from 'native-base';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ActionSheet from 'react-native-simple-action-sheet';
import moment from 'moment';
import {Flag} from '../../../../../models/Flag';
import {Request} from '../../../../../support/Utils';
import cloneDeep from 'lodash.clonedeep';
import {Task} from '../../../../../models/Task';
import ListItemContainer from '../../../../other/ListItemContainer';
import {APIRequest} from '../../../../../models/APIRequest';
import {Condition} from '../../../../../models/Condition';

export default class EditConditionScreen extends AppScreen {

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Conditions.editCondition,
            headerBackTitle: ' ',
            ...popupNavigationOptions,
            headerLeft: () => {
                return (
                    <TouchableOpacity style={{paddingHorizontal: 12}} onPress={navigation.getParam('cancel')}>
                        <Icon type="Ionicons" name="md-close"
                              style={{fontSize: 24, color: 'black'}}/>
                    </TouchableOpacity>
                )
            },
            headerRight: () => {
                return (
                    <TouchableOpacity style={{paddingHorizontal: 12}} onPress={navigation.getParam('submit')}>
                        <Text style={[commonStyles.mainColorTitle, commonStyles.medium]}>{strings.Common.submitButton}</Text>
                    </TouchableOpacity>
                )
            }
        }
    };

    state = {
        loading: false,
        condition: null,
        title: null,

        errors: {}
    };

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();

        this.props.navigation.setParams({
            cancel: this.cancel,
            submit: this.submit,
            hideTabBar: true,
        });
    }

    getData = async (refresh = true) => {
        let condition: Condition = this.props.navigation.getParam('condition', null);
        if (condition) {
            condition = cloneDeep(condition);
            this.setState({
                condition: condition,
                title: condition.text,
            });
        }
    };

    validate = () => {
        let condition: Condition = this.state.condition;
        let errors = {};

        if (this.state.title)
            condition.text = this.state.title;
        else
            errors.title = true;

        const success = Object.keys(errors).length === 0;

        return new Request(
            success,
            success ? condition : errors
        );
    };

    submit = async () => {

        await this.setState({
            errors: {},
        });

        let validationResult: Request = this.validate();

        if (validationResult.success) {
            this.setState({loading: true,});
            let result: APIRequest = await this.api.editCondition(validationResult.data);

            if (result.success) {
                const updateCondition = this.props.navigation.getParam('updateCondition', null);
                updateCondition && updateCondition(result.data);
                this.setState({loading: false,});
                this.pop();
            } else {
                this.showError(result.data);
                this.setState({loading: false,});
            }
        } else {
            this.setState({
                errors: validationResult.data
            });
        }
    };

    cancel = () => {
        this.pop();
    };

    render() {

        const condition: Condition = this.state.condition;

        return (
            <View style={commonStyles.screenContainer}>
                {condition &&
                <Content bounces={false} contentContainerStyle={{flexGrow: 1}}>
                    <List>
                        <ListItemContainer onPress={() => {
                            this.navigateTo('SelectText', {
                                title: strings.Conditions.titleText,
                                text: this.state.title,
                                updateText: async (text) => {
                                    let errors = this.state.errors;
                                    errors.title = false;
                                    text = text.isEmpty() ? null : text;
                                    this.setState({
                                        title: text,
                                        errors: errors,
                                    })
                                },
                            });
                        }}
                                           error={this.state.errors.title}>
                            <Body>
                                <Text
                                    style={[commonStyles.smallInfoText, {marginBottom: 5,}, this.state.errors.title && {color: appColors.errorColor}]}>{strings.Conditions.titleText}</Text>
                                <Text
                                    style={[{flex: 1}, commonStyles.formItemText]}>{this.state.title}</Text>
                            </Body>
                            <Right>
                                <Icon name="arrow-forward"/>
                            </Right>
                        </ListItemContainer>

                    </List>
                    <View style={{flex: 1, justifyContent: 'flex-end'}}>
                        <View style={{alignItems: 'flex-end', marginTop: 10,}}>
                            <Image source={require('../../../../../assets/icons/flags/alert.png')}/>
                        </View>
                    </View>
                </Content>
                }
                {renderLoading(this.state.loading)}

            </View>
        );
    }
}

const styles = StyleSheet.create({

});
