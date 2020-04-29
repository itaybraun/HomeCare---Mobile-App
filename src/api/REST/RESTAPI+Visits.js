import {API, APIRequest} from '../API';
import RESTAPI from './RESTAPI';
import {Patient} from '../../models/Patient';
import {Visit} from '../../models/Visit';
import moment from 'moment';
import {getPatientFromJson} from './RESTAPI+Patients';
import {getPractitionerFromJSON} from './RESTAPI+Practitioners';
import {getTaskFromJson} from './RESTAPI+Tasks';

//------------------------------------------------------------
// Visits
//------------------------------------------------------------


RESTAPI.prototype.getVisits = async function getVisits(patientId): APIRequest {

    await this.updateCurrentUser();

    try {
        let params = {};
        let url = 'Encounter';
        params.participant = this.user.id;
        if (patientId) {
            params.subject = patientId;
        } else {
            params.subject = this.user.patientsIds?.join(',');
        }
        let fhirOptions = {};
        fhirOptions.pageLimit = 0;
        fhirOptions.flat = true;
        fhirOptions.resolveReferences = ["subject", "basedOn"];
        const result = await this.callServer(this.createUrl(url, params), fhirOptions);
        console.log('getVisits', result);
        let visits = result.map(json => getVisitFromJson(json)) || [];
        return new APIRequest(true, visits);
    } catch (error) {
        console.log(error);
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getVisit = async function getVisit(visitId): APIRequest {
    try {
        let url = 'Encounter/'+visitId;
        let params = {};
        params.resolveReferences = ["subject", "basedOn"];
        const result = await this.callServer(this.createUrl(url), params);
        console.log('getVisit', result);
        const visit = getVisitFromJson(result);
        return new APIRequest(true, visit);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.addVisit = async function addVisit(visit: Visit): APIRequest {
    try {
        const data = getJsonFromVisit(visit);
        const result = await this.server.create(data);
        console.log('addVisit', result);
        visit = getVisitFromJson(result);
        // HACK!
        return await this.getVisit(visit.id);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.updateVisit = async function updateVisit(visit: Visit): APIRequest {
    try {
        const data = getJsonFromVisit(visit);
        const result = await this.server.update(data);
        console.log('updateVisit', result);
        visit = getVisitFromJson(result);
        // HACK!
        return await this.getVisit(visit.id);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

export function getVisitFromJson(json) {
    let visit = new Visit();
    visit.id = json.id;
    visit.patientId = json.subject?.id || null;
    visit.patient = json.subject ? getPatientFromJson(json.subject) : null;
    visit.reason = json.reasonCode?.text;
    visit.taskIds = json.basedOn?.map(task => task.id);
    visit.tasks = json.basedOn?.map(task => getTaskFromJson(task));
    if (json.period) {
        visit.start = json.period.start ? moment(json.period.start).toDate() : null;
        visit.end = json.period.end ? moment(json.period.end).toDate() : null;
    }
    return visit;
}

function getJsonFromVisit(visit: Visit) {
    const data = {
        resourceType: "Encounter",
        status: "planned",
        class: {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB",
            "display": "ambulatory"
        },
        type: [
            {
                coding: [
                    {
                        system: "http://hl7.org/fhir/ValueSet/encounter-status",
                        code: "FLD",
                        display: "Field"
                    }
                ]
            }
        ],
        priority: {
            coding: [
                {
                    system: "http://terminology.hl7.org/ValueSet/v3-ActPriority",
                    code: "R",
                    display: "Routine"
                }
            ]
        },
        subject: {
            reference: "Patient/" + visit.patientId,
        },
        participant: [
            {
                individual:{
                    reference: "Practitioner/" + API.user.id,
                }
            }
        ],
        reasonCode: [
            {
                text:visit.reason || ""
            }
        ],
        period: {
            start: moment(visit.start).toISOString(),
            end: moment(visit.end).toISOString()
        }
    };

    if (visit.id) {
        data.id = visit.id;
    }

    visit.taskIds && visit.taskIds.filter(id => id);
    data.basedOn = visit.taskIds?.map(id => {
        return {
            reference: 'ServiceRequest/' + id,
        }
    });

    return data;
}
