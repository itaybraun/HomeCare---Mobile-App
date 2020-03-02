import {API, APIRequest} from '../API';
import RESTAPI from './RESTAPI';
import {Flag} from '../../models/Flag';
import {Patient} from '../../models/Patient';
import moment from 'moment';

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
    flag.patientId = json.subject?.reference?.replace('Patient/','') ?? null;
    flag.internal = json.code.coding?.find(coding => coding.system === 'http://copper-serpent.com/valueset/flag-internal')?.code === '1' ?? false;
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
