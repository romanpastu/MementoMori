import React, { Component } from "react";
import API from '../services/axiosObject.js'
import './Admin.css'
import Navbar from './Navbar'
import Reactable from "reactable"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DeleteUserModal from "../components/AdminPanel/DeleteUserModal"
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import { Alert } from 'react-bootstrap'
export default class Admin extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userList: [],
            rowId: "",
            rowEmail: "",
            userDeleted: false,
            userDeletedError: true,
            showDeleteUserModal: false
        }
        this.getUserList = this.getUserList.bind(this)
        this.deleteUser = this.deleteUser.bind(this)
        this.showDeleteUserModal = this.showDeleteUserModal.bind(this)
        this.closeDeleteUserModal = this.closeDeleteUserModal.bind(this)
        this.handleDismiss = this.handleDismiss.bind(this)

    }

    getUserList() {
        API.get('/userlist').then(response => {
            this.setState({
                userList: response.data
            }, () => {
                console.log(this.state.userList)
            })
        })
    }

    componentDidMount() {
        this.getUserList();
        this.setState({
            userDeletedError: false,
            userDeleted: false,
            showDeleteUserModal: false
        })
    }

    handleDismiss() {
        this.setState({
            userDeleted: false,
            userDeletedError: false
        })
    }

    deleteUser() {
        API.post('user/delete/' + this.state.rowId).then(response => {
            console.log("Respuesta al borrar")
            console.log(response.data)
            console.log(response.status)
            if (response.status == 200) {
                this.setState({
                    showDeleteUserModal: false,
                    userDeleted: true
                }, () => {
                    this.getUserList();
                })
            } else {
                this.setState({
                    userDeletedError: true
                })
            }
        }).catch( err => {
            if(!err.response){
                this.setState({
                    userDeletedError: true
                })
            }
        })
    }

    showDeleteUserModal(rowId, rowEmail) {
        this.setState({
            showDeleteUserModal: true,
            rowId: rowId,
            selectedMail: rowEmail,
            userDeletedError: false,
            userDeleted: false
        })
    }

    closeDeleteUserModal() {
        this.setState({
            showDeleteUserModal: false
        }, () => {

        })
    }

    render() {
        var users = this.state.userList

        const Table = Reactable.Table,
            Td = Reactable.Td,
            Tr = Reactable.Tr;

        if (users.length === 0) {
            return <p>loading</p>
        }
        return (
            <div>
                <Navbar {...this.props} logout={this.props.logout} />
                {this.state.userDeleted ? <div className="row " > <Alert className="text-center " style={{ width: "50%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="success" dismissible onClose={this.handleDismiss}>
                    User deleted properly
                                    </Alert> </div> : null}
                {this.state.userDeletedError ? <div className="row "> <Alert className="text-center " style={{ width: "50%", float: "none", margin: "0 auto ", marginBottom: "1vw" }} variant="danger" dismissible onClose={this.handleDismiss}>
                    Error deleting the user
                                    </Alert> </div> : null}
                <Table
                    className="table"
                    filterable={['Email']}
                    itesPerPage={8}
                    currentPage={0}
                    sortable={true}
                >
                    {users.map((row) => {
                        return (
                            <Tr className={row.className} key={row.id}>
                                <Td column="Email">{row.email}</Td>
                                <Td column="Manage"><div><FontAwesomeIcon className="editIcon" onClick={() => console.log("hi")} icon={faEdit}></FontAwesomeIcon>
                                    <FontAwesomeIcon className="editIcon" onClick={() => this.showDeleteUserModal(row.id, row.email)} icon={faTrashAlt}></FontAwesomeIcon>
                                </div></Td>
                            </Tr>
                        )
                    })}
                </Table>
                <DeleteUserModal showDeleteUserModal={this.state.showDeleteUserModal} closeDeleteUserModal={this.closeDeleteUserModal} userDeleted={this.state.userDeleted} deleteUser={this.deleteUser} handleDismiss={this.handleDismiss} />
            </div>
        )
    }
}