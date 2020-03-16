import {API, APIRequest} from '../API';
import FHIR from 'fhirclient';

export default class RESTAPI extends API {
    constructor(server) {
        super();

        this.server = FHIR.client({
            serverUrl: server,
        });
    }

    createUrl = (url) => {
        let result = {
            url: url,
            headers: {
                'Cache-Control': 'no-cache',
            }
        };

        if (API.token) {
            result.headers.Authorization = `Bearer ${API.token}`;
        }

        console.log(result);

        return result;
    };

    setCurrentUser = async (identifier: String) => {
        let result: APIRequest = await this.getPractitionerByIdentifier(identifier);
        if (result.success) {
            API.user = result.data;
        }

        return result;
    }
};

