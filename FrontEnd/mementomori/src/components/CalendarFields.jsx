import React from 'react'
import './CalendarFields.css'

class CalendarFields extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fieldId : ""
        };
        console.log(props) //week number, beginning with 0
        this.fieldClick = this.fieldClick.bind(this);
    }

    componentDidMount(){
        this.setState({
            fieldId: this.props.weekId,
        });
    }

    fieldClick(event){
        console.log("pulsable");
    }

    render() {
        var weekId = this.props.weekId;
        //current week, round up
        //lived weeks, round down
        //total weeks, round up
        if (weekId < this.props.livedWeeks) {
            return <div id={weekId} className="cube-lived"></div>
        } else if (weekId == this.props.currentWeek) {
            return <div id={weekId} title={weekId} className="cube green" onClick={this.fieldClick}> </div>
        } else {
            return <div id={weekId} title={weekId} className="cube white" onClick={this.fieldClick}> </div>
        }

    }
}
export default CalendarFields;