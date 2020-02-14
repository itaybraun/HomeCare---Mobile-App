import {API, APIRequest} from '../API';
import {delay} from '../../support/Utils';
import axios from 'axios';
import {Patient} from '../../models/Patient';
import moment from 'moment';
import {Note} from '../../models/Note';

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
            let patients = response.data.entry.map(json => getPatientFromFHIR((json)));
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
    patient.id = json.resource.id;
    patient.gender = json.resource.gender;
    patient.dateOfBirth = moment(json.resource.birthDate);
    const official = json.resource.name.find(name => {
        return name.use === 'official';
    });
    patient.firstName = official?.given?.join(" ") ?? "";
    patient.lastName = official?.family ?? "";

    return patient;
}

//------------------------------------------------------------
// Notes
//------------------------------------------------------------

RESTAPI.prototype.getNotes = async function getNotes(patientId): APIRequest {
    try {
        const response = await this.server.get('patientNotes', {
            params: {
                patientid: patientId,
                code: 'NuVjE0iUia52Sumv5YBRHvWY7BzFJl3nv0uydWg1g22jYTp5guaECw=='
            }
        });
        if (response.status === 200) {
            let notes = response.data.map(json => getNotesFromJSON(json));
            return new APIRequest(true, notes);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.addNote = async function addNote(note: Note): APIRequest {
    return new APIRequest(true, note);
};

RESTAPI.prototype.deleteNote = async function deleteNote(note: Note): APIRequest {
    return new APIRequest(true);
};

function getNotesFromJSON(json) {
    let note = new Note();
    note.id = json.noteID;
    note.patientId = json.patientID;
    note.internal = json.isInternal === 1;
    note.date = moment(json.insertDate);
    note.userId = json.addedBy;
    note.userName = json.userFullName;
    note.title = json.title;
    note.text = json.noteText;
    return note;
}
