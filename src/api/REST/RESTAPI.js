import {API, APIRequest} from '../API';
import FHIR from 'fhirclient';

export default class RESTAPI extends API {
    constructor(server) {
        super();

        this.server = FHIR.client({
            serverUrl: server,
        });
    }

    createUrl = (url, params = null) => {

        let str = "";

        if (params) {
            str = Object.keys(params).map((key) => key + '=' + params[key]).join('&');
        }

        if (!str.isEmpty())
            url += (url.indexOf("?") > -1 ? '&' : '?') + str;

        let result = {
            url: url,
            headers: {
                'Cache-Control': 'no-cache',
            }
        };

        if (this.token) {
            result.headers.Authorization = `Bearer ${API.token}`;
        }

        console.log(result);

        return result;
    };

    setCurrentUser = async (identifier: String) => {
        this.upn = identifier;
        let result: APIRequest = await this.getPractitionerByIdentifier(identifier);
        if (result.success) {
            this.user = result.data;
        }

        return result;
    }

    set token(token) {
        super.token = token;
        this.server.setToken(token);
    }
};

