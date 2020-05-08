import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPowerOff, faUser, faColumns } from '@fortawesome/free-solid-svg-icons'
import { Redirect } from 'react-router'
import Cookies from 'js-cookie';
import './Navbar.css'

export default class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false
        }
        this.logout = this.logout.bind(this)
    }

    logout() {
        Cookies.remove('accesstoken')
        this.props.logout();
        // this.props.history.push("/login")
        // this.setState({ redirect: true });
        
        
    }

    render() {
        const { redirect } = this.state;
        if (redirect) {
            return <Redirect to='/login' />;
        }


        return (
            <div className="appNavbar">
                <div className="navEl nav1"><FontAwesomeIcon icon={faColumns} className="navIcon" /></div>
                <div className="navEl nav2"><FontAwesomeIcon icon={faUser} className="navIcon" /></div>
                <div className="navEl nav3"><FontAwesomeIcon icon={faPowerOff} className="navIcon" onClick={this.logout}/></div>
            </div>
        )
    }
}
