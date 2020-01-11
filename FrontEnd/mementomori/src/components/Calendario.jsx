import React from 'react'
import CalendarGrid from './CalendarGrid'

class Calendario extends React.Component {
    constructor(props) {
        super(props);

        this.state = { 
            birth_date : new Date(),
            years_to_live: 1,
            death_date: "",

        };

        this.getLivedWeeks = this.getLivedWeeks.bind(this);

    }

    componentDidMount() {
        
        //Sets the death date state given the birth date and the years to live
        var death = new Date(this.state.birth_date.getTime());
        death.setFullYear(this.state.birth_date.getFullYear() + this.state.years_to_live);

        this.setState({ 
            death_date : new Date(death),
        });
    }
    

    getLivedWeeks(){
       var lived_seconds = (new Date(this.state.death_date) - new Date(this.state.birth_date))/1000;
       var lived_weeks = lived_seconds/60/60/24/7;
       //Returns week rounded to upper number
       return Math.ceil(lived_weeks);
    }

    render() {
        return (
            <div className="container">
                {/* <p>Hello world!</p>
                <p><b>Birth date:</b> {this.state.birth_date.toString()}</p>
                <p><b>Death date:</b> {this.state.death_date.toString()}</p>
                <p><b>Lived weeks:</b> {this.getLivedWeeks()}</p> */}
                <CalendarGrid weeks={this.getLivedWeeks()}/>
            </div>
        )
    }
}

export default Calendario;