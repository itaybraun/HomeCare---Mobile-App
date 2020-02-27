import {API, APIRequest} from '../API';
import RESTAPI from './RESTAPI';
import {Patient} from '../../models/Patient';
import moment from 'moment';
import {Address} from '../../models/Person';

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
