import React, {Component} from "react";
import API from '../services/axiosObject.js'
import './Admin.css'
import Reactable from "reactable"

export default class Admin extends Component{
    constructor(props){
        super(props)
        this.state = {

        }
    }

    render() {
        return(
            <p>Hello admin</p>
        )
    }
}