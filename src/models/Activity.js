import {BaseModel} from './BaseModel';

export class Activity extends BaseModel {
    id: String;
    text: String;

    questionnaireId: String;
}
