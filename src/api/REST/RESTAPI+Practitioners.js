import RESTAPI from './RESTAPI';
import {Organization, Practitioner} from '../../models/Practitioner';
import moment from 'moment';
import {Address} from '../../models/Person';
import APIRequest from '../../models/APIRequest';

//------------------------------------------------------------
// Practitioners
//------------------------------------------------------------

RESTAPI.prototype.getPractitioners = async function getPractitioners(): APIRequest {

    try {
        let params = {};
        let url = 'Practitioner';
        let fhirOptions = {};
        fhirOptions.pageLimit = 0;
        fhirOptions.flat = true;
        const result = await this.callServer(this.createUrl(url, params), fhirOptions);
        console.log('getPractitioners', result);
        const practitioners = result.map(json => this.getPractitionerFromJSON((json))) || [];
        return new APIRequest(true, practitioners);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getPractitioner = async function getPractitioner(practitionerId): APIRequest {
    try {
        if (!practitionerId) {
            return new APIRequest(true, null);
        }

        let params = {};
        let url = 'Practitioner/'+practitionerId;
        params.flat = true;

        const result = await this.callServer(this.createUrl(url), params);
        console.log('getPractitioner', result);
        let practitioner = this.getPractitionerFromJSON(result);
        return new APIRequest(true, practitioner);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getPractitionerByIdentifier = async function getPractitionerByIdentifier(identifier): APIRequest {
    try {
        if (!identifier) {
            return new APIRequest(true, null);
        }
        let params = {};
        let url = 'Practitioner?identifier='+identifier;
        let fhirOptions = {};
        fhirOptions.pageLimit = 0;
        fhirOptions.flat = true;

        const result = await this.callServer(this.createUrl(url, params), fhirOptions);
        console.log('getPractitionerByIdentifier', result);
        if (result && result.length > 0) {
            let practitioner = this.getPractitionerFromJSON(result[0]);
            return new APIRequest(true, practitioner);
        } else {
            return new APIRequest(false, new Error('No practitioner with identifier='+identifier+' was found'));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getPractitionerFromJSON = function getPractitionerFromJSON(json): Practitioner {
    let practitioner = new Practitioner();
    practitioner.id = json.id;
    practitioner.gender = json.gender;
    practitioner.dateOfBirth = moment(json.birthDate).toDate();

    const usual = json.name?.find(name => name.use === 'usual');
    practitioner.fullName = usual?.text;
    practitioner.patientsIds = json.contained?.[0]?.entry.map(object => object.item?.reference.replace('Patient/', '')) || [];

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
};

RESTAPI.prototype.getOrganizationFromJSON = function getOrganizationFromJSON(json): Array {

    let organization = new Organization();

    organization.id = json.id;
    organization.fullName = json.name;

    return organization;

};
