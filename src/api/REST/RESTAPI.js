import {API, APIRequest} from '../API';
import {delay} from '../../support/Utils';
import axios from 'axios';
import {Patient} from '../../models/Patient';
import moment from 'moment';

export default class RESTAPI extends API {
    constructor(props) {
        super(props);

        this.server.interceptors.request.use(request => {
            console.log('Starting Request', request)
            return request
        })

        this.server.interceptors.response.use(response => {
            console.log('Response:', response)
            return response
        })
    }

    server = axios.create({
        baseURL: 'https://homecare20200203070819.azurewebsites.net/api/',
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
        const response = await this.server.get('Authentication', {
            params: {
                username: username,
                password: password,
                code: 'cEUemC34TGr/T1XiIRHFSQYvb6v7LBN/pMO/7jg695vXhRW3jbOQXA=='
            }
        });
        if (response.status === 200) {
            this.userId = response.data.userid;
            return new APIRequest(true, response.data.userid);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

//------------------------------------------------------------
// Patients
//------------------------------------------------------------

RESTAPI.prototype.getPatients = async function getPatients(userId) {
    try {
        userId = userId ?? this.userId;
        const response = await this.server.get('MyPatients', {
            params: {
                userid: userId,
                code: 'k3EYaGNUQjcUj2FeasyNaXktA1dDw4D/84BRpaovSxXbGuAuVZL/pw=='
            }
        });
        if (response.status === 200) {
            let patients = response.data.map(json => getPatientFromJSON(JSON.parse(json.fhiR_Patient)));
            return new APIRequest(true, patients);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

function getPatientFromJSON(json) {
    let patient = new Patient();
    patient.id = json.id;
    patient.gender = json.gender;
    patient.dateOfBirth = moment(json.birthDate);
    patient.firstName = json.name?.[0]?.given?.[0] ?? "";
    patient.lastName = json.name?.[0]?.family ?? "";

    return patient;
}
