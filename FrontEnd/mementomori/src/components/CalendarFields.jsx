import React from 'react'
import './CalendarFields.css'

class CalendarFields extends React.Component{
    constructor(props) {
        super(props);

      console.log(props) //week number, beginning with 0
    
    }


    render(){
        var weekId = this.props.weekId;
        if(weekId <= this.props.livedWeeks){
            if(weekId == this.props.currentWeek){
                return <div id={weekId} title={weekId} className="cube green"> </div>
            }else{
                return <div id={weekId} className="cube-lived"></div>
            }
        }else if(weekId == this.props.currentWeek){
            
                return <div id={weekId} title={weekId} className="cube green"> </div>
            
        }else{
            return <div id={weekId} title={weekId} className="cube white"> </div>
        }
        
    }
}
export default CalendarFields;