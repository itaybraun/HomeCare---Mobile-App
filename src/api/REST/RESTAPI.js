import FHIR from 'fhirclient';
import AzureInstance from '../Azure/AzureInstance';
import {Utils} from '../../support/Utils';
import {Practitioner} from '../../models/Practitioner';
import APIRequest from '../../models/APIRequest';

const axios = require('axios');

export default class RESTAPI {
    constructor(server, azure: AzureInstance = null) {
        this.serverUrl = server;

        this.server = FHIR.client({
            serverUrl: server,
        });

        this.azure = azure;
        if (this.azure) {
            this.setToken(this.azure.getToken().accessToken);
        }
    }

    static user: Practitioner;
    get user(): Practitioner {
        return RESTAPI.user;
    }
    set user(user: Practitioner) {
        RESTAPI.user = user;
    }

    upn: String;
    serverUrl: String;

    _token: String = null;
    getToken(): String {
        return this._token;
    }
    setToken(token: String) {
        this._token = token;
        this.server.setToken(token);
    };
    removeToken = () => {
        this.server.setToken('');
    };

    refreshToken = async (): APIRequest => {
        if (!this.azure) {
            return new APIRequest(false, new Error('Not authorized!'));
        }
        try {
            const refreshToken = this.azure.getToken().refreshToken;
            if (refreshToken) {
                console.log('Refreshing token...');
                await this.azure.getTokenFromRefreshToken(refreshToken);
                console.log('Refreshed');
                this.setToken(this.azure.getToken().accessToken);
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

        if (this.getToken()) {
            result.headers.Authorization = `Bearer ${this.getToken()}`;
        }

        console.log(result);

        return result;
    };

    callServer = async (url, fhirOptions) => {
        try {
            let result = await this.server.request(url, fhirOptions);
            return result;
        } catch (error) {
            console.log(error)
            if (error.message === "unauthorized") {
                let refreshResult: APIRequest = await this.refreshToken();
                if (refreshResult.success) {
                    return this.callServer(url, fhirOptions);
                } else {
                    throw refreshResult.data;
                }
            }
            throw error;
        }
    };

    setCurrentUser = async (identifier: String = null): APIRequest => {
        if (!identifier && this.azure) {
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

        return new APIRequest(false);
    };

    updateCurrentUser = async (): APIRequest => {
        if (this.user && this.user.id) {
            let result: APIRequest = await this.getPractitioner(this.user.id);
            if (result.success) {
                this.user = result.data;
                return new APIRequest(true);
            }
        }

        return new APIRequest(false);
    }

    setPushNotificationsToken = async (newToken, oldToken): APIRequest => {
        console.group ('%csetPushNotificationsToken', 'color: gold');
        const baseURL = 'https://fhir1imagestore.table.core.windows.net/PractitionerPushNotificationTokens';
        const params = 'sp=raud&st=2020-05-09T14:31:07Z&se=2020-12-31T09:31:00Z&sv=2019-10-10&sig=SF4JdVrbRrVGDn7MS3bzXsja89LfWdqNHg6l82BGRjA%3D&tn=PractitionerPushNotificationTokens';
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        };

        if (oldToken) {
            try {
                let result = await axios.get(`${baseURL}?${params}&$filter=PNUT%20eq%20'${oldToken}'`, {headers: headers});
                if (result.data.value.length > 0) {
                    const data = result.data.value[0];
                    const PartitionKey = data.PartitionKey;
                    const RowKey = data.RowKey;

                    const select = encodeURIComponent(`PartitionKey='${PartitionKey}', RowKey='${RowKey}'`);
                    let url = `${baseURL}(${select})?${params}`;

                    let deleteResult = await axios.delete(url,  {
                        headers: {
                            ...headers,
                            "If-Match": "*"
                        },
                    });

                    console.log(deleteResult);
                }
            } catch (error) {
                console.log(error);
            }
        }

        if (newToken) {
            let result = await axios.post(`${baseURL}?${params}`, {
                PartitionKey: "1",
                RowKey: Math.random().toString(36).substr(2, 9),
                PractitionerID: this.user.id,
                PNUT: newToken
            }, {headers: headers});
        }

        return new APIRequest(true);

        console.groupEnd();
    }
};

