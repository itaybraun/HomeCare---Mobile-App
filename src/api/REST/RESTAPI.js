import {API, APIRequest} from '../API';
import axios from 'axios';
import {Patient} from '../../models/Patient';
import moment from 'moment';
import {Flag} from '../../models/Flag';
import {Priorities, Task} from '../../models/Task';
import {Visit} from '../../models/Visit';
import AzureAuth from 'react-native-azure-auth';
import {Practitioner} from '../../models/Practitioner';
import * as Keychain from 'react-native-keychain';
import {Address} from '../../models/Person';

export default class RESTAPI extends API {
    constructor(props) {
        super(props);

        this.server.interceptors.request.use(request => {
            console.log(`${moment().format('YYYY-MM-DD HH:mm:ss.sss')} Starting Request:`, request);
            return request;
        });

        this.server.interceptors.response.use(response => {
            console.log(`${moment().format('YYYY-MM-DD HH:mm:ss.sss')} Response:`, response);
            return response;
        });
    }

    azureAuth = new AzureAuth({
        clientId: '8a597862-04f8-4607-a34c-1d90024773b4',
        redirectUri: 'msal8a597862-04f8-4607-a34c-1d90024773b4://auth',
    });

    server = axios.create({
        baseURL: 'https://fhir1.azurewebsites.net',
        timeout: 15000,
        headers: {
            'Accept': '*/*',
            'Content-Type': 'application/fhir+json; charset=utf-8',
            'Cache-Control': 'no-cache',
        },

        validateStatus: function (status) {
            return true;
        },
    });
}

//------------------------------------------------------------
// Login
//------------------------------------------------------------

RESTAPI.prototype.login = async function login(username, password): APIRequest {
    try {

        return new APIRequest(true);

        const credentials = null; // await Keychain.getGenericPassword();
        let tokens = null;
        if (credentials && credentials.username) {
            //tokens = await this.azureAuth.auth.acquireTokenSilent({scope: 'Mail.Read', userId: credentials.username});
        }
        if (!tokens)
            tokens = await this.azureAuth.webAuth.authorize({scope: 'mail.read'});

        const p = await this.azureAuth.auth.msGraphRequest({token: tokens.accessToken, path: 'Patients'});


        if (tokens) {
            //await Keychain.setGenericPassword(tokens.userId, tokens.accessToken);
            this.token = tokens.accessToken;
            return new APIRequest(true);
        } else {
            return new APIRequest(false, new Error('no access'));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

//------------------------------------------------------------
// Patients
//------------------------------------------------------------

RESTAPI.prototype.getPatients = async function getPatients(): APIRequest {
    try {
        const response = await this.server.get('Patient', {
            params: {},
            headers: { Authorization: `Bearer ${this.token} ` }
        });
        if (response.status === 200) {
            const patients = response.data.entry?.map(json => getPatientFromFHIR((json.resource))) ?? [];
            return new APIRequest(true, patients);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getPatient = async function getPatient(patientId: String): APIRequest {
    try {
        if (!patientId) {
            return new APIRequest(true, null);
        }
        const response = await this.server.get('Patient/'+patientId, {
            params: {},
        });
        if (response.status === 200) {
            const patient = getPatientFromFHIR(response.data);
            return new APIRequest(true, patient);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

function getPatientFromFHIR(json) {
    let patient = new Patient();
    patient.id = json.id;
    patient.gender = json.gender;
    patient.dateOfBirth = moment(json.birthDate).toDate();

    const official = json.name?.find(name => name.use === 'official');
    const firstName = official?.given?.join(' ') ?? '';
    const lastName = official?.family ?? '';
    patient.fullName = `${firstName} ${lastName}`;

    const home = json.address?.find(address => address.use === 'home');
    patient.address = home ? new Address({
        line: home.line.join(", "),
        city: home.city,
        postalCode: home.postalCode,
        country: home.country
    }) : null;

    patient.phone = json.telecom?.find(telecom => telecom.system ==='phone')?.value;

    return patient;
}

//------------------------------------------------------------
// Practitioners
//------------------------------------------------------------

RESTAPI.prototype.getPractitioner = async function getPractitioner(practitionerId): APIRequest {
    try {
        if (!practitionerId) {
            return new APIRequest(true, null);
        }
        const response = await this.server.get('Practitioner/'+practitionerId, {
            params: {},
        });
        if (response.status === 200) {
            const patient = getPractitionerFromFHIR(response.data);
            return new APIRequest(true, patient);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

function getPractitionerFromFHIR(json) {
    let practitioner = new Practitioner();
    practitioner.id = json.id;
    practitioner.gender = json.gender;
    practitioner.dateOfBirth = moment(json.birthDate).toDate();

    const usual = json.name?.find(name => name.use === 'usual');
    practitioner.fullName = usual?.text;
    practitioner.phone = json.telecom?.find(telecom => telecom.system ==='phone')?.value;

    const work = json.address?.find(address => address.use === 'work');
    practitioner.address = work ? new Address({
        line: work.line.join(', '),
        city: work.city,
        postalCode: work.postalCode,
        country: work.country
    }) : null;

    return practitioner;
}

//------------------------------------------------------------
// Flags
//------------------------------------------------------------

RESTAPI.prototype.getFlags = async function getFlags(patientId): APIRequest {
    try {
        const response = await this.server.get('Flag', {
            params: {
                subject: patientId,
            },
        });
        if (response.status === 200) {
            const flags = response.data.entry?.map(json => getFlagFromFHIR(json.resource)) ?? [];
            return new APIRequest(true, flags);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.addFlag = async function addFlag(flag: Flag, patient: Patient): APIRequest {
    try {
        const data = {
            resourceType: 'Flag',
            status: 'active',
            category: [
                {
                    coding: [
                        {
                            system: 'http://terminology.hl7.org/CodeSystem/flag-category',
                            code: flag.category,
                            display: flag.category,
                        },
                    ],
                    text: flag.category,
                },
            ],
            code: {
                coding: [
                    {
                        system: 'http://copper-serpent.com/valueset/flag-internal',
                        code: flag.internal ? "1" : "0",
                        display: 'Internal',
                    },
                ],
                text: flag.text
            },
            subject: {
                reference: `Patient/${patient.id}`,
            },
            period: {
                start: moment(flag.startDate).format('YYYY-MM-DD'),
                end: moment(flag.endDate).format('YYYY-MM-DD'),
            },
            author: {
                reference: 'Practitioner/8cba6c16-4f07-42de-9b06-b5af4f05f23c',
                display: 'Florence Nightingale',
            },
        };

        const response = await this.server.post('Flag', JSON.stringify(data));
        if (response.status === 201) {
            let flag = getFlagFromFHIR(response.data);
            return new APIRequest(true, flag);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.editFlag = async function editFlag(flag: Flag, patient: Patient): APIRequest {
    try {

        const data = {
            resourceType: 'Flag',
            id: flag.id,
            status: 'active',
            category: [
                {
                    coding: [
                        {
                            system: 'http://terminology.hl7.org/CodeSystem/flag-category',
                            code: flag.category,
                            display: flag.category,
                        },
                    ],
                    text: flag.category,
                },
            ],
            code: {
                coding: [
                    {
                        system: 'http://copper-serpent.com/valueset/flag-internal',
                        code: flag.internal ? "1" : "0",
                        display: 'Internal',
                    },
                ],
                text: flag.text
            },
            subject: {
                reference: `Patient/${patient.id}`,
            },
            period: {
                start: moment(flag.startDate).format('YYYY-MM-DD'),
                end: moment(flag.endDate).format('YYYY-MM-DD'),
            },
            author: {
                reference: 'Practitioner/8cba6c16-4f07-42de-9b06-b5af4f05f23c',
                display: 'Florence Nightingale',
            },
        };

        const response = await this.server.put('Flag/' + flag.id, JSON.stringify(data));
        if (response.status === 200) {
            let flag = getFlagFromFHIR(response.data);
            return new APIRequest(true, flag);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.deleteFlag = async function deleteFlag(flag: Flag): APIRequest {
    try {
        const response = await this.server.delete('Flag/' + flag.id);
        if (response.status === 204) {
            return new APIRequest(true);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

function getFlagFromFHIR(json) {
    let flag = new Flag();
    flag.id = json.id;
    flag.text = json.code?.text;
    flag.category = json.category?.map(category => category.text).join(',');
    flag.startDate = moment(json.period?.start).toDate();
    flag.endDate = moment(json.period?.end).toDate();
    flag.internal = json.code.coding?.find(coding => coding.system === 'http://copper-serpent.com/valueset/flag-internal')?.code === '1' ?? false;
    return flag;
}

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

            tasks.forEach(task => {
                if (task.patientId) {
                    task.patient = patients.find(patient => patient.id === task.patientId);
                }
            });
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

//------------------------------------------------------------
// Visits
//------------------------------------------------------------

RESTAPI.prototype.getVisits = async function getVisits(patient: Patient): APIRequest {
    try {
        const response = await this.server.get('Encounter', {
            params: {
                subject: patient.id
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
