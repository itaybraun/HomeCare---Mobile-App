
export class Utils {
    static initialize() {
        String.prototype.isEmpty = function() {
            return (this.length === 0 || !this.trim());
        };
    }
}

const delay = ms => new Promise(res => setTimeout(res, ms));

export {delay};
