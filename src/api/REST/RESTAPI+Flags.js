import {API, APIRequest} from '../API';
import RESTAPI from './RESTAPI';
import {Flag} from '../../models/Flag';
import moment from 'moment';
import {Patient} from '../../models/Patient';

//------------------------------------------------------------
// Flags
//------------------------------------------------------------

RESTAPI.prototype.getFlags = async function getFlags(patientId): APIRequest {
    try {

        let params = {};
        let url = 'Flag';
        if (patientId) {
            params.subject = patientId;
        } else {
            url += '?Practitioner=' + this.userId;
        }

        const response = await this.server.get(url, {
            params: params
        });
        if (response.status === 200) {
            const flags = response.data.entry?.map(json => getFlagFromFHIR(json.resource)) || [];

            let patients = [];
            if (patientId) {
                let result: APIRequest = await this.getPatient(patientId);
                if (result.success)
                    patients.push(result.data);
            } else {
                const patientsIDs = flags.map(flags => flags.patientId).filter((value, index, self) => self.indexOf(value) === index);
                patients = await Promise.all(patientsIDs.map(async id => {
                    if (id) {
                        let result: APIRequest = await this.getPatient(id);
                        if (result.success)
                            return result.data;
                    }

                    return null;
                }));
                patients = patients.filter(p => p);
            }

            for (const flag: Flag of flags) {
                if (flag.patientId) {
                    flag.patient = patients.find(patient => patient.id === flag.patientId);
                }
            }

            return new APIRequest(true, flags);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.addFlag = async function addFlag(flag: Flag): APIRequest {
    try {
        const data = getJsonFromFlag(flag);
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

RESTAPI.prototype.editFlag = async function editFlag(flag: Flag): APIRequest {
    try {
        const data = getJsonFromFlag(flag);
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
    flag.patientId = json.subject?.reference?.replace('Patient/','') || null;
    flag.patient = new Patient({fullName: json.subject?.display});
    flag.internal = json.code.coding?.find(coding => coding.system === 'http://copper-serpent.com/valueset/flag-internal')?.code === '1' || false;
    return flag;
}

function getJsonFromFlag(flag: Flag) {
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
            reference: `Patient/${flag.patientId}`,
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

    if (flag.id) {
        data.id = flag.id;
    }

    return data;
}
