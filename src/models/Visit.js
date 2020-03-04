import {Patient} from './Patient';
import {BaseModel} from './BaseModel';

export class Visit extends BaseModel {
    id: Number;
    start: Date;
    end: Date;
    patientId: String;
    patient: Patient;
    reason: String;
    taskIds: [String];
}
