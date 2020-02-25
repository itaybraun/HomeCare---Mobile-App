import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';

export class Logger {
    static init = () => {
        global.log = new Logger();
    };

    raw = (message) => {
        if (!message) return;
        message += '\n';
        storeMessages([message]);
        console.log(message);
    };

    info = (message) => {
        if (!message) return;
        message = modify(message, 'Info');
        storeMessages([message]);
        console.log(message);
    };

    debug = (message) => {
        if (!message) return;
        message = modify(message, 'Debug');
        storeMessages([message]);
        console.debug(message);
    };

    warn = (message) => {
        if (!message) return;
        message = modify(message, 'Warning');
        storeMessages([message]);
        console.warn(message);
    };

    error = (message) => {
        if (!message) return;
        message = modify(message, 'Error');
        storeMessages([message]);
        console.log(message);
    };

    getLogs = async () => {
        const oldLogs = await AsyncStorage.getItem(moment().subtract(1, 'days').format('YYYY.MM.DD'));
        const logs = await AsyncStorage.getItem(moment().format('YYYY.MM.DD'));
        return oldLogs ? oldLogs + logs : logs;
    };
}

function modify(message, type) {
    // if (message.length > 300) {
    //     message = message.substring(0, 300) + "..."
    // }
    message = `${moment().format('YYYY.MM.DD HH:mm:ss.SSS')} [${type}] ${message}`;

    return message + '\n';
}

let queue = [];
let busy = false;

async function storeMessages(messages) {

    try {

        if (busy) {
            queue = queue.concat(messages);
            return;
        }

        busy = true;

        const logDate = moment().format('YYYY.MM.DD');

        let logs = await AsyncStorage.getItem(logDate);
        if (logs) {
            logs += messages.join('');
        } else if (moment().hour() > 3) {
            const previousDate = (moment().subtract(1, 'days').format('YYYY.MM.DD'));
            const previousLogs = await Storage.getItem(previousDate);
            if (previousLogs) {
                await AsyncStorage.removeItem(previousDate);
            }
            logs = messages.join('');
        }

        await AsyncStorage.setItem(logDate, logs);

        busy = false;

        if (queue.length > 0) {
            storeMessages(queue);
            queue = [];
        }
    } catch (error) {
        console.error(error);
    }
}
