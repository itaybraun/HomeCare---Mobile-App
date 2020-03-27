import {API, APIRequest} from '../API';
import RESTAPI from './RESTAPI';
import {
    Questionnaire,
    QuestionnaireChoiceOption,
    QuestionnaireItem,
    QuestionnaireResponse,
} from '../../models/Questionnaire';
import {Activity} from '../../models/Activity';

//------------------------------------------------------------
// Login
//------------------------------------------------------------


RESTAPI.prototype.getQuestionnaire = async function getQuestionnaire(id: String): APIRequest {
    try {
        let params = {};
        let url = 'Questionnaire/'+id;
        params.flat = true;
        params.resolveReferences = [];
        const result = await this.server.request(this.createUrl(url), params);
        console.log('getQuestionnaire', result);
        const questionnaire = getQuestionnaireFromJson(result);

        console.log(questionnaire);
        return new APIRequest(true, questionnaire);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.submitQuestionnaire = async function submitQuestionnaire(answers: Object, questionnaire: Questionnaire, taskId: String): APIRequest {
    try {
        const data = getJsonFromAnswers(answers, questionnaire, taskId);
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
        fhirOptions.flat = true;
        const result = await this.server.request(this.createUrl(url, params), fhirOptions);
        console.log('getActivities', result);
        let activities = result.map(json => getActivityFromJson(json)) || [];

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
        } else if (API.user) {
            //url += '?performer=' + API.user.id;
        }
        let fhirOptions = {};
        fhirOptions.pageLimit = 0;
        fhirOptions.flat = true;
        const result = await this.server.request(this.createUrl(url, params), fhirOptions);
        console.log(result);
        let responses = result.map(json => getQuestionnaireResponseFromJson(json));
        console.log('getQuestionnaireResponses', responses);
        return new APIRequest(true, responses);

    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getQuestionnaireResponse = async function getQuestionnaireResponse(taskId: String): APIRequest {
    try {
        let params = {};
        let url = 'QuestionnaireResponse/3539bb23-2f4d-45a1-80c8-5b6515e060c3';
        let fhirOptions = {};
        fhirOptions.flat = true;
        const result = await this.server.request(this.createUrl(url, params), fhirOptions);
        let response = getQuestionnaireResponseFromJson(result);
        console.log('getQuestionnaireResponse', response);
        return new APIRequest(true, response);

    } catch (error) {
        return new APIRequest(false, error);
    }
};

export function getQuestionnaireFromJson(json) {
    let questionnaire = new Questionnaire();
    questionnaire.id = json.id;
    questionnaire.name = json.title;

    if (json.item)
        questionnaire.items = json.item.map(json => getItemFromJson(json));

    return questionnaire;
}

function getItemFromJson(json) {
    let item = new QuestionnaireItem();
    if (json.item)
        item.items = json.item.map(json => getItemFromJson(json));
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
}

export function getQuestionnaireResponseFromJson(json) {
    let response = new QuestionnaireResponse();
    response.id = json.id;
    response.taskId = json.basedOn?.[0]?.reference?.replace('ServiceRequest/', '') || null;
    if (json.item) {
        response.items = json.item.map(json => getResponseItemFromJson(json));
    }

    return response;
}

function getResponseItemFromJson(json) {
    let item = new QuestionnaireItem();
    if (json.item)
        item.items = json.item.map(json => getResponseItemFromJson(json));
    item.link = json.linkId;
    item.text = json.text;
    item.type = 'group';
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

    return item;
}

function getJsonFromAnswers(answers: Object, questionnaire: Questionnaire, taskId: String) {
    let data = {
        resourceType: "QuestionnaireResponse",
        questionnaire: "Questionnaire/" + questionnaire.id,
        status: "completed",
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

                object.answer = [{
                    valueCoding: {
                        system: answer.system,
                        code: answer.id,
                        display: answer.text,
                    }
                }];
                break;
            case 'boolean':
                object.answer = [{
                    valueBoolean: answers[item.link]
                }];
                break;
            case 'decimal':
                object.answer = [{
                    valueDecimal: answers[item.link]
                }];
                break;
            case 'string':
                object.answer = [{
                    valueString: answers[item.link]
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
    data.author = API.user ? {reference: "Practitioner/"+API.user.id} : null;
    data.basedOn = taskId ? {reference: "ServiceRequest/" + taskId} : null;

    return data;
}

export function getActivityFromJson(json) {
    let activity = new Activity();

    activity.id = json.id;
    activity.text = json.description;
    activity.questionnaireId = json.relatedArtifact?.[0]?.resource?.replace('Questionnaire/', '') || null;

    return activity;
}
