import React from 'react'
import './CalendarFields.css'

class CalendarFields extends React.Component{
    constructor(props) {
        super(props);

      console.log(props) //week number, begining with 0
    
    }


    render(){
        var weekId = this.props.weekId;
        if(weekId <= this.props.livedWeeks){
            return <div id={weekId} className="cube-lived"></div>
        }else{
            return <div id={weekId} className="cube white"></div>
        }
        
    }
}
export default CalendarFields;