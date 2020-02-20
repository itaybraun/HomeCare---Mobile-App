import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView,
} from 'react-native';
import AppScreen from '../../../../support/AppScreen';
import {strings} from '../../../../localization/strings';
import {appColors, commonStyles} from '../../../../support/CommonStyles';
import FormItemContainer from '../../../other/FormItemContainer';
import {Button, Form, Icon, Text, Textarea} from 'native-base';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ActionSheet from 'react-native-simple-action-sheet';
import moment from 'moment';
import {Flag} from '../../../../models/Flag';
import {Request} from '../../../../support/Utils';
import {APIRequest} from '../../../../api/API';
import {Patient} from '../../../../models/Patient';

export default class FlagScreen extends AppScreen {

    static navigationOptions = ({ navigation }) => {

        const flag: Flag = navigation.getParam('flag', null);

        return {
            title: flag ? strings.Flags.editFlag : strings.Flags.newFlag,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        category: null,
        text: '',
        internal: false,
        startDate: null,
        endDate: null,

        showingStartDatePicker: false,
        showingEndDatePicker: false,

        errors: {}
    };

    categories = [
        {key: 'admin', label: strings.Flags.admin,},
        {key: 'behavioral', label: strings.Flags.behavioral,},
        {key: 'clinical', label: strings.Flags.clinical,},
        {key: 'contact', label: strings.Flags.contact,},
        {key: 'drug', label: strings.Flags.drug,},
        {key: 'lab', label: strings.Flags.lab,},
        {key: 'safety', label: strings.Flags.safety,},
    ];

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();
    }

    getData = async (refresh = true) => {
        const flag: Flag = this.props.navigation.getParam('flag', null);

        if (flag) {
            this.setState({
                category: this.categories.find(category => category.label === flag.category),
                text: flag.text,
                internal: flag.internal,
                startDate: flag.startDate,
                endDate: flag.endDate,
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
                    this.setState({
                        category: this.categories[buttonIndex],
                        errors: errors,
                    })
                }
            });
    };

    validate = () => {
        let flag = new Flag();
        let errors = {};

        if (this.state.category)
            flag.category = this.state.category.label;
        else
            errors.category = true;

        if (!this.state.text.isEmpty())
            flag.text = this.state.text;
        else
            errors.text = true;

        if (this.state.startDate)
            flag.startDate = this.state.startDate;
        else
            errors.startDate = true;

        if (this.state.endDate)
            flag.endDate = this.state.endDate;
        else
            errors.endDate = true;

        flag.internal = this.state.internal;

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
            let result: APIRequest;
            const flag: Flag = this.props.navigation.getParam('flag', null);
            const patient: Patient = this.props.navigation.getParam('patient', null);
            if (!patient)
                return; // this should never happen!

            if (flag) {
                validationResult.data.id = flag.id;
                result = await this.api.editFlag(validationResult.data, patient);
            } else {
                result = await this.api.addFlag(validationResult.data, patient);
            }
            if (result.success) {
                this.pop();
            } else {
                this.showError(result.data);
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
        return (
            <View style={commonStyles.screenContainer} >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        style={{flex: 1}}
                        contentContainerStyle={{padding: 20}}
                        bounces={false}
                        automaticallyAdjustContentInsets={false}>
                        <Form>
                            <FormItemContainer
                                title={strings.Flags.category}
                                error={this.state.errors.category}>
                                <TouchableOpacity
                                    style={{flexDirection: 'row', padding: 11, alignItems: 'center'}}
                                    onPress={this.showCategoryPicker}>
                                    <Text style={{flex: 1,}}>{this.state.category?.label ?? ''}</Text>
                                    <Icon name="ios-arrow-down" />
                                </TouchableOpacity>
                            </FormItemContainer>

                            <FormItemContainer
                                style={{paddingVertical: 8,}}
                                title={strings.Flags.text}
                                error={this.state.errors.text}>
                                <Textarea
                                    rowSpan={4}
                                    style={commonStyles.formItem}
                                    selectionColor={appColors.linkColor}
                                    autoCorrect={false}
                                    value={this.state.text}
                                    onChangeText={value => {
                                        let errors = this.state.errors;
                                        errors.text = false;
                                        this.setState({
                                            text: value,
                                            errors: errors,
                                        })
                                    }}
                                />
                            </FormItemContainer>

                            <FormItemContainer style={{padding: 11, flexDirection: 'row', justifyContent: 'space-between'}} title={strings.Flags.internal}>
                                <Button
                                    style={{
                                        borderColor: appColors.linkColor,
                                        backgroundColor: this.state.internal ? appColors.yellowColor : '#FFFFFF',
                                        width: 80,
                                        justifyContent: 'center'
                                    }}
                                    bordered small rounded
                                    onPress={() => this.setState({internal: true})}>
                                    <Text style={{color: appColors.linkColor}}>{strings.Common.yesButton.toUpperCase()}</Text>
                                </Button>
                                <Button
                                    style={{
                                        borderColor: appColors.linkColor,
                                        backgroundColor: !this.state.internal ? appColors.yellowColor : '#FFFFFF',
                                        width: 80,
                                        justifyContent: 'center'
                                    }}
                                    bordered small rounded
                                    onPress={() => this.setState({internal: false})}>
                                    <Text style={{color: appColors.linkColor}}>{strings.Common.noButton.toUpperCase()}</Text>
                                </Button>
                            </FormItemContainer>

                            <FormItemContainer
                                style={{padding: 11,}}
                                title={strings.Flags.startDate}
                                error={this.state.errors.startDate}>
                                <TouchableWithoutFeedback
                                    onPress={() => this.setState({showingStartDatePicker: true})}>
                                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                                        <Text style={{flex: 1}}>{this.state.startDate ? moment(this.state.startDate).format('YYYY-MM-DD') : ''}</Text>
                                        <Icon type="Octicons" name="calendar" />
                                    </View>
                                </TouchableWithoutFeedback>
                            </FormItemContainer>

                            <FormItemContainer
                                style={{padding: 11,}}
                                title={strings.Flags.endDate}
                                error={this.state.errors.endDate}
                            >
                                <TouchableWithoutFeedback
                                    onPress={() => this.setState({showingEndDatePicker: true})}>
                                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center',}}>
                                        <Text style={[{flex: 1}, commonStyles.contentText]}>{this.state.endDate ? moment(this.state.endDate).format('YYYY-MM-DD') : ''}</Text>
                                        <Icon type="Octicons" name="calendar" />
                                    </View>
                                </TouchableWithoutFeedback>
                            </FormItemContainer>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Button success transparent
                                        onPress={this.submit}>
                                    <Text style={{fontWeight: 'bold'}}>{strings.Common.submitButton.toUpperCase()}</Text>
                                </Button>
                                <Button danger transparent
                                        onPress={this.cancel}>
                                    <Text style={{fontWeight: 'bold'}}>{strings.Common.cancelButton.toUpperCase()}</Text>
                                </Button>
                            </View>
                        </Form>
                    </ScrollView>
                </TouchableWithoutFeedback>

                <DateTimePickerModal
                    isVisible={this.state.showingStartDatePicker}
                    mode="date"
                    date={this.state.startDate ?? new Date()}
                    onConfirm={(date) => {
                        let errors = this.state.errors;
                        errors.startDate = false;
                        errors.endDate = false;
                        this.setState({
                            startDate: date,
                            endDate: moment(date).add(180, 'd').toDate(),
                            showingStartDatePicker: false,
                            errors: errors,
                        })
                    }}
                    onCancel={() => this.setState({showingStartDatePicker: false,})}
                />
                <DateTimePickerModal
                    isVisible={this.state.showingEndDatePicker}
                    minimumDate={this.state.startDate}
                    date={this.state.endDate ?? new Date()}
                    mode="date"
                    onConfirm={(date) => {
                        let errors = this.state.errors;
                        errors.endDate = false;
                        this.setState({
                            endDate: date,
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
