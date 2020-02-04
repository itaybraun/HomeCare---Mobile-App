import API from '../API';
import {delay} from '../../support/Utils';

export default class SQLAPI extends API {
    constructor(props){
        super(props);
    }

    config = {
        username: 'mobileapp',
        password: '6cK23SopEj',
        server: 'cpsqldev.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
        database: 'CMS',
    }

    login = async (username, password) => {
        await delay(1000);
    };
}
