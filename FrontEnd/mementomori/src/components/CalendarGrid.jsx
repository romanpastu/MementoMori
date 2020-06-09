import React from 'react'
import CalendarFields from './CalendarFields'
import Navbar from './Navbar'
import API from '../services/axiosObject.js';
import constants from '../constants.js'
import { CircularProgress } from '@material-ui/core';
import './styles/CalendarGrid.scss'

/**
 * Component that renders the calendar fields, and composes the whole calendar.
 * 
 * @component
 * @prop {var} totalWeeks Prop received by the grid, in order to check the amount of calendarFields components to render
 * @prop {var} weeksToRegisterDate Prop received by grid and passed down to its child component CalendarFields in order to set a proper color
 * @prop {var} currentWeek Prop received by grid and passed down to its child component CalendarFields in order to set a proper color
 * @prop {function} logout Prop received by the grid and passed down to the navbar, it allows to perform a logout
 */

class CalendarGrid extends React.Component {

  constructor() {
    super()

    this.state = {
      fieldsInfo: [],
      loaded: false
    }

  }



  componentDidMount() {

    API.get(constants.urlBackend + '/getUserFieldsInfo').then(response => {
      this.setState({
        fieldsInfo: response.data,
        loaded: true
      }, () => {
      })

    })
  }




  getDescription(id) {
    var newArray = this.state.fieldsInfo.filter(function (el) {
      return el.week_number == id
    })
    return newArray[0].text;
  }

  getRating(id) {
    var newArray = this.state.fieldsInfo.filter(function (el) {
      return el.week_number == id
    })
    return newArray[0].rating;
  }


  render() {

    let rows = []

    if (this.state.loaded) {
      for (let i = 1; i <= this.props.totalWeeks; i++) {
        rows.push(<CalendarFields key={i} weekId={i} weeksToRegisterDate={this.props.weeksToRegisterDate} currentWeek={this.props.currentWeek} description={this.getDescription(i)} rating={this.getRating(i)} />)
      }
      return (
        <div className="container2">
          <Navbar {...this.props} logout={this.props.logout}/>
          <div className="fieldsContainerCenter">
            <div className="fieldsContainer ">{rows}</div>
          </div>
        </div>
      )

    } else {
      return <div className="gridLoadingContainer"><CircularProgress color="secondary" iconStyle={"width: 1000, height:1000"} />
        <p className="loadingText">Loading...</p></div>
    }


  }
}

export default CalendarGrid;