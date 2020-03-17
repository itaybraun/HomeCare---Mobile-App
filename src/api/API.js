import {Flag} from '../models/Flag';
import {Request} from '../support/Utils';
import {Visit} from '../models/Visit';
import {Task, Status} from '../models/Task';
import {Questionnaire} from '../models/Questionnaire';
import {Practitioner} from '../models/Practitioner';

export class API {
    constructor(){

    }

    static user: Practitioner;
    get user(): Practitioner {
        return API.user;
    }
    set user(user) {
        API.user = user;
    }

    static token: String;
    get token(): String {
        return API.token;
    }
    set token(token) {
        API.token = token;
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

API.prototype.setCurrentUser = async function setCurrentUser(identifier: String): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};


API.prototype.getPatients = async function getPatients(): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.getPatient = async function getPatient(patientId): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};



API.prototype.getPractitioners = async function getPractitioners(): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.getPractitioner = async function getPractitioner(practitionerId): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.getPractitionerByIdentifier = async function getPractitionerByIdentifier(identifier): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};



API.prototype.getFlags = async function getFlags(patientId): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.addFlag = async function addFlag(flag: Flag): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.editFlag = async function editFlag(flag: Flag): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.deleteFlag = async function deleteFlag(flag: Flag): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};



API.prototype.getTasks = async function getTasks(patientId, statuses: [Status] = []): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.getTask = async function getTask(taskId): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.addTask = async function addTask(task: Task): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.updateTask = async function updateTask(task: Task): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.getActivities = async function getActivities(): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};



API.prototype.getVisits = async function getVisits(patientId): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.getVisit = async function getVisit(visitId): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.addVisit = async function addVisit(visit: Visit): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.updateVisit = async function updateVisit(visit: Visit): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};



API.prototype.getQuestionnaire = async function getQuestionnaire(id: String): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};

API.prototype.submitQuestionnaire = async function submitQuestionnaire(answers: Object, questionnaire: Questionnaire): APIRequest {
    return new APIRequest(false, new Error(arguments.callee.name + ' not implemented!'));
};
