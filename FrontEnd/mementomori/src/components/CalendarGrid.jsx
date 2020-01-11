import React from 'react'
import CalendarFields from './CalendarFields'

import './CalendarGrid.css'

class CalendarGrid extends React.Component {
  render() {
    let rows = []
    for (let i = 0; i<this.props.weeks;i++){
      rows.push(<CalendarFields key={i} />)
    }
    return <h1>{rows}</h1>

  }
}

export default CalendarGrid;