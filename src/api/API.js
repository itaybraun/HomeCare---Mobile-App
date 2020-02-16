import {Flag} from '../models/Flag';
import {Request} from '../support/Utils';
import {Patient} from '../models/Patient';

export class API {
    constructor(){

    }
}

export class APIRequest extends Request {

    constructor(success, data = null) {
        super(success, data)
    }

    toString = () => {
        return `Request success is ${this.success}, data is ${this.data}`;
    }
}

API.prototype.login = async function login(username, password): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.getPatients = async function getPatients(userId): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.getFlags = async function getFlags(patientId): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.addFlag = async function addFlag(flag: Flag, patient: Patient): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.deleteFlag = async function deleteFlag(flag: Flag): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};
