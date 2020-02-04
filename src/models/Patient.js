import moment from 'moment';

export class Patient {
    id: String;
    firstName: String;
    lastName: String;
    dateOfBirth: Date;
    gender: String;

    get age() {
        return moment().diff(this.dateOfBirth, 'years', false);
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}
