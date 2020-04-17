import uuid from 'uuid';
import querystring from 'query-string';
import URL from 'url';
import {Buffer} from 'buffer';

export default class AzureInstance {
    constructor(credentials) {
        this.authority = 'https://login.microsoftonline.com/common';
        this.authorize_endpoint = '/oauth2/v2.0/authorize';
        this.redirect_uri = credentials.redirect_uri;
        this.token_endpoint ='/oauth2/v2.0/token';
        this.client_id = credentials.client_id;
        this.client_secret = credentials.client_secret;
        this.scope = credentials.scope;

        this.token = null;
    }

    getConfig = () => {
        return {
            authority: this.authority,
            authorize_endpoint: this.authorize_endpoint,
            token_endpoint: this.token_endpoint,
            client_id: this.client_id,
            client_secret: this.client_secret,
            redirect_uri: this.redirect_uri,
            scope: this.scope,
        }
    };

    getAuthUrl = () => {
        return this.authority + this.authorize_endpoint +
            '?client_id=' + this.client_id +
            '&response_type=code' +
            '&redirect_uri=' + this.redirect_uri +
            '&scope=' + this.scope + '%20offline_access' +
            '&response_mode=query' +
            '&nonce=' + uuid.v4() +
            '&state=abcd';
    }

    getToken = () => {
        return this.token;
    };

    _request(params: any): Promise {
        const post_data = querystring.stringify(params);

        // create request endpoint
        const endpoint = this.authority + this.token_endpoint;

        // set port based on http protocol
        let parsedUrl = URL.parse(endpoint, true);
        if (parsedUrl.protocol === "https:" && !parsedUrl.port) {
            parsedUrl.port = 443;
        }

        // set request header
        var realHeaders = {};
        realHeaders['Host'] = parsedUrl.host;

        var queryStr = querystring.stringify(parsedUrl.query);
        if (queryStr) queryStr = "?" + queryStr;

        if (post_data) {
            if (Buffer.isBuffer(post_data)) {
                realHeaders["Content-Length"] = post_data.length;
            } else {
                realHeaders["Content-Length"] = Buffer.byteLength(post_data);
            }
        } else {
            realHeaders["Content-length"] = 0;
        }

        realHeaders["Content-Type"] = 'application/x-www-form-urlencoded';

        // create request option object
        const options = {
            host: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + queryStr,
            method: "POST",
            headers: realHeaders
        };

        const payload = Object.assign({
            body: post_data
        }, options);

        // request token
        return fetch(endpoint, payload)
            .then(response => {
                // return blob object
                return response.json()
            })
            .then(response => {
                // read blob object back to json
                console.log(response)
                return {
                    expires_in: response.expires_in + Math.round(+new Date()/1000),
                    accessToken: response.access_token,
                    refreshToken: response.refresh_token
                }
            }).catch(err => {
                // incase of error reject promise
                return new Error(err);
            });
    }

    getTokenFromCode = async(code: string): Promise => {
        var params = {
            client_id: this.client_id,
            client_secret: this.client_secret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: this.redirect_uri,
            response_mode: 'form_post',
            nonce: uuid.v4(),
            state: 'abcd'
        };

        try {
            this.token = await this._request(params);
        } catch (error) {
            alert(error.message);
        }
    };

    getTokenFromRefreshToken = async (refreshToken: string): Promise => {
        var params = {
            client_id: this.client_id,
            client_secret: this.client_secret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
            redirect_uri: this.redirect_uri,
            response_mode: 'form_post',
            nonce: uuid.v4(),
            state: 'abcd'
        }

        try {
            this.token = await this._request(params);
        } catch (error) {
            alert(error.message);
        }
    }
}
