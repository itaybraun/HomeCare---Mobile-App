import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Keyboard, TouchableWithoutFeedback, Alert,
} from 'react-native';
import AppScreen from '../../../../support/AppScreen';
import {appColors, commonStyles, renderLoading, renderTabBar} from '../../../../support/CommonStyles';
import {APIRequest} from '../../../../api/API';
import {Questionnaire, QuestionnaireItem} from '../../../../models/Questionnaire';
import {Status, Task} from '../../../../models/Task';
import {strings} from '../../../../localization/strings';
import QuestionnaireItemsView from './QuestionnaireItemsView';
import {Content, Button} from 'native-base';
import {Request} from '../../../../support/Utils';
import {TabView} from 'react-native-tab-view';
import {EAzureBlobStorageImage} from 'react-native-azure-blob-storage';

export default class QuestionnaireScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.state.params.title,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        questionnaire: null,
        task: null,
        index: 0,
        routes: [
            { key: '1', title: "1" },
            { key: '2', title: "2" },
            { key: '3', title: "3" },
        ],
        values: {},
        errors: {},
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();

        EAzureBlobStorageImage.configure(
            "fhir1imagestore",
            "47+vv7jGM8gpHJGspmgveOwI8hNCQKC9uJ2Rynq7F6wdqnZvdivg5BJQuyZYk75gOnlPvFd9oVuuG2/eMRCscw==",
            "blob1"
        );
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
            this.props.navigation.setParams({title: questionnaire.name})
            return {questionnaire: questionnaire};
        } else {
            this.showError(result.data);
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

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
            this.setState({loading: true,});
            //await this.uploadImages();

            let result: APIRequest = await this.api.submitQuestionnaire(this.state.values, this.state.questionnaire);
            if (result.success) {
                let task: Task = this.state.task;
                task.status = Status.COMPLETED;
                result = await this.api.updateTask(task);
                if (result.success) {
                    const refresh = this.props.navigation.getParam('refresh', null);
                    refresh && refresh();
                    this.pop();
                } else {
                    this.showError(result.data);
                    this.setState({loading: true,});
                }
            } else {
                this.showError(result.data);
                this.setState({loading: true,});
            }
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

    handleTabIndexChange = index => {
        this.setState({ index });
    };

    uploadImages = async () => {
        let imageItems = this.getAllItems().filter(item => item.type === 'url');
        for (const item of imageItems) {
            let files = this.state.values[item.link] || [];
            for (const file of files) {
                try {
                    const name = await EAzureBlobStorageImage.uploadFile(file)
                    console.log("Container File Name", name)
                } catch(error) {
                    console.log(error);
                }
            }

        }


    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderTabBar = (props) => {

        return (
            <View style={styles.pageButtonsContainer}>
                {
                    props.navigationState.routes.map((route, i) => {

                        const selected = this.state.index === i;

                        return (
                            <TouchableOpacity
                                activeOpacity={1}
                                key={route.key}
                                style={[styles.pageButton, {backgroundColor: selected ? '#CDB9E9' : '#FFFFFF'}]}
                                onPress={() => this.setState({index: i})}>
                                <Text style={styles.pageText}>{route.title}</Text>
                            </TouchableOpacity>
                        );
                    })
                }
            </View>
        );
    };

    renderScene = ({ route }) => {
        switch (route.key) {
            case '1':
                return this.renderPage1();
            case '2':
                return this.renderPage2();
            case '3':
                return this.renderPage3();
            default:
                return null;
        }
    };

    renderPage1 = () => {

        const task: Task = this.state.task;

        if (!task) {
            return null;
        }

        return (
            <Content enableResetScrollToCoords={false} bounces={false}>
                <View style={commonStyles.pinkHeader}>
                    <Text style={commonStyles.pinkHeaderText}>{strings.Questionnaire.general}</Text>
                </View>
                <View style={{paddingHorizontal: 20, paddingVertical: 10,}}>
                    <Text style={commonStyles.infoText}>{strings.Questionnaire.basedOnTask}:</Text>
                    <Text style={[commonStyles.titleText, {marginTop: 3}]}>{task.text}</Text>

                    <Text style={[commonStyles.infoText, {marginTop: 10,}]}>{strings.Questionnaire.patient}:</Text>
                    <Text style={[commonStyles.titleText, {marginTop: 3}]}>{task.patient?.fullName}</Text>

                    <Text style={[commonStyles.infoText, {marginTop: 10,}]}>{strings.Questionnaire.practitioner}:</Text>
                    <Text style={[commonStyles.titleText, {marginTop: 3}]}>{task.performer?.fullName}</Text>
                </View>
            </Content>
        )
    };

    renderPage2 = () => {

        let questionnaire: Questionnaire = this.state.questionnaire;
        if (!questionnaire) {
            return null;
        }

        return (
            <QuestionnaireItemsView
                items={questionnaire.items}
                values={this.state.values}
                errors={this.state.errors}
                valuesUpdate={(values) => this.setState({
                    values: values,
                })}
            />
        )
    };

    renderPage3 = () => {
        let questionnaire: Questionnaire = this.state.questionnaire;
        if (!questionnaire) {
            return null;
        }

        return (
            <Content enableResetScrollToCoords={false} bounces={false}>
                <View style={commonStyles.pinkHeader}>
                    <Text style={commonStyles.pinkHeaderText}>{strings.Questionnaire.submit}</Text>
                </View>
                <Text style={[commonStyles.contentText, {textAlign: 'center', marginTop: 30,}]}>{strings.Questionnaire.submitText}</Text>
                <Button block
                        style={{backgroundColor: appColors.pinkColor, width: 120, alignSelf: 'center', marginTop: 100}}
                        onPress={this.submit}>
                    <Text style={{color: '#FFFFFF', fontWeight: 'bold'}}>{strings.Common.submitButton?.toUpperCase()}</Text>
                </Button>
            </Content>
        )
    };

    render() {
        return (
            <View style={commonStyles.screenContainer} >
                <TabView
                    navigationState={this.state}
                    onIndexChange={this.handleTabIndexChange}
                    renderScene={this.renderScene}
                    renderTabBar={this.renderTabBar}
                    tabBarPosition="bottom"
                />
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
