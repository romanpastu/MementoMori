import React from 'react'
import CalendarGrid from './CalendarGrid'

import './Calendario.css'

class Calendario extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            birth_date: new Date(),
            years_to_live: 100,
            death_date: "",

        };

        this.getWeeksToLive = this.getWeeksToLive.bind(this);

    }

    componentDidMount() {

        //Sets the death date state given the birth date and the years to live
        var death = new Date(this.state.birth_date.getTime());
        death.setFullYear(this.state.birth_date.getFullYear() + this.state.years_to_live);

        this.setState({
            death_date: new Date(death),
        });
    }


    getWeeksToLive() {
        var seconds_to_live = (new Date(this.state.death_date) - new Date(this.state.birth_date)) / 1000;
        var weeks_to_live = seconds_to_live / 60 / 60 / 24 / 7;
        //Returns week rounded to upper number
        console.log("Semanas a vivir : " + Math.ceil(weeks_to_live))
        return Math.ceil(weeks_to_live);
    }

    getWeeksToDate() {
        var current_date = new Date();
        console.log(current_date) //Sat Jan 11 2020 17:07:30 GMT+0100 (Central European Standard Time)
        console.log(new Date(555555558555)); //Mon Aug 10 1987 02:59:18 GMT+0200 (Central European Summer Time)
        var seconds_to_date = (new Date(current_date) - new Date(555555558555)) / 1000 //The second new Date() is the birth date, right now theres a mockup to simulate a birth date
        var weeks_to_date = seconds_to_date / 60 / 60 / 24 / 7;
        console.log("semanas vividas:" + Math.ceil(weeks_to_date));
        //Returns lived weeks to date rounded to upper number
        return Math.ceil(weeks_to_date);
    }

    render() {
        return (
            <div className="container">
                {/* <p>Hello world!</p>
                <p><b>Birth date:</b> {this.state.birth_date.toString()}</p>
                <p><b>Death date:</b> {this.state.death_date.toString()}</p>
                <p><b>Lived weeks:</b> {this.getLivedWeeks()}</p> */}
                <CalendarGrid livedWeeks={this.getWeeksToDate()} totalWeeks={this.getWeeksToLive()} />
            </div>
        )
    }
}

export default Calendario;