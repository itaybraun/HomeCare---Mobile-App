import {BaseModel} from './BaseModel';
import {Patient} from './Patient';

export class Flag extends BaseModel{
    id: Number;
    lastUpdate: Date;
    startDate: Date;
    status: String;
    endDate: Date;
    category: String;
    text: String;
    internal: boolean;
    patientId: String;
    patient: Patient;
}
