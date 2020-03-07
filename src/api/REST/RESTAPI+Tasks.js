import {APIRequest} from '../API';
import {Patient} from '../../models/Patient';
import moment from 'moment';
import {Priorities, Task} from '../../models/Task';
import {Practitioner} from '../../models/Practitioner';
import RESTAPI from './RESTAPI';
import {getPatientFromJson} from './RESTAPI+Patients';
import {getPractitionerFromJSON} from './RESTAPI+Practitioners';
import {getVisitFromJson} from './RESTAPI+Visits';

//------------------------------------------------------------
// Tasks
//------------------------------------------------------------

RESTAPI.prototype.getTasks = async function getTasks(patientId): APIRequest {
    try {

        let params = {};
        let url = 'ServiceRequest';
        if (patientId) {
            params.subject = patientId;
            url += `/?subject=Patient/${patientId}`;
        } else {
            params.performer = this.userId;
            params.active = true;
        }
        params.pageLimit = 0;
        params.flat = true;
        params.resolveReferences = ["subject", "requester", "performer.0", "encounter"];

        const result = await this.server.request(this.createUrl(url), params);
        console.log(result);
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
        params.resolveReferences = ["subject", "requester", "performer.0", "encounter"];
        const result = await this.server.request(this.createUrl(url), params);
        console.log(result);
        const task = getTaskFromJson(result);

        return new APIRequest(true, task);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.updateTask = async function updateTask(task: Task): APIRequest {
    try {
        const data = getJsonFromTask(task);
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
    task.performerId = json.performer?.id || null;
    task.performers = json.performer ? getPractitionerFromJSON(json.performer) : null;
    task.visitId = json.encounter?.id || null;
    task.visit = json.encounter ? getVisitFromJson(json.encounter) : null
    //task.openDate = json.occurrenceDateTime ? moment(json.occurrenceDateTime).toDate() : null;
    task.openDate = json.meta?.lastUpdated ? moment(json.meta?.lastUpdated).toDate() : null;
    task.text = json.code?.text;
    // TODO: I don't like this priority thing...
    task.priority = json.priority ? Priorities.getByString(json.priority) || Priorities.ROUTINE : Priorities.ROUTINE;
    return task;
}

export function getJsonFromTask(task: Task) {
    const data = {
        resourceType: "ServiceRequest",
        id: task.id,
        status: "active",
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
        encounter: {
            reference: "Encounter/" + task.visit.id,
        },
        performer: {
            reference: 'Practitioner/' + task.performerId,
        }
    };

    data.performer = task.performerIds?.map(id => {
        return {
            reference: 'Practitioner/' + id,
        }
    });

    return data;
}
