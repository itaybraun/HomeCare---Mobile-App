import {API, APIRequest} from '../API';
import axios from 'axios';
import {Patient} from '../../models/Patient';
import moment from 'moment';
import {Flag} from '../../models/Flag';
import {Priorities, Task} from '../../models/Task';

export default class RESTAPI extends API {
    constructor(props) {
        super(props);

        this.server.interceptors.request.use(request => {
            console.log('Starting Request', request);
            return request;
        });

        this.server.interceptors.response.use(response => {
            console.log('Response:', response);
            return response;
        });
    }

    server = axios.create({
        baseURL: 'https://fhir1.azurewebsites.net',
        timeout: 15000,
        headers: {
            'Accept': '*/*',
            'Content-Type': 'application/fhir+json; charset=utf-8',
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

        this.userId = '8cba6c16-4f07-42de-9b06-b5af4f05f23c';

        return new APIRequest(true);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

//------------------------------------------------------------
// Patients
//------------------------------------------------------------

RESTAPI.prototype.getPatients = async function getPatients(userId: String): APIRequest {
    try {
        if (!userId) userId = this.userId;
        const response = await this.server.get('Patient', {
            params: {},
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
    patient.dateOfBirth = moment(json.birthDate);

    const official = json.name?.find(name => name.use === 'official');
    patient.firstName = official?.given?.join(' ') ?? '';
    patient.lastName = official?.family ?? '';

    const home = json.address?.find(address => address.use === 'home');
    patient.address = home ? {
        line: home.line,
        city: home.city,
        postalCode: home.postalCode,
        country: home.country
    } : null;

    return patient;
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
            tasks = await Promise.all(tasks.map(async task => {
                if (task.patientId) {
                    let result: APIRequest = await this.getPatient(task.patientId);
                    if (result.success)
                        task.patient = result.data;
                }

                return task;
            }));
            return new APIRequest(true, tasks);
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
    task.openDate = json.occurrenceDateTime ? moment(json.occurrenceDateTime).toDate() : null;
    task.text = json.code?.text;
    task.priority = json.priority ? Priorities.getByString(json.priority) ?? Priorities.ROUTINE : Priorities.ROUTINE;
    task.requester = json.requester?.display;
    return task;
}
