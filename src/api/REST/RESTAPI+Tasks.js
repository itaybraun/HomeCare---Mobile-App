import moment from 'moment';
import {Priority, Status, Task} from '../../models/Task';
import RESTAPI from './RESTAPI';
import APIRequest from '../../models/APIRequest';

//------------------------------------------------------------
// Tasks
//------------------------------------------------------------

RESTAPI.prototype.getTasks = async function getTasks(patientId, statuses: [Status] = null): APIRequest {

    await this.updateCurrentUser();

    try {

        let params = {};
        let url = 'ServiceRequest';
        if (patientId) {
            params.subject = patientId;
        } else if (this.user) {
            //params.subject = this.user.patientsIds?.join(',');
            params.performer = this.user.id;
        }
        if (Array.isArray(statuses) && statuses.length > 0)
            params.status = statuses.join();
        let fhirOptions = {};
        fhirOptions.pageLimit = 0;
        fhirOptions.flat = true;
        fhirOptions.resolveReferences = ["subject", "requester", "performer.0", "encounter", "basedOn.0"];

        const result = await this.callServer(this.createUrl(url, params), fhirOptions);
        console.log('getTasks', result);
        let tasks = result.map(json => this.getTaskFromJson(json)) || [];

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
        const result = await this.callServer(this.createUrl(url), params);
        console.log('getTask', result);
        const task = this.getTaskFromJson(result);

        return new APIRequest(true, task);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.addTask = async function addTask(task: Task): APIRequest {
    try {
        const data = this.getJsonFromTask(task);
        const result = await this.server.create(data);
        console.log('addTask', result);
        task = this.getTaskFromJson(result);
        return this.getTask(task.id);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.updateTask = async function updateTask(task: Task): APIRequest {
    try {
        const data = this.getJsonFromTask(task);
        console.log(data);
        const result = await this.server.update(data);
        task = this.getTaskFromJson(result);
        return new APIRequest(true, task);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.deleteTask = async function deleteTask(task: Task): APIRequest {
    try {
        const result = await this.server.delete('ServiceRequest/' + task.id);
        console.log('deleteTask', result);
        return new APIRequest(true);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getTaskFromJson = function getTaskFromJson(json): Task {
    let task = new Task();
    task.id = json.id;
    task.patientId = json.subject?.id || null;
    task.patient = json.subject ? this.getPatientFromJson(json.subject) : null;
    task.requesterId = json.requester?.id || null;
    if (json.requester) {
        if (json.requester.resourceType === 'Practitioner') {
            task.requester = this.getPractitionerFromJSON(json.requester);
        } else if (json.requester.resourceType === 'Organization') {
            task.requester = this.getOrganizationFromJSON(json.requester);
        }
    }
    //task.requester = json.requester ? this.getPractitionerFromJSON(json.requester) : null;
    task.performerId = json.performer?.[0]?.id || null;
    task.performer = json.performer?.[0] ? this.getPractitionerFromJSON(json.performer[0]) : null;
    task.visitId = json.encounter?.id || null;
    task.visit = json.encounter ? this.getVisitFromJson(json.encounter) : null;
    //task.openDate = json.occurrenceDateTime ? moment(json.occurrenceDateTime).toDate() : null;
    task.openDate = json.meta?.lastUpdated ? moment(json.meta?.lastUpdated).toDate() : null;
    task.executionDate = json.meta?.lastUpdated ? moment(json.meta?.lastUpdated).toDate() : null;
    task.text = json.code?.text;
    // TODO: I don't like this priority thing...
    task.priority = json.priority ? Priority.getByString(json.priority) || Priority.ROUTINE : Priority.ROUTINE;
    task.activityId = json.basedOn?.[0]?.id;
    task.activity = json.basedOn?.[0] ? this.getActivityFromJson(json.basedOn?.[0]) : null;
    task.status = json.status ? Status.getByString(json.status) || Status.UNKNOWN : Status.UNKNOWN;
    task.supportingInfo = json.reasonReference?.map(reference => reference.reference);
    task.notes = json.note?.[0]?.text;
    task.patientInstruction = json.patientInstruction;
    task.details = json.orderDetail?.[0]?.text;
    return task;
};

RESTAPI.prototype.getJsonFromTask = function getJsonFromTask(task: Task) {
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
};
