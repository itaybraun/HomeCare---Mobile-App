import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Text,
    ScrollView,
    Keyboard, TouchableWithoutFeedback, Alert, Platform, Image, TextInput,
} from 'react-native';
import AppScreen from '../../../support/AppScreen';
import {
    appColors,
    commonStyles,
    popupNavigationOptions,
    renderLoading,
    renderTabBar,
} from '../../../support/CommonStyles';
import APIRequest from '../../../models/APIRequest';
import {Questionnaire, QuestionnaireItem} from '../../../models/Questionnaire';
import {Status, Task} from '../../../models/Task';
import {strings} from '../../../localization/strings';
import QuestionnaireItemsView from './items/QuestionnaireItemsView';
import {Content, Button, Icon} from 'native-base';
import {Request} from '../../../support/Utils';
import {TabView} from 'react-native-tab-view';
import {EAzureBlobStorageImage} from 'react-native-azure-blob-storage';
import ImageResizer from 'react-native-image-resizer';
import {TransitionPresets} from 'react-navigation-stack';
import moment from 'moment';

export default class QuestionnaireScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {

        const transition = navigation.getParam('onCancel') ? TransitionPresets.SlideFromRightIOS : null;

        return {
            title: strings.Questionnaire.title,
            headerBackTitle: ' ',
            ...popupNavigationOptions,
            ...transition,
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
                        <Text style={[commonStyles.questionnaireTitle, commonStyles.medium]}>{strings.Common.submitButton}</Text>
                    </TouchableOpacity>
                )
            }
        }
    };

    state = {
        loading: false,
        questionnaire: null,
        task: null,
        values: {},
        errors: {},
    };

    imageStore = "fhir1imagestore";
    blob = "blob1";


    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();

        EAzureBlobStorageImage.configure(
            this.imageStore,
            "47+vv7jGM8gpHJGspmgveOwI8hNCQKC9uJ2Rynq7F6wdqnZvdivg5BJQuyZYk75gOnlPvFd9oVuuG2/eMRCscw==",
            this.blob,
        );

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
        const task: Task =  this.props.navigation.getParam('task', null);

        if (task && task.activity?.questionnaireId) {
            this.setState({loading: true});
            const questionnaire = await this.getQuestionnaire(task);
            this.setState({
                ...questionnaire,
                task: task,
                loading: false
            });
        }
    };

    getQuestionnaire = async (task: Task) => {

        let result: APIRequest = await this.api.getQuestionnaire(task.activity.questionnaireId);
        if (result.success) {
            const questionnaire: Questionnaire = result.data;
            questionnaire.patient = task.patient;
            //this.props.navigation.setParams({title: questionnaire.name})
            return {questionnaire: questionnaire};
        } else {
            this.showError(result.data);
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    cancel = () => {
        this.pop();
        const onCancel = this.props.navigation.getParam('onCancel', null);
        onCancel && onCancel();
    };

    selectItem = (item: QuestionnaireItem) => {

        if (!item) {
            return null;
        }

        let navigationName = null;

        switch(item.type) {
            case 'choice':
                navigationName = 'QuestionnaireChoiceItem';
                break;
            case 'integer':
            case 'decimal':
            case 'string':
                navigationName = 'QuestionnaireInputItem';
                break;
        }



        navigationName && this.navigateTo(navigationName, {
            item: item,
            value: this.state.values[item.link],
            updateValue: (value) => {
                let errors = this.state.errors;
                errors[item.link] = false;
                let values = this.state.values;
                values[item.link] = value;
                this.setState({
                    values: values,
                    errors: errors,
                })
            }
        });
    };

    validate = () => {
        const errors = {};
        const requiredItems = this.getRequiredItemsIds();
        for (const link of requiredItems) {
            if (!this.state.values.hasOwnProperty(link) || this.state.values[link] === null) {
                errors[link] = true;
            }
        }

        const success = Object.keys(errors).length === 0;
        return new Request(success, success ? null : errors);
    };

    submit = async () => {
        await this.setState({
            errors: {},
        });

        let validationResult: Request = this.validate();

        if (validationResult.success) {

            this.showAlert(strings.Questionnaire.submitText, null, [
                {
                    text: strings.Common.cancelButton,
                    style: 'cancel',
                    onPress: () => {

                    }
                },
                {
                    text: strings.Common.submitButton,
                    onPress: async () => {
                        this.setState({loading: true,});

                        await this.uploadImages();

                        let task: Task = this.state.task;
                        // if app shows this page from new activity then we need to add task
                        if (!task.id) {
                            //task.authoredOn = moment().toISOString();
                            let result: APIRequest = await this.api.addTask(task);
                            if (result.success)
                                task = result.data;
                            else {
                                this.showError(result.data);
                                this.setState({loading: false,});
                                return;
                            }
                        }

                        let result: APIRequest = await this.api.submitQuestionnaire(this.state.values, this.state.questionnaire, task.id);
                        if (result.success) {

                            task.status = Status.COMPLETED;
                            result = await this.api.updateTask(task);
                            if (result.success) {
                                const updateTask = this.props.navigation.getParam('updateTask', null);
                                updateTask && updateTask(task);
                                this.pop();
                            } else {
                                this.showError(result.data);
                                this.setState({loading: true,});
                            }
                        } else {
                            this.showError(result.data);
                            this.setState({loading: false,});
                        }
                    },
                }
            ]);
        } else {
            this.setState({
                index: 1,
                errors: validationResult.data,
            })
        }
    };

    getRequiredItemsIds() {
        return this.getAllItems().reduce((required, item) => {
            if (item.required) {
                required.push(item.link);
            }
            return required;
        }, []);
    }

    getAllItems() {
        let items = this.state.questionnaire.items;
        if (!items)
            return [];

        function getItemsFrom(item: QuestionnaireItem) {
            let subItems = [];
            subItems.push(item);
            if (item.items) {
                subItems = subItems.concat(item.items.map(item => getItemsFrom(item)).flat());
            }

            return subItems;
        }

        return items.map(item => getItemsFrom(item)).flat();
    }

    uploadImages = async () => {

        let imageItems = this.getAllItems().filter(item => item.type === 'url');

        for (const item of imageItems) {
            let files = this.state.values[item.link] || [];
            let uploadedFiles = [];
            for (let file of files) {
                if (file.indexOf('http') === -1) {
                    try {
                        // convert image
                        if (this.settings.imageQuality === 'medium') {
                            let response = await ImageResizer.createResizedImage(file, 1024, 1024, 'JPEG', 80);
                            file = Platform.OS === 'ios' ? response.uri.replace("file://", "") : "file://"+response.path;
                        }
                        if (this.settings.imageQuality === 'small') {
                            let response = await ImageResizer.createResizedImage(file, 768, 768, 'JPEG', 50);
                            file = Platform.OS === 'ios' ? response.uri.replace("file://", "") : "file://"+response.path;
                        }

                        // upload image
                        const name = await EAzureBlobStorageImage.uploadFile(file);
                        const link = `https://${this.imageStore}.blob.core.windows.net/blob1/` + name;
                        console.log(link);
                        uploadedFiles.push(link);
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    uploadedFiles.push(file);
                }
            }

            let values = this.state.values;
            if (uploadedFiles.length > 0)
                values[item.link] = uploadedFiles
            else
                delete values[item.link];

            await this.setState({
                values: values
            });
        }
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {

        const questionnaire: Questionnaire = this.state.questionnaire;

        return (
            <View style={commonStyles.screenContainer} >
                {questionnaire &&
                    <ScrollView style={{flex: 1}} bounces={false}>
                        <View style={{
                            flex: 1, margin: 10,
                            paddingBottom: 10, alignItems: 'center',
                            flexDirection: 'row', borderBottomWidth: 1
                        }}>
                            <Image source={require('../../../assets/icons/questionnaires/questionnaire.png')} style={{width: 48, height: 48}} />
                            <Text style={[commonStyles.questionnaireTitle, {marginHorizontal: 10, flex: 1}]}
                                  numberOfLines={2}>{questionnaire.name}</Text>
                        </View>
                        <QuestionnaireItemsView
                            items={questionnaire.items}
                            values={this.state.values}
                            errors={this.state.errors}
                            selectItem={this.selectItem}
                            valuesUpdate={(values) => this.setState({
                                values: values,
                            })}
                            simplified={this.getAllItems().filter(item => item.type !== 'group').length === 1}
                        />
                    </ScrollView>
                }
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    pageButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 20,
        paddingTop: 10,
    },

    pageButton: {
        borderWidth: 1,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: appColors.linkColor,
        borderRadius: 4,
    },

    pageText: {
        color: appColors.linkColor,
        fontSize: 20,
    },
});
