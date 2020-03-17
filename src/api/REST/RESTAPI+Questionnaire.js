import {API, APIRequest} from '../API';
import RESTAPI from './RESTAPI';
import {Questionnaire, QuestionnaireChoiceOption, QuestionnaireItem} from '../../models/Questionnaire';
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

RESTAPI.prototype.submitQuestionnaire = async function submitQuestionnaire(answers: Object, questionnaire: Questionnaire): APIRequest {
    try {
        const data = getJsonFromAnswers(answers, questionnaire);
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

export function getQuestionnaireFromJson(json) {
    let questionnaire = new Questionnaire();
    questionnaire.id = json.id;
    questionnaire.name = json.name;

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

function getJsonFromAnswers(answers: Object, questionnaire: Questionnaire, authorId: String) {
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
        }

        return object;
    }

    data.item = questionnaire.items.map(item => getItemAnswer(item));
    data.author = API.user ? {reference: "Practitioner/"+API.user.id} : null;

    return data;
}

export function getActivityFromJson(json) {
    let activity = new Activity();

    activity.id = json.id;
    activity.text = json.description;
    activity.questionnaireId = json.relatedArtifact?.[0]?.resource?.replace('Questionnaire/', '') || null;

    return activity;
}
