import React from 'react';
import API from '../api/API';

export default class AppScreen extends React.Component {
    get api():API {
        return this.props.screenProps.api;
    }
}
