import {Patient} from './Patient';
import {Practitioner} from './Practitioner';
import {BaseModel} from './BaseModel';
import {Visit} from './Visit';

export class Task extends BaseModel {
    id: String;
    openDate: Date;
    text: String;
    schedule: Date;
    priority: Priorities;

    patientId: String;
    patient: Patient;

    requesterId: String;
    requester: Practitioner;

    performerIds: [String];
    performers: [Practitioner];

    visitId: String;
    visit: Visit;

    get isPriorityImportant(): Boolean {
        return [
            Priorities.ASAP,
            Priorities.URGENT,
            Priorities.STAT
        ].indexOf(this.priority) > -1;
    }
}

export const Priorities = {
    ROUTINE: 'routine',
    URGENT: 'urgent',
    ASAP: 'asap',
    STAT: 'stat',

    getAll() {
        return [
            Priorities.ROUTINE,
            Priorities.URGENT,
            Priorities.ASAP,
            Priorities.STAT
        ]
    },

    getByString(string): Priorities {
        return this.getAll().find(p => p === string);
    }
};
