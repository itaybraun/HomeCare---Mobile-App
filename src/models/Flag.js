import {BaseModel} from './BaseModel';

export class Flag extends BaseModel{
    id: Number;
    startDate: Date;
    endDate: Date;
    category: String;
    text: String;
    internal: boolean;
}
