import API from '../API';
import {delay} from '../../support/Utils';
import axios from 'axios';

export default class RESTAPI extends API {
    constructor(props) {
        super(props);
    }

    server = axios.create({
        baseURL: 'https://homecare20200203070819.azurewebsites.net/api/',
        timeout: 5000,
        headers: {
            'Accept': '*/*',
            'Content-Type': 'application/x-www-form-urlencoded',
        },

        validateStatus: function (status) {
            return true
        },
    });
}

RESTAPI.prototype.login = async function login(username, password) {
    try {
        const response = await this.server.get('Authentication', {
            params: {
                username: username,
                password: password,
                code: 'cEUemC34TGr/T1XiIRHFSQYvb6v7LBN/pMO/7jg695vXhRW3jbOQXA=='
            }
        });
        if (response.status === 200) {
            return true;
        } else {
            return response.data;
        }
    } catch (error) {
        return error.message;
    }
};
