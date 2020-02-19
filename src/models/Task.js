import {Patient} from './Patient';

export class Task {
    id: String;
    patientId: String;
    patient: Patient;
    openDate: Date;
    text: String;
    schedule: Date;
    priority: Priorities;
    requester: String;

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
