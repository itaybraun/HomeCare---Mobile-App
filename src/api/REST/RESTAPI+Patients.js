import {API, APIRequest} from '../API';
import RESTAPI from './RESTAPI';
import {Patient} from '../../models/Patient';
import moment from 'moment';
import {Address, Person} from '../../models/Person';

//------------------------------------------------------------
// Patients
//------------------------------------------------------------

RESTAPI.prototype.getPatients = async function getPatients(): APIRequest {
    try {
        let url = 'Patient';
        let params = {};
        params.pageLimit = 0;
        params.flat = true;
        const result = await this.server.request(this.createUrl(url), params);
        console.log('getPatients', result);
        const patients = result.map(json => getPatientFromJson((json))) || [];
        return new APIRequest(true, patients);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getPatient = async function getPatient(patientId: String): APIRequest {
    try {
        if (!patientId) {
            return new APIRequest(true, null);
        }

        let url = 'Patient/'+patientId;
        const result = await this.server.request(this.createUrl(url));
        console.log(result);
        const patient = getPatientFromJson(result);
        return new APIRequest(true, patient);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

export function getPatientFromJson(json) {
    let patient = new Patient();
    patient.id = json.id;
    patient.gender = json.gender;
    patient.dateOfBirth = moment(json.birthDate).toDate();

    const official = json.name?.find(name => name.use === 'official');
    const firstName = official?.given?.join(' ') || '';
    const lastName = official?.family || '';
    patient.firstName = firstName;
    patient.lastName = lastName;
    patient.fullName = `${firstName} ${lastName}`;

    const home = json.address?.find(address => address.use === 'home');
    patient.address = home ? new Address({
        line: home.line.join(", "),
        city: home.city,
        postalCode: home.postalCode,
        country: home.country
    }) : null;

    patient.phone = json.telecom?.find(telecom => telecom.system ==='phone')?.value;
    patient.identifier = json.identifier?.[0]?.value;

    return patient;
}
