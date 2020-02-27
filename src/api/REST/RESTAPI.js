import {API, APIRequest} from '../API';
import axios from 'axios';
import moment from 'moment';
import AzureAuth from 'react-native-azure-auth';
import * as Keychain from 'react-native-keychain';

export default class RESTAPI extends API {
    constructor(props) {
        super(props);

        this.server.interceptors.request.use(request => {
            console.log(`${moment().format('YYYY-MM-DD HH:mm:ss.sss')} Starting Request:`, request);
            return request;
        });

        this.server.interceptors.response.use(response => {
            console.log(`${moment().format('YYYY-MM-DD HH:mm:ss.sss')} Response:`, response);
            return response;
        });
    }

    azureAuth = new AzureAuth({
        clientId: '8a597862-04f8-4607-a34c-1d90024773b4',
        redirectUri: 'msal8a597862-04f8-4607-a34c-1d90024773b4://auth',
    });

    server = axios.create({
        baseURL: 'https://fhir1.azurewebsites.net',
        timeout: 15000,
        headers: {
            'Accept': '*/*',
            'Content-Type': 'application/fhir+json; charset=utf-8',
            'Cache-Control': 'no-cache',
        },

        validateStatus: function (status) {
            return true;
        },
    });
};
