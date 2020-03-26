import {APIRequest, API} from '../API';
import moment from 'moment';
import {Priority, Status, Task} from '../../models/Task';
import RESTAPI from './RESTAPI';
import {getPatientFromJson} from './RESTAPI+Patients';
import {getPractitionerFromJSON} from './RESTAPI+Practitioners';
import {getVisitFromJson} from './RESTAPI+Visits';
import {getActivityFromJson} from './RESTAPI+Questionnaire';

//------------------------------------------------------------
// Tasks
//------------------------------------------------------------

RESTAPI.prototype.getTasks = async function getTasks(patientId, statuses: [Status] = null): APIRequest {
    try {

        let params = {};
        let url = 'ServiceRequest';
        if (patientId) {
            params.subject = patientId;
        } else if (API.user) {
            //url += '?performer=' + API.user.id;
        }
        if (Array.isArray(statuses) && statuses.length > 0)
            params.status = statuses.join();
        let fhirOptions = {};
        fhirOptions.pageLimit = 0;
        fhirOptions.flat = true;
        fhirOptions.resolveReferences = ["subject", "requester", "performer.0", "encounter", "basedOn.0"];

        const result = await this.server.request(this.createUrl(url, params), fhirOptions);
        console.log('getTasks', result);
        let tasks = result.map(json => getTaskFromJson(json)) || [];

        return new APIRequest(true, tasks);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getTask = async function getTask(taskId): APIRequest {
    try {
        let params = {};
        let url = 'ServiceRequest/'+taskId;
        params.flat = true;
        params.resolveReferences = ["subject", "requester", "performer.0", "encounter", "basedOn.0"];
        const result = await this.server.request(this.createUrl(url), params);
        console.log('getTask', result);
        const task = getTaskFromJson(result);

        return new APIRequest(true, task);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.addTask = async function addTask(task: Task): APIRequest {
    try {
        const data = getJsonFromTask(task);
        const result = await this.server.create(data);
        console.log('addTask', result);
        task = getTaskFromJson(result);
        return new APIRequest(true, task);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.updateTask = async function updateTask(task: Task): APIRequest {
    try {
        const data = getJsonFromTask(task);
        console.log(data);
        const result = await this.server.update(data);
        task = getTaskFromJson(result);
        return new APIRequest(true, task);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

export function getTaskFromJson(json) {
    let task = new Task();
    task.id = json.id;
    task.patientId = json.subject?.id || null;
    task.patient = json.subject ? getPatientFromJson(json.subject) : null;
    task.requesterId = json.requester?.id || null;
    task.requester = json.requester ? getPractitionerFromJSON(json.requester) : null;
    task.performerId = API.user?.id;//json.performer?.id || null;
    task.performer = API.user;//json.performer ? getPractitionerFromJSON(json.performer) : null;
    task.visitId = json.encounter?.id || null;
    task.visit = json.encounter ? getVisitFromJson(json.encounter) : null
    //task.openDate = json.occurrenceDateTime ? moment(json.occurrenceDateTime).toDate() : null;
    task.openDate = json.meta?.lastUpdated ? moment(json.meta?.lastUpdated).toDate() : null;
    task.executionDate = json.meta?.lastUpdated ? moment(json.meta?.lastUpdated).toDate() : null;
    task.text = json.code?.text;
    // TODO: I don't like this priority thing...
    task.priority = json.priority ? Priority.getByString(json.priority) || Priority.ROUTINE : Priority.ROUTINE;
    task.activityId = json.basedOn?.[0]?.id;
    task.activity = json.basedOn?.[0] ? getActivityFromJson(json.basedOn?.[0]) : null;
    task.status = json.status ? Status.getByString(json.status) || Status.UNKNOWN : Status.UNKNOWN;
    return task;
}

export function getJsonFromTask(task: Task) {
    const data = {
        resourceType: "ServiceRequest",
        id: task.id,
        status: task.status,
        intent: "original-order",
        priority: task.priority,
        code: {
            coding: [
                {
                    system: "http://loinc.org",
                    code: "51990-0"
                }
            ],
            text: task.text
        },
        subject: {
            reference: "Patient/" + task.patientId,
        },
        requester: {
            reference: "Practitioner/" + task.requesterId,
        },
        performer: {
            reference: 'Practitioner/' + task.performerId,
        }
    };

    if (task.activityId) {
        data.basedOn = [
            {
                "reference": "ActivityDefinition/" + task.activityId
            }
        ];
    }

    if (task.visit) {
        data.encounter = {
            reference: "Encounter/" + task.visit.id,
        };
    }

    return data;
}
