import moment from 'moment';

export class Patient {
    id: String;
    firstName: String;
    lastName: String;
    dateOfBirth: Date;
    gender: String;
    address: String;
    phone: String;

    get age(): Number {
        return moment().diff(this.dateOfBirth, 'years', false);
    }

    get fullName(): String {
        return `${this.firstName} ${this.lastName}`;
    }

    get simpleAddress(): String {
        if (!this.address) {return null}

        let result = [];

        result.push(this.address.line);
        result.push(this.address.city);
        result = result.filter(a => a);

        return result.length > 0 ? result.join(", ") : null;
    }
}
