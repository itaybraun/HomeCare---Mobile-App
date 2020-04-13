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

    static shadeBlend (p,c0,c1) {
        let n = p < 0 ? p * -1 : p, u = Math.round, w = parseInt;
        if (c0.length > 7) {
            let f = c0.split(','), t = (c1 ? c1 : p < 0 ? 'rgb(0,0,0)' : 'rgb(255,255,255)').split(','),
                R = w(f[0].slice(4)), G = w(f[1]), B = w(f[2]);
            return 'rgb(' + (u((w(t[0].slice(4)) - R) * n) + R) + ',' + (u((w(t[1]) - G) * n) + G) + ',' + (u((w(t[2]) - B) * n) + B) + ')';
        } else {
            let f = w(c0.slice(1), 16), t = w((c1 ? c1 : p < 0 ? '#000000' : '#FFFFFF').slice(1), 16), R1 = f >> 16,
                G1 = f >> 8 & 0x00FF, B1 = f & 0x0000FF;
            return '#' + (0x1000000 + (u(((t >> 16) - R1) * n) + R1) * 0x10000 + (u(((t >> 8 & 0x00FF) - G1) * n) + G1) * 0x100 + (u(((t & 0x0000FF) - B1) * n) + B1)).toString(16).slice(1);
        }
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

