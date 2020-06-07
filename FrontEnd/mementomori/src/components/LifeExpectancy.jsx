import React from 'react'
import './styles/LifeExpectancy.scss'
import API from '../services/axiosObject.js';
import constants from '../constants.js'
import refreshTheToken from '../services/refreshTheToken.js'
import { Alert } from 'react-bootstrap'
var moment = require('moment');
class LifeExpectancy extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            yearsToLive: "",
            invalidYears: false,
            invalidYearsAlreadyLived: false
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleDismiss = this.handleDismiss.bind(this)
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
        this.setState({
            invalidYears: false,
            invalidYearsAlreadyLived: false
        })
        const yearsToLive = this.state.yearsToLive;
        const registerDate = moment().format("YYYY-MM-DD");
        API.post(constants.urlBackend + "/generateCalendar", { yearsToLive, registerDate }).then(response => {
            console.log("resposne of the api")
            console.log(response)
            if (response.data == "100") {
                refreshTheToken().then(response => {
                    console.log("resposne in the refreshing")
                    console.log(response)
                    this.props.setYearsRedirect();
                })
            }


        }).catch(err => {
            if(err.response.status == 400){
                this.setState({
                    invalidYears: true
                })
            }else if(err.response.status == 408){
                this.setState({
                    invalidYearsAlreadyLived: true
                })
            }
            console.log(err.response.status)
        })
    }

    handleDismiss(){
        this.setState({
            invalidYears: false,
            invalidYearsAlreadyLived: false
        })
    }

    render() {
        return (
            <div className="lifeExpectancyContainer">
                <div className="lifeExpectancyForm">
                {this.state.invalidYears ? <Alert variant="danger" dismissible onClose={this.handleDismiss}> Years must be between 1 and 100 </Alert> : null}
                {this.state.invalidYearsAlreadyLived ? <Alert variant="danger" dismissible onClose={this.handleDismiss}> You have inputed less years than your current lifespan. </Alert> : null}
                    <p className="p-life-expectancy">Input the number of years that you expect to live</p>
                    <input type="number" name="yearsToLive" className="input-life-expetancy" onChange={this.handleChange} />
                    <button type="submit" class="btn btn-primary btn-life-expectancy" onClick={this.handleSubmit}>Submit</button>
                </div>
            </div>
        )
    }
}

export default LifeExpectancy;