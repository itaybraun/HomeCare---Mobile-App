import {Patient} from './Patient';
import {Practitioner} from './Practitioner';
import {BaseModel} from './BaseModel';
import {Visit} from './Visit';
import {Activity} from './Activity';

export class Task extends BaseModel {
    id: String;
    openDate: Date;
    text: String;
    schedule: Date;
    priority: Priority;
    executionDate: Date;

    patientId: String;
    patient: Patient;

    requesterId: String;
    requester: Practitioner;

    performerId: String;
    performer: Practitioner;

    visitId: String;
    visit: Visit;

    activityId: String;
    activity: Activity;

    status: Status;

    notes: String;

    get isPriorityImportant(): Boolean {
        return [
            Priority.ASAP,
            Priority.URGENT,
            Priority.STAT
        ].indexOf(this.priority) > -1;
    }
}

export const Priority = {
    ROUTINE: 'routine',
    URGENT: 'urgent',
    ASAP: 'asap',
    STAT: 'stat',

    getAll() {
        return [
            Priority.ROUTINE,
            Priority.URGENT,
            Priority.ASAP,
            Priority.STAT
        ]
    },

    getByString(string): Priority {
        return this.getAll().find(p => p === string);
    }
};

export const Status = {
    DRAFT: 'draft',
    ACTIVE: 'active',
    ON_HOLD: 'on-hold',
    REVOKED: 'revoked',
    COMPLETED: 'completed',
    ERROR: 'entered-in-error',
    UNKNOWN: 'unknown',

    getAll() {
        return [
            Status.DRAFT,
            Status.ACTIVE,
            Status.ON_HOLD,
            Status.REVOKED,
            Status.COMPLETED,
            Status.ERROR,
            Status.UNKNOWN
        ]
    },

    getByString(string): Status {
        return this.getAll().find(p => p === string);
    }
};
