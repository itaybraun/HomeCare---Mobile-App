import {BaseModel} from './BaseModel';
import {Patient} from './Patient';

export class Flag extends BaseModel{
    id: Number;
    startDate: Date;
    endDate: Date;
    category: String;
    text: String;
    internal: boolean;
    patientId: String;
    patient: Patient;
}
