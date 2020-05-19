import moment from 'moment';
import RNFS from 'react-native-fs'
import DeviceInfo from 'react-native-device-info';

export class Logger {
    static init = async () => {
        global.log = new Logger();
        await createFolder();
    };

    raw = (message) => {
        if (!message) return;
        message += '\n';
        storeMessages([message]);
        console.log(message);
    }

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
        const oldLogs = await getLogsByDate(moment().subtract(1, 'days').toDate());
        const logs = await getLogsByDate(moment().toDate());
        return oldLogs ? oldLogs + logs : logs;
    };

    generateLogsFile = async () => {
        let deviceFeatures = [DeviceInfo.getModel(), DeviceInfo.getSystemName(), DeviceInfo.getSystemVersion()];
        deviceFeatures = deviceFeatures.filter(f => f);
        let fileName = `Logs_${moment().format('YYYY-MM-DD_HH-mm-ss')}_(${deviceFeatures.join(" ")}).txt`;
        let filePath = dir + fileName;
        const logs = await this.getLogs();
        try {
            await RNFS.writeFile(filePath, logs, 'utf8');
            return filePath;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    deleteLogs = async () => {
        const paths = await RNFS.readdir(dir);
        for (let path of paths) {await RNFS.unlink(dir + path);}
    };
}

function modify(message, type) {
    message = `${moment().format('YYYY.MM.DD HH:mm:ss.SSS')} [${type}] ${message}`;

    return message + '\n';
}

async function createFolder() {
    try {
        busy = true;
        const exists = await RNFS.exists(dir);
        if (!exists) {
            await RNFS.mkdir(dir);
            busy = false;
        }
        busy = false;
        if (queue.length > 0) {
            storeMessages(queue);
            queue = [];
        }
    } catch(error) {
        console.log(error)
        busy = false;
    }
}

const dir =  RNFS.DocumentDirectoryPath + `/logs/`;
function getLogFilePath(date: Date) {
    return  dir + `log_${moment(date).format('YYYY.MM.DD')}.txt`;
}

async function getLogsByDate(date: Date) {
    const logFilePath = getLogFilePath(date)
    if (await RNFS.exists(logFilePath))
        return await RNFS.readFile(logFilePath, 'utf8');

    return null;
};

let queue = [];
let busy = false;

async function storeMessages(messages) {
    try {
        if (busy) {
            queue = queue.concat(messages);
            return;
        }

        await createFolder();

        const todayLogFilePath = getLogFilePath(moment().toDate());
        let exists = await RNFS.exists(todayLogFilePath);
        // delete logs after 3am
        if (moment().hour() > 3 && !exists) {
            const paths = await RNFS.readdir(dir);
            for (let path of paths) {await RNFS.unlink(dir + path);}
        }

        let logs = messages.join('');
        if (logs) {
            await RNFS.appendFile(todayLogFilePath, logs);
        }

        busy = false;

        if (queue.length > 0) {
            storeMessages(queue);
            queue = [];
        }
    } catch (error) {
        console.error(error);
    }
}
