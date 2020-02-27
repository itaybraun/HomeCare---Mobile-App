import {APIRequest} from '../API';
import {Patient} from '../../models/Patient';
import moment from 'moment';
import {Priorities, Task} from '../../models/Task';
import {Practitioner} from '../../models/Practitioner';
import RESTAPI from './RESTAPI';

//------------------------------------------------------------
// Tasks
//------------------------------------------------------------

RESTAPI.prototype.getTasks = async function getTasks(userId): APIRequest {
    try {
        if (!userId) userId = this.userId;
        const response = await this.server.get('ServiceRequest', {
            params: {
                performer: userId
            },
        });
        if (response.status === 200) {
            let tasks = response.data.entry?.map(json => getTaskFromFHIR(json.resource)) ?? [];

            // get all needed patients
            const patientsIDs = tasks.map(task => task.patientId).filter((value, index, self) => self.indexOf(value) === index);
            let patients = await Promise.all(patientsIDs.map(async id => {
                    let result: APIRequest = await this.getPatient(id);
                    if (result.success)
                        return result.data;

                return null;
            }));
            patients = patients.filter(p => p);

            for (const task: Task of tasks) {
                if (task.patientId) {
                    task.patient = patients.find(patient => patient.id === task.patientId);
                }

                if (task.visitId) {
                    let result: APIRequest = await this.getVisit(task.visitId);
                    if (result.success)
                        task.visit = result.data;
                }
            }
            return new APIRequest(true, tasks);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getTask = async function getTasks(taskId): APIRequest {
    try {
        const response = await this.server.get('ServiceRequest/'+taskId, {
        });
        if (response.status === 200) {
            const task = getTaskFromFHIR(response.data);
            if (task.patientId) {
                let result: APIRequest = await this.getPatient(task.patientId);
                if (result.success)
                    task.patient = result.data;
            }
            if (task.requesterId) {
                let result: APIRequest = await this.getPractitioner(task.requesterId);
                if (result.success)
                    task.requester = result.data;
            }

            if (task.visitId) {
                let result: APIRequest = await this.getVisit(task.visitId);
                if (result.success) {
                    task.visit = result.data;
                }
            }

            return new APIRequest(true, task);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.updateTask = async function updateTask(task: Task): APIRequest {
    try {

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
                display: task.requester?.fullName,
            },
            encounter: {
                reference: "Encounter/" + task.visit.id,
            }
        };

        const response = await this.server.put('ServiceRequest/' + task.id, JSON.stringify(data));
        if (response.status === 200) {
            let task = getTaskFromFHIR(response.data);
            return new APIRequest(true, task);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};


function getTaskFromFHIR(json) {
    let task = new Task();
    task.id = json.id;
    task.patientId = json.subject?.reference?.replace('Patient/','') ?? null;
    task.patient = new Patient({fullName: json.subject?.display});
    task.requesterId = json.requester?.reference?.replace('Practitioner/','') ?? null;
    task.requester = new Practitioner({fullName: json.requester?.display});
    task.visitId = json.encounter?.reference?.replace('Encounter/','') ?? null;
    task.openDate = json.occurrenceDateTime ? moment(json.occurrenceDateTime).toDate() : null;
    task.text = json.code?.text;
    // TODO: I don't like this priority thing...
    task.priority = json.priority ? Priorities.getByString(json.priority) ?? Priorities.ROUTINE : Priorities.ROUTINE;
    return task;
}
