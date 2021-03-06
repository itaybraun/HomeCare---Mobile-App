import RESTAPI from './RESTAPI';
import moment from 'moment';
import {Relative} from '../../models/Relative';
import APIRequest from '../../models/APIRequest';

//------------------------------------------------------------
// Relatives
//------------------------------------------------------------

RESTAPI.prototype.getPatientRelatives = async function getPatientRelatives(patientId: String): APIRequest {
    try {
        if (!patientId) {
            return new APIRequest(true, null);
        }

        let params = {};
        let url = 'RelatedPerson';
        params.patient = patientId;
        let fhirOptions = {};
        fhirOptions.pageLimit = 0;
        fhirOptions.flat = true;
        const result = await this.callServer(this.createUrl(url, params), fhirOptions);
        const relatives = result.map(json => getRelativeFromJson((json))) || [];
        return new APIRequest(true, relatives);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getRelativeFromJson =  function getRelativeFromJson(json): Relative {
    let relative = new Relative();
    relative.id = json.id;
    relative.gender = json.gender;
    relative.dateOfBirth = moment(json.birthDate).toDate();

    const name = json.name?.[0];
    const firstName = name?.given?.join(' ') || '';
    const lastName = name?.family || '';
    relative.firstName = firstName;
    relative.lastName = lastName;
    relative.fullName = `${firstName} ${lastName}`;

    // TODO: make it localizable
    relative.relationship = json.relationship?.[0]?.coding?.[0]?.display;

    relative.phone = json.telecom?.find(t => t.system ==='phone')?.value;
    relative.email = json.telecom?.find(t => t.system === 'email')?.value;

    return relative;
};
