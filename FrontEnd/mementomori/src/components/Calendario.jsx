import React from 'react'

class Calendario extends React.Component {
    constructor(props) {
        super(props);

        this.state = { 
            birth_date : new Date(),
            years_to_live: 10,
            death_date: "",
            death_date_string: ""
        };

    }

    componentDidMount() {
        var death_date = this.state.birth_date.setFullYear(this.state.birth_date.getFullYear() + this.state.years_to_live) //this is should result in the current date +1
        this.setState({ 
            death_date : new Date(death_date),
            death_date_string :  new Date(death_date).toString()
        });
    }

    render() {
        return (
            <div>
                <p>Hello world!</p>
                <p>{this.state.death_date_string}</p>
                
            </div>
        )
    }
}

export default Calendario;