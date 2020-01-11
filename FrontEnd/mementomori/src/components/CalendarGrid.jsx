import React from 'react'
import CalendarFields from './CalendarFields'

import './CalendarGrid.css'

class CalendarGrid extends React.Component {
  render() {
    let rows = []
    for (let i = 0; i<this.props.totalWeeks;i++){
      rows.push(<CalendarFields key={i} weekId={i} livedWeeks={this.props.livedWeeks} currentWeek={this.props.currentWeek}/>)
    }
    return <div className="elements">{rows}</div>

  }
}

export default CalendarGrid;