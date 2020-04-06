import React from 'react'
import CalendarGrid from './CalendarGrid'
import API from '../services/axiosObject.js';
import './Calendario.css'
import { getUserId } from '../services/userInfo.js'
var moment = require('moment');
moment().format();

class Calendario extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            birth_date: "",
            years_to_live: "",
            death_date: "",
            register_date: ""
        };

        this.getWeeksToLive = this.getWeeksToLive.bind(this);
        this.getCurrentWeek = this.getCurrentWeek.bind(this);
        this.filterDate = this.filterDate.bind(this);
    }


    componentDidMount() {
        const userId = getUserId();

        API.get('/getUserGenerateCalendar/' + userId).then(response => {

            this.setState({
                birth_date: moment(this.filterDate(response.data.birthDate)),
                years_to_live: response.data.years_to_live,
                register_date: moment(this.filterDate(response.data.register_date))
            }, () => {
                this.setState({
                    death_date: moment(this.state.birth_date).add(this.state.years_to_live, 'years')
                }, () => {
                    console.log(this.state)
                    console.log("fecha de muerte: " + new Date(this.state.death_date))
                })
            })
            console.log("fecha de nacimiento: " + new Date(this.state.birth_date))
        })


        //   //Sets the death date state given the birth date and the years to live
        // this.setState({
        //     death_date: moment(this.state.birth_date).add(this.state.years_to_live, 'years')
        // }, () => {
        //     console.log("fecha de muerte: " + new Date(this.state.death_date))
        // });
        // console.log("fecha de nacimiento: " + new Date(this.state.birth_date))
    }

    filterDate(date) {
        console.log(date)
        var stringDate = date.toString();
        var result = stringDate.match(/(?:(?!T).)*/)
        return result[0];
    }

    //this function returns the total amount of weeks to live betweek the birth date, and the death date
    getWeeksToLive() {
        //returns the weeks to live between death and birth date, rounded to upper week
        var weeks_to_live = moment(new Date(this.state.death_date)).diff(this.state.birth_date, 'days') / 7;
        console.log("semanas a vivir: " + Math.ceil(weeks_to_live))
        return Math.ceil(weeks_to_live);

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
            <div className=" calendar-container">

                <CalendarGrid weeksToRegisterDate={this.getWeeksToRegisterDate()} totalWeeks={this.getWeeksToLive()} currentWeek={this.getCurrentWeek()} />

            </div>
        )
    }
}

export default Calendario;