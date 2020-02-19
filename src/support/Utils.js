
export class Utils {
    static initialize() {
        String.prototype.isEmpty = function() {
            return (this.length === 0 || !this.trim());
        };
    }
}

export class Request {
    constructor(success, data = null) {
        this.data = data;
        this.success = success;
    }

    data: Object;
    success: boolean;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

export {delay};

