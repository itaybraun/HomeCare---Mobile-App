export default class API {
    constructor(){

    }
}

API.prototype.login = async function login(username, password) {
    return {error: new Error(arguments.callee.name + ' not implemented!')};
};
