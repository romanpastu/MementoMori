import React from 'react'
import CalendarGrid from './CalendarGrid'
import API from '../services/axiosObject.js';
import './styles/Calendario.scss'
import { getUserId } from '../services/userInfo.js'
import { connect } from "react-redux"
import { setCurrentWeek } from "../redux/actions/reduxActions.js"
import store from "../redux/store/reduxStore.js"
import constants from '../constants.js'
var moment = require('moment');
moment().format();



function mapDispatchToProps(dispatch) {
    return {
        setCurrentWeek: element => dispatch(setCurrentWeek(element))
    }
  }

/**
 * Component that contains the main functions to calculate the calendar dara, its the Parent component, and contains the rest of the components.
 * 
 * @component
 * @prop {dispatcher} setCurrentWeek Prop received by the calendar from the global react store, it allows to set the current week in the redux store
 * @prop {function} logout Prop received by the grid and passed down to the navbar, it allows to perform a logout
 */

class Calendario extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            birth_date: "",
            years_to_live: "",
            death_date: "",
            register_date: "",
            weeks_to_live: ""
        };

        this.getCurrentWeek = this.getCurrentWeek.bind(this);

    }


    componentDidMount() {
        const userId = getUserId();
        
        API.get(constants.urlBackend +'/calendar/getUserGenerateCalendar').then(response => {

            this.setState({
                birth_date: moment(response.data.birthDate),
                years_to_live: response.data.years_to_live,
                register_date: moment(response.data.register_date),
                death_date: moment(response.data.death_date),
                weeks_to_live: response.data.weeks_to_live
            }, () => {

                this.props.setCurrentWeek(this.getCurrentWeek())

            })
            
        })

    }


    //this function is used to get the weeks until registration date to mark it as grey area, unused
    getWeeksToRegisterDate() {
        var register_date = this.state.register_date;
        var weeks_to_date = moment(new Date(register_date)).diff(this.state.birth_date, 'days') / 7;
        //console.log("weeks lived up to registration date:" + Math.floor(weeks_to_date));

        //Returns lived weeks to date rounded to lower number because we dont want to overwrite the current ongoing week
        return Math.floor(weeks_to_date);
    }

    //this function returns the current ongoing week
    getCurrentWeek() {
        var current_date = moment();
        var weeks_to_date = moment(new Date(current_date)).diff(this.state.birth_date, 'days') / 7;
        //console.log("week lived to date:" + Math.floor(weeks_to_date));

        //Returns lived weeks to date rounded to lower number because we dont want to overwrite the current ongoing week
        return Math.floor(weeks_to_date);
    }


    render() {
        // if (!this.state.loaded) return null;
        return (
            <div className="calendar-container">

                <CalendarGrid logout={this.props.logout} weeksToRegisterDate={this.getWeeksToRegisterDate()} totalWeeks={this.state.weeks_to_live} currentWeek={this.getCurrentWeek()} {...this.props}/>

            </div>
        )
    }
}
export default connect(null, mapDispatchToProps)(Calendario)
