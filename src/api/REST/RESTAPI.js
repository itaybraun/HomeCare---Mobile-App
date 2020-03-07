import {API, APIRequest} from '../API';
import axios from 'axios';
import moment from 'moment';
import Auth0 from 'react-native-auth0';
import * as Keychain from 'react-native-keychain';
import FHIR from 'fhirclient';

export default class RESTAPI extends API {
    constructor(props) {
        super(props);

        // this.server.interceptors.request.use(request => {
        //     console.log(`${moment().format('YYYY-MM-DD HH:mm:ss.sss')} Starting Request:`, request);
        //     return request;
        // });
        //
        // this.server.interceptors.response.use(response => {
        //     console.log(`${moment().format('YYYY-MM-DD HH:mm:ss.sss')} Response:`, response);
        //     return response;
        // });
    }

    auth0 = new Auth0({
        domain: 'https://login.microsoftonline.com/334dfb98-c6db-4e3b-834a-001a3e268e92/oauth2/authorize?resource=https://cs2.azurewebsites.net',
        clientId: '6b1d9c3b-df12-4a15-9a66-0e299f9a9bd2',
    });

    server = FHIR.client({
        serverUrl: "https://fhir1.azurewebsites.net",
    });

    userId: String;

    createUrl = (url) => {
        return {
            url: url,
            headers: {
                'Cache-Control': 'no-cache',
            }
        };
    }
};

