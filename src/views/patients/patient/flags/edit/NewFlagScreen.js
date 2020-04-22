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
import {Body, Button, Container, Content, Form, Icon, List, Right, Text, Textarea} from 'native-base';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ActionSheet from 'react-native-simple-action-sheet';
import moment from 'moment';
import {Flag} from '../../../../../models/Flag';
import {Request} from '../../../../../support/Utils';
import {APIRequest} from '../../../../../api/API';
import cloneDeep from 'lodash.clonedeep';
import {Priority, Task} from '../../../../../models/Task';
import ListItemContainer from '../../../../other/ListItemContainer';
import {Patient} from '../../../../../models/Patient';

export default class NewFlagScreen extends AppScreen {

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Flags.newFlag,
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
        patient: null,
        patientDisabled: false,
        category: null,
        text: '',
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
        let patient = this.props.navigation.getParam('patient', null);
        this.setState({
            patient: patient,
            patientDisabled: patient !== null,
        });
    };

    selectPatient = () => {
        this.navigateTo('SelectPatient', {
            selectedPatient: this.state.patient,
            updatePatient: async (patient: Patient) => {
                let errors = this.state.errors;
                errors.patient = false;
                this.setState({patient: patient, errors: errors});
            },
        });
    };

    changeText = () => {
        this.navigateTo('SelectText', {
            title: strings.Flags.text,
            text: this.state.text,
            updateText: async (text) => {
                let errors = this.state.errors;
                errors.text = false;
                this.setState({
                    text: text,
                    errors: errors,
                })
            },
        });
    };

    selectCategory = () => {
        this.navigateTo('SelectCategory', {
            selectedCategory: this.state.category,
            updateCategory: async (category) => {
                let errors = this.state.errors;
                errors.category = false;
                this.setState({
                    category: category,
                    errors: errors,
                });
            },
        });
    };

    validate = () => {
        let flag = new Flag();
        let errors = {};

        if (this.state.patient) {
            flag.patientId = this.state.patient?.id;
            flag.patient = this.state.patient;
        } else {
            errors.patient = true;
        }

        if (this.state.category) {
            flag.category = this.state.category;
        } else {
            errors.category = true;
        }

        if (this.state.text && !this.state.text.isEmpty()) {
            flag.text = this.state.text;
        } else {
            errors.text = true;
        }

        if (this.state.startDate) {
            flag.startDate = this.state.startDate;
        } else {
            errors.startDate = true;
        }

        if (this.state.endDate) {
            flag.endDate = this.state.endDate;
        } else {
            errors.endDate = true;
        }

        flag.status = 'active';

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
            let flag: Flag = validationResult.data;
            let result: APIRequest = await this.api.addFlag(flag);

            if (result.success) {
                const refresh = this.props.navigation.getParam('refresh', null);
                refresh && refresh();
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
        return (
            <View style={commonStyles.screenContainer}>
                <Container style={{paddingVertical: 20}}>
                    <Content bounces={false} contentContainerStyle={{flexGrow: 1}}>
                        <List>
                            <Text style={[commonStyles.boldTitleText, {paddingLeft: 20}]}>
                                {strings.Flag.patient}
                            </Text>
                            <ListItemContainer error={this.state.errors.patient}
                                               disabled={this.state.patientDisabled}
                                               onPress={this.selectPatient}>
                                <Body>
                                    {
                                        this.state.patient ?
                                            <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                                {this.state.patient.fullName}
                                            </Text> :
                                            <Text
                                                style={[{flex: 1}, commonStyles.infoText, this.state.errors.patient && {color: '#FF0000'}]}>
                                                {strings.Task.selectAPatient}
                                            </Text>
                                    }

                                </Body>
                                {!this.state.patientDisabled &&
                                <Right>
                                    <Icon name="arrow-forward"/>
                                </Right>
                                }
                            </ListItemContainer>

                            <Text style={[commonStyles.boldTitleText, {paddingLeft: 20, paddingTop: 20}]}>
                                {strings.Flag.flag}
                            </Text>

                            <ListItemContainer onPress={this.changeText} error={this.state.errors.text}>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}, this.state.errors.text && {color: '#FF0000'}]}>{strings.Flags.text}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{this.state.text}</Text>
                                </Body>
                                <Right>
                                    <Icon name="arrow-forward"/>
                                </Right>
                            </ListItemContainer>

                            <ListItemContainer onPress={this.selectCategory} error={this.state.errors.category}>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}, this.state.errors.category && {color: '#FF0000'}]}>{strings.Flags.category}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{strings.Categories[this.state.category?.toLowerCase()] || ''}</Text>
                                </Body>
                                <Right>
                                    <Icon name="arrow-forward"/>
                                </Right>
                            </ListItemContainer>

                            <ListItemContainer onPress={() => this.setState({showingStartDatePicker: true})}  error={this.state.errors.startDate}>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}, this.state.errors.startDate && {color: '#FF0000'}]}>{strings.Flags.startDate}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{this.state.startDate ? moment(this.state.startDate).format('YYYY-MM-DD') : ''}</Text>
                                </Body>
                                <Right>
                                    <Icon type='Octicons' name='calendar' style={{fontSize: 30, color: '#000000'}}/>
                                </Right>
                            </ListItemContainer>

                            <ListItemContainer onPress={() => this.setState({showingEndDatePicker: true})} error={this.state.errors.endDate}>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}, this.state.errors.endDate && {color: '#FF0000'}]}>{strings.Flags.endDate}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{this.state.endDate ? moment(this.state.endDate).format('YYYY-MM-DD') : ''}</Text>
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
                </Container>
                {renderLoading(this.state.loading)}


                <DateTimePickerModal
                    isVisible={this.state.showingStartDatePicker}
                    mode="date"
                    date={this.state.flag?.startDate || new Date()}
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
                    minimumDate={this.state.flag?.startDate}
                    date={this.state.flag?.endDate || new Date()}
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
