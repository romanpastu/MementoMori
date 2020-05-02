import React from 'react'
import CalendarFields from './CalendarFields'
import { getUserId } from '../services/userInfo.js'
import API from '../services/axiosObject.js';
import constants from '../constants.js'
import './CalendarGrid.css'

class CalendarGrid extends React.Component {

  constructor(){
    super()

    this.state = {
      fieldsInfo: []
    }
  }

  componentDidMount(){
    const userId = getUserId();

    API.get(constants.urlBackend +'/getUserFieldsInfo/' + userId).then(response => {
      this.setState({
         fieldsInfo: response.data
      }, () => {
          console.log(this.state.fieldsInfo)
      })
      
  })
  }

  getDescription(id){
     var newArray = this.state.fieldsInfo.filter(function (el) {
       return el.week_number == id
     })
     
     return newArray[0].text;
   }

  getRating(id){
    var newArray = this.state.fieldsInfo.filter(function (el) {
      return el.week_number == id
    })
    return newArray[0].rating;
  }


  render() {
    let rows = []
    for (let i = 1; i <= this.props.totalWeeks; i++) {
      rows.push(<CalendarFields key={i} weekId={i} weeksToRegisterDate={this.props.weeksToRegisterDate} currentWeek={this.props.currentWeek} description={this.getDescription(i)} rating={this.getRating(i)}/>)
    }
    return <div className="fieldsContainer ">{rows}</div>

  }
}

export default CalendarGrid;