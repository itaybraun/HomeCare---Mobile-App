import RESTAPI from './RESTAPI';
import {
    Questionnaire,
    QuestionnaireChoiceOption,
    QuestionnaireItem,
    QuestionnaireResponse,
} from '../../models/Questionnaire';
import {Activity} from '../../models/Activity';
import moment from 'moment';
import APIRequest from '../../models/APIRequest';

//------------------------------------------------------------
// Login
//------------------------------------------------------------


RESTAPI.prototype.getQuestionnaire = async function getQuestionnaire(id: String): APIRequest {
    try {
        let params = {};
        let url = 'Questionnaire/'+id;
        params.flat = true;
        params.resolveReferences = [];
        const result = await this.callServer(this.createUrl(url), params);
        console.log('getQuestionnaire', result);
        const questionnaire = this.getQuestionnaireFromJson(result);

        console.log(questionnaire);
        return new APIRequest(true, questionnaire);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.submitQuestionnaire = async function submitQuestionnaire(answers: Object, questionnaire: Questionnaire, taskId: String): APIRequest {
    try {
        const data = this.getJsonFromAnswers(answers, questionnaire, taskId);
        console.log(data);
        const result = await this.server.create(data);
        console.log('submitQuestionnaire', result);
        return new APIRequest(true, null);
    } catch (error) {
        console.log(error);
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getActivities = async function getActivities(): APIRequest {
    try {
        let params = {};
        let url = 'ActivityDefinition';
        let fhirOptions = {};
        fhirOptions.pageLimit = 0;
        fhirOptions.flat = true;
        const result = await this.callServer(this.createUrl(url, params), fhirOptions);
        console.log('getActivities', result);
        let activities = result.map(json => this.getActivityFromJson(json)) || [];

        return new APIRequest(true, activities);
    } catch (error) {
        return new APIRequest(false, error);
    }
};


RESTAPI.prototype.getQuestionnaireResponses = async function getQuestionnaireResponses(patientId: String): APIRequest {
    try {
        let params = {};
        let url = 'QuestionnaireResponse';
        if (patientId) {
            params.subject = patientId;
        } else if (this.user) {
            //url += '?performer=' + API.user.id;
        }
        let fhirOptions = {};
        fhirOptions.pageLimit = 0;
        fhirOptions.flat = true;
        fhirOptions.resolveReferences = ["author"];
        const result = await this.callServer(this.createUrl(url, params), fhirOptions);
        console.log(result);
        let responses = result.map(json => this.getQuestionnaireResponseFromJson(json));
        console.log('getQuestionnaireResponses', responses);
        return new APIRequest(true, responses);

    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getQuestionnaireFromJson = function getQuestionnaireFromJson(json): Questionnaire {
    let questionnaire = new Questionnaire();
    questionnaire.id = json.id;
    questionnaire.name = json.title;

    if (json.item)
        questionnaire.items = json.item.map(json => this.getItemFromJson(json));

    return questionnaire;
};

RESTAPI.prototype.getItemFromJson = function getItemFromJson(json): QuestionnaireItem {
    let item = new QuestionnaireItem();
    if (json.item)
        item.items = json.item.map(json => this.getItemFromJson(json));
    item.link = json.linkId;
    item.type = json.type;
    item.text = json.text;
    item.required = json.required;
    if (json.answerOption)
        item.options = json.answerOption.map(option =>
            new QuestionnaireChoiceOption(
                option.valueCoding.code,
                option.valueCoding.display,
                option.valueCoding.system)
        );

    return item;
};

RESTAPI.prototype.getQuestionnaireResponseFromJson = function getQuestionnaireResponseFromJson(json): QuestionnaireResponse {
    let response = new QuestionnaireResponse();
    response.id = json.id;
    response.taskId = json.basedOn?.[0]?.reference?.replace('ServiceRequest/', '') || null;
    response.authorId = json.author?.id || null;
    response.author = json.author ? this.getPractitionerFromJSON(json.author) : null;
    if (json.item) {
        response.items = json.item.map(json => this.getResponseItemFromJson(json));
        response.items = response.items.filter(i => i);
    }

    return response;
};

RESTAPI.prototype.getResponseItemFromJson = function getResponseItemFromJson(json): QuestionnaireItem {
    let item = new QuestionnaireItem();
    if (json.item) {
        item.type = 'group';
        item.items = json.item.map(json => this.getResponseItemFromJson(json));
        item.items = item.items.filter(i => i);
    }

    item.link = json.linkId;
    item.text = json.text;

    if (json.answer) {
        item.answers = json.answer.map(answer => {
            if (answer.hasOwnProperty('valueCoding')) {
                item.type = 'choice';
                return answer.valueCoding.display;
            }
            if (answer.hasOwnProperty('valueBoolean')) {
                item.type = 'boolean';
                return answer.valueBoolean;
            }
            if (answer.hasOwnProperty('valueDecimal')) {
                item.type = 'decimal';
                return answer.valueDecimal;
            }
            if (answer.hasOwnProperty('valueString')) {
                item.type = 'string';
                return answer.valueString;
            }
            if (answer.hasOwnProperty('valueUri')) {
                item.type = 'url';
                return answer.valueUri;
            }
        });
    }

    if (!item.type)
        return null;

    return item;
};

RESTAPI.prototype.getActivityFromJson = function getActivityFromJson(json): Activity {
    let activity = new Activity();

    activity.id = json.id;
    activity.text = json.description;
    activity.questionnaireId = json.relatedArtifact?.[0]?.resource?.replace('Questionnaire/', '') || null;

    return activity;
};


RESTAPI.prototype.getJsonFromAnswers = function getJsonFromAnswers(answers: Object, questionnaire: Questionnaire, taskId: String) {
    let data = {
        resourceType: "QuestionnaireResponse",
        questionnaire: "Questionnaire/" + questionnaire.id,
        status: "completed",
        authored : moment().toISOString(true),
        subject: {
            reference: "Patient/" + questionnaire.patient.id,
        },
    };

    function getItemAnswer(item:QuestionnaireItem) {
        let object = {
            linkId: item.link,
            text: item.text,
        };

        switch (item.type) {
            case 'group':
                if (item.items)
                    object.item = item.items.map(item => getItemAnswer(item));
                break;
            case 'choice':

                const answer: QuestionnaireChoiceOption = answers[item.link];

                if (answer) {

                    object.answer = [{
                        valueCoding: {
                            system: answer.system,
                            code: answer.id,
                            display: answer.text,
                        }
                    }];
                } else {
                    object.answer = null;
                }
                break;
            case 'boolean':
                object.answer = [{
                    valueBoolean: answers[item.link] || null
                }];
                break;
            case 'decimal':
                object.answer = [{
                    valueDecimal: answers[item.link] || null
                }];
                break;
            case 'string':
                object.answer = [{
                    valueString: answers[item.link] || null
                }];
                break;
            case 'url':

                const result = (answers[item.link] || []).map(url => {
                    return {
                        valueUri: url
                    }
                });

                object.answer = result;
        }

        return object;
    }

    data.item = questionnaire.items.map(item => getItemAnswer(item));
    data.author = RESTAPI.user ? {reference: "Practitioner/"+RESTAPI.user.id} : null;
    data.basedOn = taskId ? {reference: "ServiceRequest/" + taskId} : null;

    return data;
};
