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
        if (this.token) {
            result.headers.Authorization = `Bearer ${this.token}`;
        }

        return result;
    };
};

