import React from 'react'
import './ProfilePage.css'
import Navbar from './Navbar'
import API from '../services/axiosObject.js'
import constants from '../constants.js'
import { Alert } from 'react-bootstrap'
import { CircularProgress } from '@material-ui/core';
import Cookies from 'js-cookie';
import DeleteUserModal from '../components/AdminPanel/DeleteUserModal'
class ProfilePage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            email: "",
            firstName: "",
            secondName: "",
            password1: "",
            password2: "",
            success: false,
            wrongEmail: false,
            wrongName: false,
            wrongPassword: false,
            dbError: false,
            showDeleteUserModal: false,
            userDeletedError: false,
            weakPassword: false

        }
    }

    componentDidMount() {
        API.get(constants.urlBackend + '/user/info').then(res => {
            console.log(res.data)
            this.setState({
                email: res.data[0].email,
                firstName: res.data[0].first_name,
                secondName: res.data[0].second_name
            }, () => {
                this.setState({
                    loading: false
                })
            })
        }).catch(err => {
            console.log(err)
        })
    }

    handleChange = (evt) => {

        const target = evt.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleDismiss = () => {
        console.log("hola")
        this.setState({
            success: false,
            wrongEmail: false,
            wrongName: false,
            wrongPassword: false,
            dbError: false,
            userDeletedError: false,
            weakPassword: false
        })
    }

    handleSubmit = (evt) => {
        evt.preventDefault();
        console.log("hola")
        this.setState({
            success: false,
            wrongEmail: false,
            wrongName: false,
            wrongPassword: false,
            dbError: false,
            userDeletedError: false,
            weakPassword: false
        })
        var firstName = this.state.firstName;
        var secondName = this.state.secondName;
        var mail = this.state.email;
        var password1 = this.state.password1;
        var password2 = this.state.password2;

        API.post(constants.urlBackend + '/user/update', { firstName, secondName, mail, password1, password2 }).then(res => {
            this.setState({
                success: true
            })
            console.log("updated")
        }).catch(err => {
            if (err.response.status == 200) {
                this.setState({
                    success: true
                }, () => {
                    console.log(this.state)
                })
            } else if (err.response.status == 401) {
                console.log("wrong email")
                this.setState({
                    wrongEmail: true
                }, () => {
                    console.log(this.state)
                })
            } else if (err.response.status == 402) {
                console.log("invalid names")
                this.setState({
                    wrongName: true
                }, () => {
                    console.log(this.state)
                })
            } else if (err.response.status == 403) {
                console.log("passwords dont match")
                this.setState({
                    wrongPassword: true
                }, () => {
                    console.log(this.state)
                })
            } else if (err.response.status == 405) {
                console.log("db error")
                this.setState({
                    dbError: true
                }, () => {
                    console.log(this.state)
                })
            }else if (err.response.status == 404) {
                this.setState({
                    weakPassword: true
                }, () => {
                    console.log(this.state)
                })
            }
        })
    }

    deleteProfile = (evt) => {
        
        console.log("deleting")

        API.post(constants.urlBackend+ '/user/delete').then(res =>{
            this.props.logout();
        }).catch(err =>{
            if(!err.response){
                this.setState({
                    userDeletedError: true
                })
            }
        })
    }

    showDeleteUserModal = (evt) => {
        evt.preventDefault();
        this.setState({
            showDeleteUserModal: true
        })
    }

    closeDeleteUserModal = (evt) => {
        
        this.setState({
            showDeleteUserModal: false
        }, () => {

        })
    }

    render() {
        if (this.state.loading == true) {
            return <div className="gridLoadingContainer"><CircularProgress color="secondary" iconStyle={"width: 1000, height:1000"} />
                <p className="loadingText1">Loading...</p></div>
        }
        return (
            <div>
                <Navbar {...this.props} logout={this.props.logout} />
            
                
                <div className="profileContainer">
                {this.state.success ? <Alert className="text-center " style={{ width: "50%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="success" dismissible onClose={this.handleDismiss}> User updated</Alert>: null}
                {this.state.wrongEmail ? <Alert className="text-center " style={{ width: "50%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="danger" dismissible onClose={this.handleDismiss}> Invalid Email Format</Alert>: null}
                {this.state.userDeletedError ? <Alert className="text-center " style={{ width: "50%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="danger" dismissible onClose={this.handleDismiss}> There was an erro deleting the user</Alert>: null}
                {this.state.wrongName ? <Alert className="text-center " style={{ width: "50%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="danger" dismissible onClose={this.handleDismiss}> Wrong Name format</Alert>: null}
                {this.state.wrongPassword ? <Alert className="text-center " style={{ width: "50%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="danger" dismissible onClose={this.handleDismiss}> Password dont match</Alert>: null}
                {this.state.dbError ? <Alert className="text-center " style={{ width: "50%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="danger" dismissible onClose={this.handleDismiss}> Database error</Alert>: null}
                {this.state.weakPassword ? <Alert variant="danger" dismissible onClose={this.handleDismiss}> Weak password. It must have 1 lowerCase, 1 UpperCase, 1 Number or special character, and be at least 8 char long </Alert> : null}
                <DeleteUserModal showDeleteUserModal={this.state.showDeleteUserModal} closeDeleteUserModal={this.closeDeleteUserModal} deleteUser={this.deleteProfile}  />
                
                    <div className="profileCard">
                        <div className="text-center">
                            <p className="profileP">Personal Information</p>
                        </div>

                        <form >
                            <div class="row">
                                <div class="col">
                                    <label for="inputEmail4">First Name</label>
                                    <input type="text" class="form-control" placeholder="First name" name="firstName" value={this.state.firstName} onChange={this.handleChange} />
                                </div>
                                <div class="col">
                                    <label for="inputEmail4">Last Name</label>
                                    <input type="text" class="form-control" placeholder="Last name" name="secondName" value={this.state.secondName} onChange={this.handleChange} />
                                </div>
                            </div>
                            <div class="row" style={{ marginTop: "1vh" }}>
                                <div class="col">
                                    <label for="inputEmail4">Email</label>
                                    <input type="email" class="form-control" placeholder="Email" name="email" value={this.state.email} onChange={this.handleChange} />
                                </div>
                            </div>
                            <div class="row" style={{ marginTop: "1vh" }}>
                                <div class="col">
                                    <label for="inputEmail4">Api Key</label>
                                    <input type="email" class="form-control" placeholder="Api Key" name="apikey" readOnly value={Cookies.get('accesstoken')}  />
                                    <small className="docs" onClick={ () => this.props.history.push('/docs')}>docs</small>
                                </div>
                            </div>
                            <div class="row" style={{ marginTop: "1vh" }}>
                                <div class="col">
                                    <label for="inputEmail4">Password</label>
                                    <input type="password" class="form-control" placeholder="Password" name="password1" value={this.state.password1} onChange={this.handleChange} />
                                    <input type="password" class="form-control" placeholder="Repeat Password" name="password2" value={this.state.password2} onChange={this.handleChange} />
                                </div>
                            </div>
                            <div className="text-center buttonProfileUpdate">
                                <button type="submit" class="btn btn-primary" style={{ marginRight: "0.5vw" }} onClick={this.handleSubmit}>Update</button>
                                <button class="btn btn-danger" onClick={this.showDeleteUserModal} style={{ marginLeft: "0.5vw" }}>Delete Profile</button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        )

    }
}


export default ProfilePage;