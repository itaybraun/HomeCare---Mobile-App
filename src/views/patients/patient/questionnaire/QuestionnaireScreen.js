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
import {appColors, commonStyles, renderLoading} from '../../../../support/CommonStyles';
import {APIRequest} from '../../../../api/API';
import {Questionnaire, QuestionnaireItem} from '../../../../models/Questionnaire';
import {Task} from '../../../../models/Task';
import {strings} from '../../../../localization/strings';
import QuestionnaireItemsView from './QuestionnaireItemsView';
import {Content, Button} from 'native-base';
import {Request} from '../../../../support/Utils';

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
        selectedPageIndex: 0,
        values: {},
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        const task: Task =  this.props.navigation.getParam('task', null);
        if (task && task.questionnaireId) {
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

        let result: APIRequest = await this.api.getQuestionnaire(task.questionnaireId);
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
        let success = true;

        const requiredItems = this.getRequiredItems();
        for (const link of requiredItems) {
            if (!this.state.values.hasOwnProperty(link)) {
                success = false;
                break;
            }
        }

        return new Request(success, null);
    };

    submit = async () => {
        let validationResult: Request = this.validate();

        if (validationResult.success) {

            let result: APIRequest = await this.api.submitQuestionnaire(this.state.values, this.state.questionnaire);
            if (result.success) {
                this.pop();
            } else {
                this.showError(result.data);
            }
        } else {
            this.showAlert('Not all required questions answered!')
        }
    };

    getRequiredItems() {
        let items = this.state.questionnaire.items;
        if (!items)
            return [];

        function checkItem(item: QuestionnaireItem) {
            let req = [];
            if (item.items) {
                req = item.items.map(item => checkItem(item)).flat()
            }

            if (item.required)
                req.push(item.link);

            return req;
        }

        return items.map(item => checkItem(item)).flat();
    }

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderPage = () => {
        switch (this.state.selectedPageIndex) {
            case 0:
                return this.renderPage1();
            case 1:
                return this.renderPage2();
            case 2:
                return this.renderPage3();
            case 3:
                return this.renderPage4();
        }
    };

    renderPage1 = () => {

        const task: Task = this.state.task;

        if (!task) {
            return null;
        }

        return (
            <View>
                <View style={commonStyles.pinkHeader}>
                    <Text style={commonStyles.pinkHeaderText}>{strings.Questionnaire.general}</Text>
                </View>
                <View style={{paddingHorizontal: 20, paddingVertical: 10,}}>
                    <Text style={commonStyles.infoText}>{strings.Questionnaire.basedOnTask}:</Text>
                    <Text style={[commonStyles.titleText, {marginTop: 3, fontWeight: 'bold'}]}>{task.text}</Text>

                    <Text style={[commonStyles.infoText, {marginTop: 10,}]}>{strings.Questionnaire.patient}:</Text>
                    <Text style={[commonStyles.titleText, {marginTop: 3, fontWeight: 'bold'}]}>{task.patient?.fullName}</Text>

                    <Text style={[commonStyles.infoText, {marginTop: 10,}]}>{strings.Questionnaire.practitioner}:</Text>
                    <Text style={[commonStyles.titleText, {marginTop: 3, fontWeight: 'bold'}]}>{task.performer?.fullName}</Text>
                </View>
            </View>
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
            <View>
                <View style={commonStyles.pinkHeader}>
                    <Text style={commonStyles.pinkHeaderText}>{strings.Questionnaire.submit}</Text>
                </View>
                <Text style={{textAlign: 'center', marginTop: 30, fontSize: 18,}}>{strings.Questionnaire.submitText}</Text>
                <Button block
                        style={{backgroundColor: appColors.pinkColor, width: 120, alignSelf: 'center', marginTop: 100}}
                        onPress={this.submit}>
                    <Text style={{color: '#FFFFFF', fontWeight: 'bold'}}>{strings.Common.submitButton?.toUpperCase()}</Text>
                </Button>
            </View>
        )
    };

    renderPage4 = () => {
        return (
            <View>
                <Text>4</Text>
            </View>
        )
    };

    renderButton = (index) => {

        const selected = index === this.state.selectedPageIndex;

        return (
            <TouchableOpacity key={index} style={[styles.pageButton, {backgroundColor: selected ? '#CDB9E9' : '#FFFFFF'}]}
                onPress={() => this.setState({
                    selectedPageIndex: index,
                })}
            >
                <Text style={styles.pageText}>{index + 1}</Text>
            </TouchableOpacity>
        )
    };

    render() {
        return (
            <View style={commonStyles.screenContainer} >
                <Content enableResetScrollToCoords={false}>
                    {this.renderPage()}
                </Content>
                <View style={styles.pageButtonsContainer}>
                    {
                        Array.from({length: 3},((_, i) => this.renderButton(i)))
                    }
                </View>
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
    },
});
