import { getCountry } from "react-native-localize";
import {decode, encode} from 'base-64'

if (!global.btoa) {
    global.btoa = encode;
}

if (!global.atob) {
    global.atob = decode;
}

String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}

export class Utils {
    static initialize() {

    }

    static getFirstDayOfWeek() {
        const country = getCountry();

        if (["MV"].includes(country)) {
            return 6;
        }
        if ([
            "AE",
            "AF",
            "BH",
            "DJ",
            "DZ",
            "EG",
            "IQ",
            "IR",
            "JO",
            "KW",
            "LY",
            "OM",
            "QA",
            "SD",
            "SY",
        ].includes(country)) {
            return 6;
        }
        if ([
            "AG",
            "AS",
            "AU",
            "BD",
            "BR",
            "BS",
            "BT",
            "BW",
            "BZ",
            "CA",
            "CN",
            "CO",
            "DM",
            "DO",
            "ET",
            "GB",
            "GT",
            "GU",
            "HK",
            "HN",
            "ID",
            "IL",
            "IN",
            "JM",
            "JP",
            "KE",
            "KH",
            "KR",
            "LA",
            "MH",
            "MM",
            "MO",
            "MT",
            "MX",
            "MZ",
            "NI",
            "NP",
            "PA",
            "PE",
            "PH",
            "PK",
            "PR",
            "PT",
            "PY",
            "SA",
            "SG",
            "SV",
            "TH",
            "TT",
            "TW",
            "UM",
            "US",
            "VE",
            "VI",
            "WS",
            "YE",
            "ZA",
            "ZW",
        ].includes(country)) {
            return 0;
        }

        return 1;
    }

    static parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    };
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

