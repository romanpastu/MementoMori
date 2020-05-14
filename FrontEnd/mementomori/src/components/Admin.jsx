import React, {Component} from "react";
import API from '../services/axiosObject.js'
import './Admin.css'
import Navbar from './Navbar'
import Reactable from "reactable"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faEdit, faTrashAlt} from '@fortawesome/free-regular-svg-icons'
export default class Admin extends Component{
    constructor(props){
        super(props)
        this.state = {
            userList: []
        }
        this.getUserList = this.getUserList.bind(this) 
    }

    getUserList(){
        API.get('/userlist').then(response => {
            this.setState({
                userList: response.data
            }, () =>{
                console.log(this.state.userList)
            })
        })
    }

    componentDidMount(){
        this.getUserList();
    }

    render() {
        var users = this.state.userList

        const Table = Reactable.Table,
            Td = Reactable.Td,
            Tr = Reactable.Tr;
        
        if(users.length === 0){
            return <p>loading</p>
        }
        return(
            <div>
            <Navbar {...this.props} logout={this.props.logout} />
           
            <Table
            className="table"
            filterable={['Email']}
            itesPerPage={8}
            currentPage={0}
            sortable={true}
            >
                {users.map((row) =>{
                    return(
                        <Tr className={row.className} key={row.id}>
                            <Td column="Email">{row.email}</Td>
                            <Td column="Manage"><div><FontAwesomeIcon className="editIcon" onClick={() => console.log("hi")} icon={faEdit}></FontAwesomeIcon>
                            <FontAwesomeIcon className="editIcon" onClick={() => console.log("hi")} icon={faTrashAlt}></FontAwesomeIcon>
                            </div></Td>
                        </Tr>
                    )
                })}
            </Table>
            </div>
        )
    }
}