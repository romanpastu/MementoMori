import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPowerOff, faUser, faColumns, faChartLine, faCalendar , faUserCog} from '@fortawesome/free-solid-svg-icons'
import {isAdmin} from '../services/userInfo.js'
import './styles/Navbar.scss'

export default class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            admin: false
        }
        this.logout = this.logout.bind(this)
    }

    componentDidMount(){
        if(isAdmin()){
            this.setState({
                admin:true
            }, () =>{
                console.log(this.state.admin)
            })
        }
    }

    logout() {
        this.props.logout();
    }


    render() {
        


        return (
            <div className="appNavbar">
                <div className="navEl nav1"><FontAwesomeIcon icon={faCalendar} className="navIcon" onClick={() => this.props.history.push("/dashboard")}/></div>
                <div className="navEl nav4"><FontAwesomeIcon icon={faChartLine} className="navIcon" onClick={() => this.props.history.push("/stats")}/></div>
                {this.state.admin ? <div className="navEl nav5"><FontAwesomeIcon icon={faUserCog} className="navIcon" onClick={() => this.props.history.push("/admin")}/></div> : null}
                <div className="navEl nav2"><FontAwesomeIcon icon={faUser} className="navIcon" onClick={() => this.props.history.push("/profile")}/></div>
                <div className="navEl nav3"><FontAwesomeIcon icon={faPowerOff} className="navIcon" onClick={this.logout}/></div>
            </div>
        )
    }
}
