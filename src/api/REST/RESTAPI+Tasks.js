import {APIRequest, API} from '../API';
import {Patient} from '../../models/Patient';
import moment from 'moment';
import {Priority, Status, Task} from '../../models/Task';
import {Practitioner} from '../../models/Practitioner';
import RESTAPI from './RESTAPI';
import {getPatientFromJson} from './RESTAPI+Patients';
import {getPractitionerFromJSON} from './RESTAPI+Practitioners';
import {getVisitFromJson} from './RESTAPI+Visits';

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
    task.performerId = API.user?.id;//json.performer?.id || null;
    task.performer = API.user;//json.performer ? getPractitionerFromJSON(json.performer) : null;
    task.visitId = json.encounter?.id || null;
    task.visit = json.encounter ? getVisitFromJson(json.encounter) : null
    //task.openDate = json.occurrenceDateTime ? moment(json.occurrenceDateTime).toDate() : null;
    task.openDate = json.meta?.lastUpdated ? moment(json.meta?.lastUpdated).toDate() : null;
    task.text = json.code?.text;
    // TODO: I don't like this priority thing...
    task.priority = json.priority ? Priority.getByString(json.priority) || Priority.ROUTINE : Priority.ROUTINE;
    task.questionnaireId = json.basedOn?.[0].relatedArtifact?.[0].resource?.replace('Questionnaire/', '') || null;
    task.status = json.status ? Status.getByString(json.status) || Status.UNKNOWN : Status.UNKNOWN;
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
