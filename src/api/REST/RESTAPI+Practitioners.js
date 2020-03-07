import {API, APIRequest} from '../API';
import RESTAPI from './RESTAPI';
import {Practitioner} from '../../models/Practitioner';
import moment from 'moment';
import {Address} from '../../models/Person';


//------------------------------------------------------------
// Practitioners
//------------------------------------------------------------

RESTAPI.prototype.getPractitioner = async function getPractitioner(practitionerId): APIRequest {
    try {
        if (!practitionerId) {
            return new APIRequest(true, null);
        }
        const response = await this.server.get('Practitioner/'+practitionerId, {
            params: {},
        });
        if (response.status === 200) {
            const patient = getPractitionerFromJSON(response.data);
            return new APIRequest(true, patient);
        } else {
            return new APIRequest(false, new Error(response.data));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

export function getPractitionerFromJSON(json) {
    let practitioner = new Practitioner();
    practitioner.id = json.id;
    practitioner.gender = json.gender;
    practitioner.dateOfBirth = moment(json.birthDate).toDate();

    const usual = json.name?.find(name => name.use === 'usual');
    practitioner.fullName = usual?.text;

    practitioner.phone = json.telecom?.find(t => t.system ==='phone')?.value;
    practitioner.email = json.telecom?.find(t => t.system === 'email')?.value;

    const work = json.address?.find(address => address.use === 'work');
    practitioner.address = work ? new Address({
        line: work.line.join(', '),
        city: work.city,
        postalCode: work.postalCode,
        country: work.country
    }) : null;

    return practitioner;
}
