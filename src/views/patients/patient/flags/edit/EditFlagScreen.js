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
import {Button, Content, Form, Icon, Text, Textarea} from 'native-base';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ActionSheet from 'react-native-simple-action-sheet';
import moment from 'moment';
import {Flag} from '../../../../../models/Flag';
import {Request} from '../../../../../support/Utils';
import {APIRequest} from '../../../../../api/API';
import cloneDeep from 'lodash.clonedeep';

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
        text: '',
        startDate: null,
        endDate: null,

        showingStartDatePicker: false,
        showingEndDatePicker: false,

        errors: {}
    };

    categories = [
        {key: 'Admin', label: strings.Categories.admin,},
        {key: 'Behavioral', label: strings.Categories.behavioral,},
        {key: 'Clinical', label: strings.Categories.clinical,},
        {key: 'Contact', label: strings.Categories.contact,},
        {key: 'Drug', label: strings.Categories.drug,},
        {key: 'Lab', label: strings.Categories.lab,},
        {key: 'Safety', label: strings.Categories.safety,},
    ];

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

    showCategoryPicker = () => {

        let options = this.categories.map(option => option.label);
        if (Platform.OS === 'ios')
            options.push(strings.Common.cancelButton);

        ActionSheet.showActionSheetWithOptions({
                options: options,
                cancelButtonIndex: options.length - 1,
            },
            (buttonIndex) => {
                if (buttonIndex < this.categories.length) {
                    let errors = this.state.errors;
                    errors.category = false;
                    let flag: Flag = this.state.flag;
                    flag.category = this.categories[buttonIndex]?.key;
                    this.setState({
                        flag: flag,
                        errors: errors,
                    })
                }
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
            console.log(result);

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
                    <Content
                        style={{flex: 1}}
                        contentContainerStyle={{padding: 20, paddingBottom: 0, flexGrow: 1,}}
                        bounces={false}
                        automaticallyAdjustContentInsets={false}>
                        <Form style={{flex: 1,}}>

                            <FormItemContainer
                                style={{paddingVertical: 8,}}
                                title={strings.Flags.text}
                                error={this.state.errors.text}>
                                <Textarea
                                    rowSpan={4}
                                    style={[commonStyles.formItem, commonStyles.formItemText]}
                                    selectionColor={appColors.linkColor}
                                    autoCorrect={false}
                                    value={flag.text}
                                    onChangeText={value => {
                                        let errors = this.state.errors;
                                        errors.text = false;
                                        flag.text = value;
                                        this.setState({
                                            flag: flag,
                                            errors: errors,
                                        })
                                    }}
                                />
                            </FormItemContainer>

                            <FormItemContainer
                                title={strings.Flags.category}
                                error={this.state.errors.category}>
                                <TouchableOpacity
                                    style={{flexDirection: 'row', padding: 11, alignItems: 'center'}}
                                    onPress={this.showCategoryPicker}>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{strings.Categories[flag.category?.toLowerCase()] || ''}</Text>
                                    <Icon name="ios-arrow-down"/>
                                </TouchableOpacity>
                            </FormItemContainer>

                            <FormItemContainer
                                style={{padding: 11,}}
                                title={strings.Flags.startDate}
                                error={this.state.errors.startDate}>
                                <TouchableOpacity
                                    onPress={() => this.setState({showingStartDatePicker: true})}>
                                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                                        <Text
                                            style={[{flex: 1}, commonStyles.formItemText]}>{flag.startDate ? moment(flag.startDate).format('YYYY-MM-DD') : ''}</Text>
                                        <Icon type="Octicons" name="calendar"/>
                                    </View>
                                </TouchableOpacity>
                            </FormItemContainer>

                            <FormItemContainer
                                style={{padding: 11,}}
                                title={strings.Flags.endDate}
                                error={this.state.errors.endDate}
                            >
                                <TouchableOpacity
                                    onPress={() => this.setState({showingEndDatePicker: true})}>
                                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                                        <Text
                                            style={[{flex: 1}, commonStyles.formItemText]}>{flag.endDate ? moment(flag.endDate).format('YYYY-MM-DD') : ''}</Text>
                                        <Icon type="Octicons" name="calendar"/>
                                    </View>
                                </TouchableOpacity>
                            </FormItemContainer>


                        </Form>
                        <View style={{alignItems: 'flex-end', marginTop: 10,}}>
                            <Image source={require('../../../../../assets/icons/flags/alert.png')}/>
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
