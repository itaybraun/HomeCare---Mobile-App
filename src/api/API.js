import {Flag} from '../models/Flag';

export class API {
    constructor(){

    }
}

export class APIRequest {

    constructor(success, data = null) {
        this.data = data;
        this.success = success;
    }

    data: Object;
    success: boolean;

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

API.prototype.addFlag = async function addFlag(flag: Flag): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.deleteFlag = async function deleteFlag(flag: Flag): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};
