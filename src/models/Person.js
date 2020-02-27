import moment from 'moment';
import {BaseModel} from './BaseModel';

export class Person extends BaseModel {

    constructor({fullName} = {}) {
        super();
        this.fullName = fullName;
    }

    id: String;
    fullName: String;
    dateOfBirth: Date;
    gender: String;
    address: Address;
    phone: String;
    email: String;

    get age(): Number {
        return moment().diff(moment(this.dateOfBirth), 'years', false);
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
export class Address extends BaseModel {
    constructor({line, city, postalCode, country} = {}) {
        super();
        this.line = line;
        this.city = city;
        this.postalCode = postalCode;
        this.country = country;
    }
    line: String;
    city: String;
    postalCode: String;
    country: String;
}

