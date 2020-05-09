import React from 'react'
import Navbar from './Navbar'

class StatsPage extends React.Component{
    constructor(props){
        super(props)
    }

    render(){
        return(<div>
            <Navbar {...this.props} logout={this.props.logout}/>
            <p>welcome</p>
        </div>)
    }
}

export default StatsPage