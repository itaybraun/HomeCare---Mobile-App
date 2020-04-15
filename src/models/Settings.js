import {BaseModel} from './BaseModel';

export class Settings extends BaseModel {
    constructor(obj) {
        super();
        obj && Object.assign(this, obj);
    }
    qaMode: boolean = false;
    imageQuality: String = 'medium';
    email: String = 'user@company.com';
}
