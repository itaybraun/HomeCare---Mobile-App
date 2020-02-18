import moment from 'moment';

export class Task {
    id: String;
    patientId: String;
    openDate: Date;
    text: String;
    patientInfo: String;
    schedule: Date;
    priority: String;
}
