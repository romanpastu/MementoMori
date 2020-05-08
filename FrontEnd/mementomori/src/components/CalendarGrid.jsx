import React from 'react'
import CalendarFields from './CalendarFields'
import { getUserId } from '../services/userInfo.js'
import API from '../services/axiosObject.js';
import constants from '../constants.js'
import { CircularProgress } from '@material-ui/core';
import './CalendarGrid.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPowerOff, faUser, faColumns } from '@fortawesome/free-solid-svg-icons'

class CalendarGrid extends React.Component {

  constructor() {
    super()

    this.state = {
      fieldsInfo: [],
      loaded: false
    }

  }



  componentDidMount() {

    const userId = getUserId();

    API.get(constants.urlBackend + '/getUserFieldsInfo/' + userId).then(response => {
      this.setState({
        fieldsInfo: response.data,
        loaded: true
      }, () => {
        console.log(this.state.fieldsInfo)
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
          <div className="appNavbar">
            <div className="navEl nav1"><FontAwesomeIcon icon={faColumns} className="navIcon"/></div>
            <div className="navEl nav2"><FontAwesomeIcon icon={faUser} className="navIcon"/></div>
            <div className="navEl nav3"><FontAwesomeIcon icon={faPowerOff} className="navIcon"/></div>
          </div>
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