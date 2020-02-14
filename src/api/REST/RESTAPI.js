import {API, APIRequest} from '../API';
import {delay} from '../../support/Utils';
import axios from 'axios';
import {Patient} from '../../models/Patient';
import moment from 'moment';
import {Flag} from '../../models/Flag';

export default class RESTAPI extends API {
    constructor(props) {
        super(props);

        this.server.interceptors.request.use(request => {
            console.log('Starting Request', request)
            return request
        });

        this.server.interceptors.response.use(response => {
            console.log('Response:', response)
            return response
        });
    }

    server = axios.create({
        baseURL: 'https://fhir1.azurewebsites.net',
        timeout: 15000,
        headers: {
            'Accept': '*/*',
            'Content-Type': 'application/x-www-form-urlencoded',
        },

        validateStatus: function (status) {
            return true
        },
    });
}

//------------------------------------------------------------
// Login
//------------------------------------------------------------

RESTAPI.prototype.login = async function login(username, password) {
    try {
        return new APIRequest(true);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

//------------------------------------------------------------
// Patients
//------------------------------------------------------------

RESTAPI.prototype.getPatients = async function getPatients(userId) {
    try {
        const response = await this.server.get('Patient', {
            params: {

            }
        });
        if (response.status === 200) {
            let patients = response.data.entry.map(json => getPatientFromFHIR((json.resource)));
            return new APIRequest(true, patients);
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
    const official = json.name.find(name => name.use === 'official');
    patient.firstName = official?.given?.join(" ") ?? "";
    patient.lastName = official?.family ?? "";

    return patient;
}

//------------------------------------------------------------
// Flags
//------------------------------------------------------------

RESTAPI.prototype.getFlags = async function getFlags(patientId): APIRequest {
    try {
        const response = await this.server.get('Flag', {
            params: {
                Patient: patientId
            }
        });
        if (response.status === 200) {
            let flags = response.data.entry.map(json => getFlagFromFHIR(json.resource));
            return new APIRequest(true, flags);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.addFlag = async function addFlag(flag: Flag): APIRequest {
    return new APIRequest(true, flag);
};

RESTAPI.prototype.deleteFlag = async function deleteFlag(flag: Flag): APIRequest {
    return new APIRequest(true);
};

function getFlagFromFHIR(json) {
    let flag = new Flag();
    flag.id = json.id;
    flag.text = json.code?.text;
    flag.category = json.category?.map(category => category.text).join(",");
    flag.startDate = moment(json.period?.start);
    flag.endDate = moment(json.period?.end);
    flag.internal = json.code.coding?.find(coding => coding.system === "http://copper-serpent.com/valueset/flag-internal")?.code === "1" ?? false;
    return flag;
}
