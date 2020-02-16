import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView,
    Alert
} from 'react-native';
import AppScreen from '../../../../support/AppScreen';
import {strings} from '../../../../localization/strings';
import {appColors} from '../../../../support/CommonStyles';
import FormItemContainer from '../../../other/FormItemContainer';
import {Icon, Form, Input, Picker, Textarea, Text, Button} from 'native-base';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ActionSheet from 'react-native-simple-action-sheet';
import moment from 'moment';
import {Flag} from '../../../../models/Flag';
import {Request} from '../../../../support/Utils';
import {APIRequest} from '../../../../api/API';

export default class AddFlagScreen extends AppScreen {

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Flags.newFlag,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        category: undefined,
        text: '',
        internal: false,
        startDate: null,
        endDate: null,

        showingStartDatePicker: false,
        showingEndDatePicker: false,
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
        this.setState({loading: true});
        this.setState({loading: false});
    };

    showCategoryPicker = () => {

        let options = this.categories.map(option => option.label);
        if (Platform.OS === 'ios')
            options.push(strings.Common.cancelButton);

        ActionSheet.showActionSheetWithOptions({
                options: options,
                cancelButtonIndex: options.length -1 ,
            },
            (buttonIndex) => {
                if (buttonIndex < this.categories.length) {
                    this.setState({
                        category: this.categories[buttonIndex]
                    })
                }
            });
    };

    validate = () => {
        let flag = new Flag();
        let errors = [];

        if (this.state.category)
            flag.category = this.state.category.label;
        else
            errors.push('category');

        if (!this.state.text.isEmpty())
            flag.text = this.state.text;
        else
            errors.push('text');

        if (this.state.startDate)
            flag.startDate = this.state.startDate;
        else
            errors.push('startDate');

        if (this.state.endDate)
            flag.endDate = this.state.endDate;
        else
            errors.push('endDate');

        flag.internal = this.state.internal;

        return new Request(
            errors.length === 0,
            errors.length === 0 ? flag : new Error(errors)
        );
    };

    submit = async () => {
        let validationResult: Request = this.validate();

        if (validationResult.success) {
            let result: APIRequest = await this.api.addFlag(validationResult.data, this.props.navigation.getParam('patient', null));
            if (result.success) {
                this.pop();
            } else {
                this.showError(result.data);
            }
        } else {
            this.showError(validationResult.data);
        }
    };

    cancel = () => {
        this.pop();
    };

    render() {

        return (
            <View style={styles.container} >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        style={{flex: 1}}
                        contentContainerStyle={{padding: 20}}
                        bounces={false}
                        automaticallyAdjustContentInsets={false}>
                        <Form>
                            <FormItemContainer title={strings.Flags.category}>
                                <TouchableOpacity
                                    style={{flexDirection: 'row', padding: 11, alignItems: 'center'}}
                                    onPress={this.showCategoryPicker}>
                                    <Text style={{flex: 1,}}>{this.state.category?.label ?? ''}</Text>
                                    <Icon name="ios-arrow-down" />
                                </TouchableOpacity>
                            </FormItemContainer>

                            <FormItemContainer style={{paddingVertical: 8,}} title={strings.Flags.text}>
                                <Textarea
                                    rowSpan={4}
                                    style={styles.formItem}
                                    selectionColor={appColors.linkColor}
                                    autoCorrect={false}
                                    onChangeText={value => this.setState({text: value})}
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

                            <FormItemContainer style={{padding: 11,}} title={strings.Flags.startDate}>
                                <TouchableWithoutFeedback
                                    onPress={() => this.setState({showingStartDatePicker: true})}>
                                    <View style={styles.dateContainer}>
                                        <Text style={{flex: 1}}>{this.state.startDate ? moment(this.state.startDate).format('YYYY-MM-DD') : ''}</Text>
                                        <Icon type="Octicons" name="calendar" />
                                    </View>
                                </TouchableWithoutFeedback>
                            </FormItemContainer>

                            <FormItemContainer style={{padding: 11,}} title={strings.Flags.endDate}>
                                <TouchableWithoutFeedback
                                    onPress={() => this.setState({showingEndDatePicker: true})}>
                                    <View style={styles.dateContainer}>
                                        <Text style={{flex: 1}}>{this.state.endDate ? moment(this.state.endDate).format('YYYY-MM-DD') : ''}</Text>
                                        <Icon type="Octicons" name="calendar" />
                                    </View>
                                </TouchableWithoutFeedback>
                            </FormItemContainer>
                        </Form>
                        <DateTimePickerModal
                            isVisible={this.state.showingStartDatePicker}
                            mode="date"
                            date={this.state.startDate ?? new Date()}
                            onConfirm={(date) => this.setState({
                                startDate: date,
                                endDate: moment(date).add(180, 'd').toDate(),
                                showingStartDatePicker: false
                            })}
                            onCancel={() => this.setState({showingStartDatePicker: false,})}
                        />
                        <DateTimePickerModal
                            isVisible={this.state.showingEndDatePicker}
                            minimumDate={this.state.startDate}
                            date={this.state.endDate ?? new Date()}
                            mode="date"
                            onConfirm={(date) => this.setState({
                                endDate: date,
                                showingEndDatePicker: false
                            })}
                            onCancel={() => this.setState({showingEndDatePicker: false,})}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Button transparent success
                                    onPress={this.submit}>
                                <Text style={{fontWeight: 'bold'}}>{strings.Common.submitButton.toUpperCase()}</Text>
                            </Button>
                            <Button transparent danger
                                    onPress={this.cancel}>
                                <Text style={{fontWeight: 'bold'}}>{strings.Common.cancelButton.toUpperCase()}</Text>
                            </Button>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    formItem: {
        padding: 0,
        paddingLeft: 11,
        paddingRight: 11,
        fontSize: 16,
    },

    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
