import {BaseModel} from './BaseModel';
import {Patient} from './Patient';
import {Practitioner} from './Practitioner';
import {Person} from './Person';

export class Condition extends BaseModel {
    id: Number;
    text: String;
    status: ClinicalStatus;
    lastUpdate: Date;
    patientId: String;
    patient: Patient;
    recordedDate: Date;
    recorderId: String;
    recorder: Person;
    severity: Severity;
    bodySite: String;
    notes: [ConditionNote];
    images: [String];
}

export const Severity = {
    SEVERE: 'Severe',
    MODERATE: 'Moderate',
    MILD: 'Mild',

    getAll() {
        return [
            Severity.SEVERE,
            Severity.MODERATE,
            Severity.MILD,
        ]
    },

    getByString(string): Severity {
        return this.getAll().find(p => p === string);
    },

    getCode(severity: Severity) {
        switch (severity) {
            case Severity.SEVERE:
                return '24484000';
            case Severity.MODERATE:
                return '6736007';
            case Severity.MILD:
                return '255604002'
        }
    }
};

export const ClinicalStatus = {
    ACTIVE: 'active',
    RECURRENCE: 'recurrence',
    RELAPSE: 'relapse',
    INACTIVE: 'inactive',
    REMISSION: 'remission',
    RESOLVED: 'resolved',

    getAll() {
        return [
            ClinicalStatus.ACTIVE,
            ClinicalStatus.RECURRENCE,
            ClinicalStatus.RELAPSE,
            ClinicalStatus.INACTIVE,
            ClinicalStatus.REMISSION,
            ClinicalStatus.RESOLVED,
        ]
    },

    getByString(string): Severity {
        return this.getAll().find(p => p === string);
    },
};

export class ConditionNote extends BaseModel {
    text: String;
    time: Date;
    authorId: String;
    authorName: String;
}
