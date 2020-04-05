import React from 'react'
import './LifeExpectancy.css'
import {getUserId} from '../services/userInfo.js'
import API from '../services/axiosObject.js';
import constants from '../constants.js'
var moment = require('moment');
class LifeExpectancy extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            yearsToLive : ""
        }
        this.handleSubmit = this.handleSubmit.bind(this) 
    }

    componentDidMount(){
        
    }

    handleChange = (evt) => {
        const target = evt.target;
        const value = target.value;
        const name = target.name;
    
        this.setState({
            [name]: value
        });
    }

    handleSubmit(){
        const yearsToLive = this.state.yearsToLive;
        const userId = getUserId();
        const registerDate = moment().format("YYYY-MM-DD");
        API.post(constants.urlBackend + "/generateCalendar", {yearsToLive, userId, registerDate}).then( response => {
            console.log(response)
        })
    }

    render() {
        return (
        <div>
            <input type="number" name="yearsToLive" onChange={this.handleChange} />
            <button type="submit" class="btn btn-primary" onClick={this.handleSubmit}>Submit</button>
        </div>
        )
    }
}

export default LifeExpectancy;