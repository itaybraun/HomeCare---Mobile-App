import {Flag} from '../models/Flag';
import {Request} from '../support/Utils';
import {Patient} from '../models/Patient';
import {Visit} from '../models/Visit';
import {Task} from '../models/Task';

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



API.prototype.getPatients = async function getPatients(): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.getPatient = async function getPatient(patientId): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};



API.prototype.getPractitioner = async function getPractitioner(practitionerId): APIRequest {
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



API.prototype.getTasks = async function getTasks(userId): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.getTask = async function getTasks(taskId): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.updateTask = async function updateTask(task: Task): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};



API.prototype.getVisits = async function getVisits(patient: Patient): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.getVisit = async function addVisit(visitId): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.addVisit = async function addVisit(visit: Visit): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};
