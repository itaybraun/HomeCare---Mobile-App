import {API, APIRequest} from '../API';
import FHIR from 'fhirclient';
import AzureInstance from '../Azure/AzureInstance';
import {Utils, Request} from '../../support/Utils';

export default class RESTAPI extends API {
    constructor(server, azure: AzureInstance = null) {
        super();

        this.server = FHIR.client({
            serverUrl: server,
        });

        this.azure = azure;
        if (this.azure) {
            this.token = this.azure.getToken().accessToken;
            this.server.setToken(this.token);
        }
    }

    refreshToken = async (): APIRequest => {
        if (!this.azure) {
            return new APIRequest(false, new Error('Not authorized!'));
        }
        try {
            const refreshToken = this.azure.getToken().refreshToken;
            if (refreshToken) {
                await this.azure.getTokenFromRefreshToken();
                this.token = this.azure.getToken().accessToken;
                this.server.setToken(this.token);
                return new APIRequest(true);
            }

            return new APIRequest(false, new Error ('relog'));
        } catch (error) {
            console.log(error);
            return new APIRequest(false, new Error ('relog'));
        }
    };

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

    callServer = async (url, fhirOptions) => {
        try {
            let result = await this.server.request(url, fhirOptions);
            return result;
        } catch (error) {
            if (error.message === "401") {
                let refreshResult: APIRequest = await this.refreshToken();
                if (refreshResult.success) {
                    this.callServer(url, fhirOptions);
                } else {
                    throw refreshResult.data;
                }
            }
            throw error;
        }
    };

    setCurrentUser = async (identifier: String = null): APIRequest => {
        if (!identifier) {
            const accessToken = this.azure.getToken().accessToken;
            const decodedToken = Utils.parseJwt(accessToken);
            identifier = decodedToken.unique_name;
        }

        if (identifier) {
            this.upn = identifier;
            let result: APIRequest = await this.getPractitionerByIdentifier(identifier);
            if (result.success) {
                this.user = result.data;
            }

            return result;
        }

        return APIRequest(false);
    };
};

