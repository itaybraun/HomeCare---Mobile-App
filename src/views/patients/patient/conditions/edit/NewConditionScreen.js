import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView, Image, ActivityIndicator, Platform,
} from 'react-native';
import AppScreen from '../../../../../support/AppScreen';
import {strings} from '../../../../../localization/strings';
import {appColors, commonStyles, popupNavigationOptions, renderLoading} from '../../../../../support/CommonStyles';
import FormItemContainer from '../../../../other/FormItemContainer';
import {Body, Button, Container, Content, Form, Icon, List, Right, Text, Textarea} from 'native-base';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ActionSheet from 'react-native-simple-action-sheet';
import moment from 'moment';
import {Request, uploadImages} from '../../../../../support/Utils';
import APIRequest from '../../../../../models/APIRequest';
import cloneDeep from 'lodash.clonedeep';
import {Priority, Task} from '../../../../../models/Task';
import ListItemContainer from '../../../../other/ListItemContainer';
import {Patient} from '../../../../../models/Patient';
import {Condition, ConditionNote} from '../../../../../models/Condition';
import {QuestionnaireItem} from '../../../../../models/Questionnaire';
import ImagePicker from 'react-native-image-picker';

export default class NewConditionScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        return {
            title: strings.Conditions.newCondition,
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
                        <Text
                            style={[commonStyles.mainColorTitle, commonStyles.medium]}>{strings.Common.submitButton}</Text>
                    </TouchableOpacity>
                )
            }
        }
    };

    state = {
        loading: false,
        patient: null,
        patientDisabled: false,
        title: null,
        severity: null,
        note: null,
        bodySite: null,
        startedDate: null,
        images: [],
        sendTo: null,

        showingStartedDatePicker: false,

        errors: {}
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();

        this.props.navigation.setParams({
            cancel: this.cancel,
            submit: this.submit,
            hideTabBar: true,
        });
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        let patient = this.props.navigation.getParam('patient', null);
        this.setState({
            patient: patient,
            patientDisabled: patient !== null,
        });
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

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

    addImage = (index: Number) => {
        ImagePicker.showImagePicker((response) => {
            console.log('Response = ', response);

            let images = this.state.images || [];
            images.splice(index, 1);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                let images = this.state.images || [];
                let path = Platform.OS === 'ios' ? response.uri.replace("file://", "") : "file://"+response.path;
                images[index] = path;
            }

            this.setState({images: images,});
        });

        let images = this.state.images || [];
        images[index] = true;
        this.setState({images: images,});
    };

    removeImage = (index: Number,) => {
        let images = this.state.images || [];
        images.splice(index, 1);
        this.setState({images: images,});
    };

    validate = () => {
        let condition = new Condition();
        let errors = {};

        if (this.state.patient) {
            condition.patientId = this.state.patient?.id;
            condition.patient = this.state.patient;
        } else {
            errors.patient = true;
        }

        if (this.state.title)
            condition.text = this.state.title;
        else
            errors.title = true;


        condition.severity = this.state.severity;
        condition.bodySite = this.state.bodySite;

        if (this.state.note) {
            let newNote = new ConditionNote();
            newNote.authorId = this.api.user.id;
            newNote.authorName = this.api.user.fullName;
            newNote.text = this.state.note.trim();
            newNote.time = new Date();

            condition.notes = [newNote];
        }

        condition.images = this.state.images;

        condition.recorderId = this.api.user.id;
        condition.recorder = this.api.user;

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

            const images = await uploadImages(this.state.images, this.settings.imageQuality, 'fhir1imagestore', 'blob1');

            let condition: Condition = validationResult.data;
            condition.images = images;
            let result: APIRequest = await this.api.addCondition(condition);

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

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderImages = () => {
        let images = this.state.images?.map(i => i) || [];
        if (images.length <= 2) {
            images.push(null);
        }

        return (
            <ListItemContainer>
                <Body>
                    <Text style={[commonStyles.smallInfoText]}>
                        {strings.Conditions.images}
                    </Text>

                    <Content horizontal style={{flexDirection: 'row', padding: 0, marginHorizontal: 10}}
                             bounces={false}
                    >
                        {
                            images.map((image, index) => {
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={{paddingTop: 10, paddingRight: 10,}}
                                        onPress={() => image ? this.removeImage(index) : this.addImage(index)}>
                                        <View style={styles.imageInnerContainer}>
                                            {
                                                image ?
                                                    <View style={{overflow: 'visible',}}>
                                                        {
                                                            image === true ?
                                                                <View style={{
                                                                    width: 64,
                                                                    height: 64,
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <ActivityIndicator/>
                                                                </View>
                                                                :
                                                                <View style={{overflow: 'visible',}}>
                                                                    <Image style={{width: 64, height: 64}}
                                                                           source={{uri: image}}/>

                                                                </View>
                                                        }

                                                    </View>
                                                    :
                                                    <View key='add' style={{paddingHorizontal: 5,}}>
                                                        <Icon type="Feather" name="plus" style={{
                                                            fontSize: 24,
                                                            color: appColors.mainColor,
                                                            paddingTop: Platform.OS === 'ios' ? 4 : 0
                                                        }}/>
                                                    </View>
                                            }
                                            {
                                                (typeof image === 'string') &&
                                                <View style={{
                                                    backgroundColor: 'red', position: 'absolute',
                                                    width: 16, height: 16, borderRadius: 8, right: -8, top: -8,
                                                    alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <Icon style={{color: 'white', marginTop: -1, fontSize: 16}}
                                                          name='remove' type='FontAwesome'/>
                                                </View>


                                            }
                                        </View>
                                    </TouchableOpacity>

                                )
                            })
                        }
                    </Content>

                </Body>

            </ListItemContainer>
        )
    };

    render() {
        return (
            <View style={commonStyles.screenContainer}>
                <Container style={{paddingVertical: 20}}>
                    <Content bounces={false} contentContainerStyle={{flexGrow: 1}}>
                        <List>
                            <Text style={[commonStyles.boldTitleText, {paddingLeft: 20}]}>
                                {strings.Conditions.patient}
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
                                                style={[{flex: 1}, commonStyles.infoText, this.state.errors.patient && {color: appColors.errorColor}]}>
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
                                {strings.Conditions.theProblem}
                            </Text>

                            <ListItemContainer onPress={() => {
                                this.navigateTo('SelectText', {
                                    title: strings.Conditions.titleText,
                                    text: this.state.title,
                                    updateText: async (text) => {
                                        let errors = this.state.errors;
                                        errors.title = false;
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
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}, this.state.errors.title && {color: appColors.errorColor}]}>{strings.Conditions.titleText} *</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{this.state.title}</Text>
                                </Body>
                                <Right>
                                    <Icon name="arrow-forward"/>
                                </Right>
                            </ListItemContainer>


                            <ListItemContainer onPress={() => {
                                this.navigateTo('SelectSeverity', {
                                    selectedSeverity: this.state.severity,
                                    updateSeverity: async (severity) => {
                                        this.setState({
                                            severity: severity,
                                        });
                                    },
                                })
                            }}>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Conditions.severity}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{strings.Severity[this.state.severity?.toLowerCase()] || ''}</Text>
                                </Body>
                                <Right>
                                    <Icon name="arrow-forward"/>
                                </Right>
                            </ListItemContainer>


                            <ListItemContainer onPress={() => {
                                this.navigateTo('SelectText', {
                                    title: strings.Conditions.note,
                                    text: this.state.note,
                                    updateText: async (text) => {
                                        this.setState({
                                            note: text,
                                        })
                                    },
                                });
                            }}>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Conditions.note}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{this.state.note}</Text>
                                </Body>
                                <Right>
                                    <Icon name="arrow-forward"/>
                                </Right>
                            </ListItemContainer>


                            <ListItemContainer onPress={() => {
                                this.navigateTo('SelectText', {
                                    title: strings.Conditions.bodySite,
                                    text: this.state.bodySite,
                                    updateText: async (text) => {
                                        this.setState({
                                            bodySite: text,
                                        })
                                    },
                                });
                            }}>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Conditions.bodySite}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{this.state.bodySite}</Text>
                                </Body>
                                <Right>
                                    <Icon name="arrow-forward"/>
                                </Right>
                            </ListItemContainer>

                            {this.renderImages()}

                            <Text style={[commonStyles.boldTitleText, {paddingLeft: 20, paddingTop: 20}]}>
                                {strings.Conditions.notifications}
                            </Text>

                            <ListItemContainer>
                                <Body>
                                    <Text
                                        style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.Conditions.sendTo}</Text>
                                    <Text
                                        style={[{flex: 1}, commonStyles.formItemText]}>{this.state.sendTo}</Text>
                                </Body>
                                <Right>
                                    {/*<Icon name="arrow-forward"/>*/}
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
                    isVisible={this.state.showingStartedDatePicker}
                    mode="date"
                    date={this.state.startedDate || new Date()}
                    onConfirm={(date) => {
                        let errors = this.state.errors;
                        errors.startedDate = false;
                        this.setState({
                            startedDate: date,
                            showingStartedDatePicker: false,
                            errors: errors,
                        })
                    }}
                    onCancel={() => this.setState({showingStartedDatePicker: false,})}
                />

            </View>
        );
    }
}

const styles = StyleSheet.create({
    imageInnerContainer: {
        height: 64,
        width: 64,
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        overflow: 'visible',
        borderColor: appColors.infoColor,
    },
});
