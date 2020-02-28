import {API, APIRequest} from '../API';
import RESTAPI from './RESTAPI';
import {Patient} from '../../models/Patient';
import {Visit} from '../../models/Visit';
import moment from 'moment';

//------------------------------------------------------------
// Visits
//------------------------------------------------------------

RESTAPI.prototype.getVisits = async function getVisits(patientId): APIRequest {
    try {
        const response = await this.server.get('Encounter', {
            params: {
                subject: patientId
            },
        });
        if (response.status === 200) {
            const visits = response.data.entry?.map(json => getVisitFromFHIR((json.resource))) ?? [];
            return new APIRequest(true, visits);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getVisit = async function addVisit(visitId): APIRequest {
    try {
        const response = await this.server.get('Encounter/'+visitId, {
        });
        if (response.status === 200) {
            const visit = getVisitFromFHIR(response.data);
            return new APIRequest(true, visit);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.addVisit = async function addVisit(visit: Visit): APIRequest {
    try {
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
                display: visit.patient?.fullName,
            },
            participant: [
                {
                    individual:{
                        reference: "Practitioner/8cba6c16-4f07-42de-9b06-b5af4f05f23c"
                    }
                }
            ],
            reasonCode: [
                {
                    text:visit.reason
                }
            ],
            period: {
                start: moment(visit.start).toISOString(),
                end: moment(visit.end).toISOString()
            }
        };

        return new APIRequest(true, visit);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

function getVisitFromFHIR(json) {
    let visit = new Visit();
    visit.id = json.id;
    visit.patientId = json.subject?.reference?.replace('Patient/','') ?? null;
    visit.patient = new Patient({fullName: json.subject?.display});
    visit.reason = json.reasonCode?.text;
    if (json.period) {
        visit.start = json.period.start ? moment(json.period.start).toDate() : null;
        visit.end = json.period.end ? moment(json.period.end).toDate() : null;
    }
    return visit;
}
