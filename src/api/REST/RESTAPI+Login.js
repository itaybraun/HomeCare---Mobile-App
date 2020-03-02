import {API, APIRequest} from '../API';
import RESTAPI from './RESTAPI';

//------------------------------------------------------------
// Login
//------------------------------------------------------------

RESTAPI.prototype.login = async function login(username, password): APIRequest {
    try {

        return new APIRequest(true);

        let tokens = null;

        tokens = await this.auth0.webAuth.authorize({scope: 'openid email profile'});
        console.log(tokens);


        return new APIRequest(true);

        const credentials = null; // await Keychain.getGenericPassword();

        if (credentials && credentials.username) {
            //tokens = await this.azureAuth.auth.acquireTokenSilent({scope: 'Mail.Read', userId: credentials.username});
        }
        if (!tokens)
            tokens = await this.azureAuth.webAuth.authorize({scope: 'mail.read'});

        const p = await this.azureAuth.auth.msGraphRequest({token: tokens.accessToken, path: 'Patients'});


        if (tokens) {
            //await Keychain.setGenericPassword(tokens.userId, tokens.accessToken);
            this.token = tokens.accessToken;
            return new APIRequest(true);
        } else {
            return new APIRequest(false, new Error('no access'));
        }
    } catch (error) {
        return new APIRequest(false, error);
    }
};
