import React from 'react'
import './ProfilePage.css'
import Navbar from './Navbar'
import API from '../services/axiosObject.js'
import constants from '../constants.js'
import { Alert } from 'react-bootstrap'
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
            dbError: false

        }
    }

    componentDidMount() {
        API.get(constants.urlBackend + '/user/info/').then(res => {
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
            dbError: false
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
            dbError: false
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
            }
        })
    }

    deleteProfile = (evt) => {
        evt.preventDefault();
        console.log("deleting")
    }

    render() {
        if (this.state.loading == true) {
            return <p>loading...</p>
        }
        return (
            <div>
                <Navbar {...this.props} logout={this.props.logout} />
            
                
                <div className="profileContainer">
                {this.state.success ? <Alert className="text-center " style={{ width: "50%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="success" dismissible onClose={this.handleDismiss}> User updated</Alert>: null}
                {this.state.wrongEmail ? <Alert className="text-center " style={{ width: "50%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="danger" dismissible onClose={this.handleDismiss}> Invalid Email Format</Alert>: null}
                {this.state.wrongName ? <Alert className="text-center " style={{ width: "50%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="danger" dismissible onClose={this.handleDismiss}> Wrong Name format</Alert>: null}
                {this.state.wrongPassword ? <Alert className="text-center " style={{ width: "50%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="danger" dismissible onClose={this.handleDismiss}> Password dont match</Alert>: null}
                {this.state.dbError ? <Alert className="text-center " style={{ width: "50%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="danger" dismissible onClose={this.handleDismiss}> Database error</Alert>: null}
                
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
                                    <label for="inputEmail4">Password</label>
                                    <input type="password" class="form-control" placeholder="Password" name="password1" value={this.state.password1} onChange={this.handleChange} />
                                    <input type="password" class="form-control" placeholder="Repeat Password" name="password2" value={this.state.password2} onChange={this.handleChange} />
                                </div>
                            </div>
                            <div className="text-center buttonProfileUpdate">
                                <button type="submit" class="btn btn-primary" style={{ marginRight: "0.5vw" }} onClick={this.handleSubmit}>Update</button>
                                <button class="btn btn-danger" onClick={this.deleteProfile} style={{ marginLeft: "0.5vw" }}>Delete Profile</button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        )

    }
}


export default ProfilePage;