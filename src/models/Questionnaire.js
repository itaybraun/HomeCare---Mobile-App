import {BaseModel} from './BaseModel';
import {Patient} from './Patient';

export class Questionnaire extends BaseModel {
    id: String;
    name: String;
    patient: Patient;
    items: [QuestionnaireItem];
}

export class QuestionnaireChoiceOption extends BaseModel {
    constructor(id, text, system) {
        super();
        this.id = id;
        this.text = text;
        this.system = system;
    }
    id: String;
    system: String;
    text: String;
}

export class QuestionnaireItem extends BaseModel {
    type: String;
    text: String;
    link: String;
    items: [QuestionnaireItem];
    required: Boolean;
    options: [QuestionnaireChoiceOption];
    answers: [Object];
}

export class QuestionnaireResponse extends BaseModel {
    id: String;
    taskId: String;
    items: [QuestionnaireItem];
}


