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
import {APIRequest} from '../../../../../api/API';
import cloneDeep from 'lodash.clonedeep';
import {Task} from '../../../../../models/Task';
import ListItemContainer from '../../../../other/ListItemContainer';

export default class EditFlagScreen extends AppScreen {

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Flag.editFlag,
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
        flag: null,
        category: null,
        startDate: null,
        endDate: null,

        showingStartDatePicker: false,
        showingEndDatePicker: false,

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
        let flag: Flag = this.props.navigation.getParam('flag', null);
        if (flag) {
            flag = cloneDeep(flag);
            this.setState({
                flag: flag,
            });
        }
    };

    changeText = () => {
        this.navigateTo('SelectText', {
            title: strings.Flags.text,
            text: this.state.flag.text,
            updateText: async (text) => {
                let errors = this.state.errors;
                errors.text = false;
                let flag: Flag = this.state.flag;
                flag.text = text;
                this.setState({
                    flag: flag,
                    errors: errors,
                })
            },
        });
    };

    selectCategory = () => {
        this.navigateTo('SelectCategory', {
            selectedCategory: this.state.flag.category,
            updateCategory: async (category) => {
                let errors = this.state.errors;
                errors.category = false;
                let flag: Flag = this.state.flag;
                flag.category = category;
                this.setState({
                    flag: flag,
                    errors: errors,
                })
            },
        });
    };

    validate = () => {
        let flag = this.state.flag;
        let errors = {};

        if (!flag.category)
            errors.category = true;

        if (flag.text.isEmpty())
            errors.text = true;

        if (!flag.startDate)
            errors.startDate = true;

        if (!flag.endDate)
            errors.endDate = true;

        const success = Object.keys(errors).length === 0;

        return new Request(
            success,
            success ? flag : errors
        );
    };

    submit = async () => {

        await this.setState({
            errors: {},
        });

        let validationResult: Request = this.validate();

        if (validationResult.success) {
            this.setState({loading: true,});
            let result: APIRequest = await this.api.editFlag(this.state.flag);

            if (result.success) {
                const updateFlag = this.props.navigation.getParam('updateFlag', null);
                updateFlag && updateFlag(result.data);
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

        const flag: Flag = this.state.flag;

        return (
            <View style={commonStyles.screenContainer}>
                {flag &&
                <Content bounces={false} contentContainerStyle={{flexGrow: 1}}>
                    <List>
                        <ListItemContainer onPress={this.changeText} error={this.state.errors.text}>
                            <Body>
                                <Text
                                    style={[commonStyles.smallInfoText, {marginBottom: 5,}, this.state.errors.text && {color: '#FF0000'}]}>{strings.Flags.text}</Text>
                                <Text
                                    style={[{flex: 1}, commonStyles.formItemText]}>{this.state.flag.text}</Text>
                            </Body>
                            <Right>
                                <Icon name="arrow-forward"/>
                            </Right>
                        </ListItemContainer>
                        <ListItemContainer onPress={this.selectCategory}>
                            <Body>
                                <Text
                                    style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Flags.category}</Text>
                                <Text
                                    style={[{flex: 1}, commonStyles.formItemText]}>{strings.Categories[flag.category?.toLowerCase()] || ''}</Text>
                            </Body>
                            <Right>
                                <Icon name="arrow-forward"/>
                            </Right>
                        </ListItemContainer>

                        <ListItemContainer onPress={() => this.setState({showingStartDatePicker: true})}>
                            <Body>
                                <Text
                                    style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Flags.startDate}</Text>
                                <Text
                                    style={[{flex: 1}, commonStyles.formItemText]}>{flag.startDate ? moment(flag.startDate).format('YYYY-MM-DD') : ''}</Text>
                            </Body>
                            <Right>
                                <Icon type='Octicons' name='calendar' style={{fontSize: 30, color: '#000000'}}/>
                            </Right>
                        </ListItemContainer>

                        <ListItemContainer onPress={() => this.setState({showingEndDatePicker: true})}>
                            <Body>
                                <Text
                                    style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Flags.endDate}</Text>
                                <Text
                                    style={[{flex: 1}, commonStyles.formItemText]}>{flag.endDate ? moment(flag.endDate).format('YYYY-MM-DD') : ''}</Text>
                            </Body>
                            <Right>
                                <Icon type='Octicons' name='calendar' style={{fontSize: 30, color: '#000000'}}/>
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


                <DateTimePickerModal
                    isVisible={this.state.showingStartDatePicker}
                    mode="date"
                    date={this.state.flag?.startDate || new Date()}
                    onConfirm={(date) => {
                        let errors = this.state.errors;
                        errors.startDate = false;
                        errors.endDate = false;
                        let flag: Flag = this.state.flag;
                        flag.startDate = date;
                        flag.endDate = moment(date).add(180, 'd').toDate();
                        this.setState({
                            flag: flag,
                            showingStartDatePicker: false,
                            errors: errors,
                        })
                    }}
                    onCancel={() => this.setState({showingStartDatePicker: false,})}
                />
                <DateTimePickerModal
                    isVisible={this.state.showingEndDatePicker}
                    minimumDate={this.state.flag?.startDate}
                    date={this.state.flag?.endDate || new Date()}
                    mode="date"
                    onConfirm={(date) => {
                        let errors = this.state.errors;
                        errors.endDate = false;
                        let flag: Flag = this.state.flag;
                        flag.endDate = date,
                        this.setState({
                            flag: flag,
                            showingEndDatePicker: false,
                            errors: errors,
                        })
                    }}
                    onCancel={() => this.setState({showingEndDatePicker: false,})}
                />

            </View>
        );
    }
}

const styles = StyleSheet.create({

});
