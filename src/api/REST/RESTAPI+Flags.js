import RESTAPI from './RESTAPI';
import {Flag} from '../../models/Flag';
import moment from 'moment';
import {getPatientFromJson} from './RESTAPI+Patients';
import APIRequest from '../../models/APIRequest';

//------------------------------------------------------------
// Flags
//------------------------------------------------------------

RESTAPI.prototype.getFlags = async function getFlags(patientId): APIRequest {

    await this.updateCurrentUser();

    try {

        let params = {};
        params.status = 'active';
        let url = 'Flag';
        if (patientId) {
            params.subject = patientId;
        } else if (this.user) {
            params.subject = this.user.patientsIds?.join(',');
        }
        let fhirOptions = {};
        fhirOptions.pageLimit = 0;
        fhirOptions.flat = true;
        fhirOptions.resolveReferences = ["subject"];

        const result = await this.callServer(this.createUrl(url, params), fhirOptions);
        console.log('getFlags', result);
        let flags = result.map(json => getFlagFromJson(json)) || [];
        return new APIRequest(true, flags);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getFlag = async function getFlag(flagId): APIRequest {
    try {
        let params = {};
        let url = 'Flag/'+flagId;
        let fhirOptions = {};
        fhirOptions.resolveReferences = ["subject"];
        const result = await this.callServer(this.createUrl(url, params), fhirOptions);
        console.log('getFlag', result);
        const flag = getFlagFromJson(result);
        return new APIRequest(true, flag);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.addFlag = async function addFlag(flag: Flag): APIRequest {
    try {
        const data = getJsonFromFlag(flag);
        console.log(data);
        const result = await this.server.create(data);
        console.log('addFlag', result);
        flag = getFlagFromJson(result);
        return new APIRequest(true, flag);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.editFlag = async function editFlag(flag: Flag): APIRequest {
    try {
        const data = getJsonFromFlag(flag);
        const result = await this.server.update(data);
        console.log('editFlag', result);
        flag = getFlagFromJson(result);
        return await this.getFlag(flag.id);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.deleteFlag = async function deleteFlag(flag: Flag): APIRequest {
    try {
        const result = await this.server.delete('Flag/' + flag.id);
        console.log('deleteFlag', result);
        return new APIRequest(true);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

function getFlagFromJson(json) {
    let flag = new Flag();
    flag.id = json.id;
    flag.status = json.status;
    flag.lastUpdate = json.meta?.lastUpdated ? moment(json.meta?.lastUpdated).toDate() : null;
    flag.text = json.code?.text;
    flag.category = json.category?.map(category => category.text).join(',');
    flag.startDate = moment(json.period?.start).toDate();
    flag.endDate = moment(json.period?.end).toDate();
    flag.patientId = json.subject?.id || null;
    flag.patient = json.subject ? getPatientFromJson(json.subject) : null;
    flag.internal = json.code.coding?.find(coding => coding.system === 'http://copper-serpent.com/valueset/flag-internal')?.code === '1' || false;
    return flag;
}

function getJsonFromFlag(flag: Flag) {
    const data = {
        resourceType: 'Flag',
        status: flag.status,
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
