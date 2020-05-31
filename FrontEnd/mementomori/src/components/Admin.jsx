import React, { Component } from "react";
import API from '../services/axiosObject.js'
import constants from '../constants.js'
import './Admin.css'
import Navbar from './Navbar'
import Reactable from "reactable"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DeleteUserModal from "../components/AdminPanel/DeleteUserModal"
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import { Alert } from 'react-bootstrap'
import EditUserModal from '../components/AdminPanel/EditUserModal'
export default class Admin extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userList: [],
            rowId: "",
            rowEmail: "",
            userDeleted: false,
            userDeletedError: true,
            showDeleteUserModal: false,
            showEditUserModal: false,
            editUserInfo:{
                firstName: "",
                secondName: "",
                email: "",
                password1: "",
                password2: ""
            },
            userUpdateErrors:{
                success: false,
                wrongEmail: false,
                wrongPassword: false,
                wrongName: false,
                dbError: false
            }
        }
        this.getUserList = this.getUserList.bind(this)
        this.deleteUser = this.deleteUser.bind(this)
        this.showDeleteUserModal = this.showDeleteUserModal.bind(this)
        this.closeDeleteUserModal = this.closeDeleteUserModal.bind(this)
        this.handleDismiss = this.handleDismiss.bind(this)
        this.showEditUserModal = this.showEditUserModal.bind(this)
        this.closeEditUserModal = this.closeEditUserModal.bind(this)
        this.handleSubmitUserEdit = this.handleSubmitUserEdit.bind(this)
        this.handleDismissUserEdit = this.handleDismissUserEdit.bind(this)
        this.updateEditErrors = this.updateEditErrors.bind(this)
        //handlechangebinding
        this.handleChangeFirstName = this.handleChangeFirstName.bind(this)
        this.handleChangeSecondName = this.handleChangeSecondName.bind(this)
        this.handleChangeMail = this.handleChangeMail.bind(this)
        
    }

    getUserList() {
        API.get(constants.urlBackend+'/userlist').then(response => {
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
        API.post(constants.urlBackend+'user/delete/' + this.state.rowId).then(response => {
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

    showEditUserModal(rowId,rowEmail, rowFirstName,rowSecondName){
        this.handleDismissUserEdit();
        let obj = Object.assign({}, this.state.editUserInfo)

        obj.firstName = rowFirstName
        obj.secondName = rowSecondName
        obj.email = rowEmail

        this.setState({
            showEditUserModal: true,
            rowId: rowId,
            editUserInfo: obj
        })
    }
    closeEditUserModal(){
        this.setState({
            showEditUserModal: false
        })
    }

    //handleChange Functions for the User Edit
    handleChangeFirstName = (evt) => {
        this.setState({
            editUserInfo: Object.assign({}, this.state.editUserInfo, { firstName: evt.target.value })
        })
    }

    handleChangeSecondName = (evt) => {
        this.setState({
            editUserInfo: Object.assign({}, this.state.editUserInfo, { secondName: evt.target.value })
        })
    }

    handleChangeMail = (evt) => {
        this.setState({
            editUserInfo: Object.assign({}, this.state.editUserInfo, { email: evt.target.value })
        })
    }

    handleChangePassword1 = (evt) => {
        this.setState({
            editUserInfo: Object.assign({}, this.state.editUserInfo, { password1: evt.target.value })
        })
    }

    handleChangePassword2 = (evt) => {
        this.setState({
            editUserInfo: Object.assign({}, this.state.editUserInfo, { password2: evt.target.value })
        })
    }

    //handleDismiss for the user Edit

    handleDismissUserEdit(){
        console.log("hola")
        let obj = Object.assign({}, this.state.userUpdateErrors)

        obj.success= false;
        obj.wrongEmail= false;
        obj.wrongPassword = false;
        obj.wrongName = false;
        obj.dbError = false;

        this.setState({
            userUpdateErrors: obj
        })
    }

    //handleSubmit for the User Edit

    updateEditErrors(err){
        let obj = Object.assign({}, this.state.userUpdateErrors)

        if(err == 401){
            obj.wrongEmail = true
        }
        if (err == 402){
            obj.wrongName = true
        }
        if(err == 403){
            obj.wrongPassword = true
        }
        if(err == 405){
            obj.dbError= true
        }
        if(err == 200){
            obj.success = true
        }

        this.setState({
            userUpdateErrors: obj
        })
    
    }

    handleSubmitUserEdit(event) {
        this.handleDismissUserEdit();
        event.preventDefault();
        var firstName= this.state.editUserInfo.firstName
        var secondName = this.state.editUserInfo.secondName
        var mail = this.state.editUserInfo.email
        var password1 = this.state.editUserInfo.password1
        var password2 = this.state.editUserInfo.password2

        API.post(constants.urlBackend+'/user/update/' + this.state.rowId, { firstName, secondName, mail, password1, password2 }).then( res => {
            console.log(res)
           console.log("updated")
           this.updateEditErrors(200)
           this.getUserList();
        }).catch(err => {
            if(err.response.status == 200){
                this.getUserList();
            }else if(err.response.status == 401){
                console.log("wrong email")
                this.updateEditErrors(401)
            }else if(err.response.status == 402){
                console.log("invalid names")
                this.updateEditErrors(402)
            }else if(err.response.status == 403){
                console.log("passwords dont match")
                this.updateEditErrors(403)
            }else if(err.response.status == 405){
                console.log("db error")
                this.updateEditErrors(405)
            }
        })
        console.log(firstName, secondName, mail, password1, password2)
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
                                <Td column="Manage"><div><FontAwesomeIcon className="editIcon" onClick={() => this.showEditUserModal(row.id, row.email, row.first_name,row.second_name)} icon={faEdit}></FontAwesomeIcon>
                                    <FontAwesomeIcon className="editIcon" onClick={() => this.showDeleteUserModal(row.id, row.email)} icon={faTrashAlt}></FontAwesomeIcon>
                                </div></Td>
                            </Tr>
                        )
                    })}
                </Table>
                <DeleteUserModal showDeleteUserModal={this.state.showDeleteUserModal} closeDeleteUserModal={this.closeDeleteUserModal} userDeleted={this.state.userDeleted} deleteUser={this.deleteUser} handleDismiss={this.handleDismiss} />
                <EditUserModal
                handleChangeFirstName = { this.handleChangeFirstName}
                handleChangeSecondName = {this.handleChangeSecondName}
                handleChangeMail = {this.handleChangeMail}
                handleSubmit={this.handleSubmitUserEdit}
                handleChangePassword1 = {this.handleChangePassword1}
                handleChangePassword2 = {this.handleChangePassword2}
                showEditUserModal={this.state.showEditUserModal} closeEditUserModal={this.closeEditUserModal}
                rowId={this.state.rowId}
                userInfo={this.state.editUserInfo}
                userUpdateErrors={this.state.userUpdateErrors}
                handleDismiss={this.handleDismissUserEdit}
                />
            </div>
        )
    }
}