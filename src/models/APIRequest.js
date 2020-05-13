import {Request} from '../support/Utils';

export default class APIRequest extends Request {
    constructor(success, data = null) {
        super(success, data)
    }

    toString = () => {
        return `Request success is ${this.success}, data is ${this.data}`;
    }
}
