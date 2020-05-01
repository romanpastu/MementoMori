import React from 'react'
import './LifeExpectancy.css'
import { getUserId } from '../services/userInfo.js'
import API from '../services/axiosObject.js';
import constants from '../constants.js'
import refreshTheToken from '../services/refreshTheToken.js'
var moment = require('moment');
class LifeExpectancy extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            yearsToLive: ""
        }
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentDidMount() {

    }

    handleChange = (evt) => {
        const target = evt.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit() {
        const yearsToLive = this.state.yearsToLive;
        const userId = getUserId();
        const registerDate = moment().format("YYYY-MM-DD");
        API.post(constants.urlBackend + "/generateCalendar", { yearsToLive, userId, registerDate }).then(response => {
            console.log("resposne of the api")
            console.log(response)
            if (response.status == 200) {
                refreshTheToken().then(response => {
                    console.log("resposne in the refreshing")
                    console.log(response)
                    this.props.setYearsRedirect();
                })
            }


        })
    }

    render() {
        return (
            <div className="lifeExpectancyContainer">
                <div className="lifeExpectancyForm">
                    <p className="p-life-expectancy">Input the number of years that you expect to live</p>
                    <input type="number" name="yearsToLive" className="input-life-expetancy" onChange={this.handleChange} />
                    <button type="submit" class="btn btn-primary btn-life-expectancy" onClick={this.handleSubmit}>Submit</button>
                </div>
            </div>
        )
    }
}

export default LifeExpectancy;