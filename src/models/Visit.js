import {Patient} from './Patient';

export class Visit {
    id: Number;
    start: Date;
    end: Date;
    patientId: String;
    patient: Patient;
    reason: String;
}
