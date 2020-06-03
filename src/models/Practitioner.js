import {Person} from './Person';

export class Practitioner extends Person {
    role: String = 'nurse';
    license: String = null;
    patientsIds: [String] = [];
}

export class Organization {
    id: String;
    fullName: String;
}
