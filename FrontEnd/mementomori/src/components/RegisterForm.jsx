import React from 'react'
import axios from 'axios'
import constants from '../constants.js'
import qs from 'qs'
import { connect } from "react-redux";
import { lifeExpectancySet } from "../redux/actions/reduxActions.js"
import { Alert } from 'react-bootstrap'
function mapDispatchToProps(dispatch) {
    return {
        lifeExpectancySet: element => dispatch(lifeExpectancySet(element))
    }
}

class RegisterForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            email: "",
            firstName: "",
            secondName: "",
            password1: "",
            password2: "",
            birthDate: "",
            passwordsMustBeEqual: false,
            wrongEmail: false,
            noFirstName: false,
            wrongDate : false,
            noDate: false,
            noPassword: false,
            weakPassword: false

        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleDismiss = this.handleDismiss.bind(this)
    }

    handleChange = (evt) => {
        const target = evt.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });

    }

    handleSubmit = function (event) {
        this.setState({
            passwordsMustBeEqual: false,
            wrongEmail: false,
            noFirstName: false,
            wrongDate: false,
            noDate: false,
            noPassword: false,
            weakPassword: false
        })
        event.preventDefault();
        const { email, firstName, secondName, password1, password2, birthDate } = this.state;

        console.log(email, firstName, secondName, password2, birthDate)
        console.log("submited")

        axios({
            method: 'post',
            url: constants.urlBackend + "/register",
            data: qs.stringify({ email, firstName, secondName, password1, password2, birthDate }),
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }).then((res) => {
            console.log(email)
            console.log(password2)
            this.props.lifeExpectancySet(true)
            this.props.login(email, password2, "register").
                then((data) => {
                    console.log("despues de hacer el login")

                    console.log(data)
                }).catch((err) => {
                    console.log(err)
                })

            console.log(res)
        }).catch((err) => {
            if (err.response.status == 400) {
                this.setState({
                    passwordsMustBeEqual: true
                })
            }else if (err.response.status == 401){
                this.setState({
                    wrongEmail: true
                })
            }else if (err.response.status == 402){
                this.setState({
                    noFirstName: true
                })
            }else if (err.response.status == 403){
                this.setState({
                    wrongDate: true
                })
            }
            else if (err.response.status == 404){
                this.setState({
                    noDate: true
                })
            }else if (err.response.status == 405){
                this.setState({
                    noPassword: true
                })
            }else if(err.response.status == 406){
                this.setState({
                    weakPassword: true
                })
            }
            console.log("el error")
            console.log(err)
        })
    }
    handleDismiss(){
        this.setState({
            passwordsMustBeEqual: false,
            wrongEmail: false,
            noFirstName: false,
            wrongDate: false,
            noDate: false,
            noPassword: false,
            weakPassword: false
        })
    }

    render() {
        return (
            <div>
                <form>
                {this.state.passwordsMustBeEqual ? <Alert variant="danger" dismissible onClose={this.handleDismiss}> Passwords must be equal </Alert> : null}
                {this.state.wrongEmail ? <Alert variant="danger" dismissible onClose={this.handleDismiss}> Wrong email </Alert> : null}
                {this.state.noFirstName ? <Alert variant="danger" dismissible onClose={this.handleDismiss}> You must input a first name </Alert> : null}
                {this.state.wrongDate ? <Alert variant="danger" dismissible onClose={this.handleDismiss}> Invalid Date </Alert> : null}
                {this.state.noDate ? <Alert variant="danger" dismissible onClose={this.handleDismiss}> Theres no date </Alert> : null}
                {this.state.noPassword ? <Alert variant="danger" dismissible onClose={this.handleDismiss}> Theres no password </Alert> : null}
                {this.state.weakPassword ? <Alert variant="danger" dismissible onClose={this.handleDismiss}> Weak password. It must have 1 lowerCase, 1 UpperCase, 1 Number or special character, and be at least 8 char long </Alert> : null}
                    <div class="form-group">
                        <label for="exampleInputEmail1">Email address</label>
                        <input type="email" name="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" onChange={this.handleChange} />
                    </div>
                    <div class="form-group">
                        <label for="exampleInputEmail1">First Name</label>
                        <input type="text" name="firstName" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter First Name" onChange={this.handleChange} />
                    </div>
                    <div class="form-group">
                        <label for="exampleInputEmail1">Second Name</label>
                        <input type="text" name="secondName" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter Second Name" onChange={this.handleChange} />
                    </div>
                    <div class="form-group">
                        <label for="exampleInputPassword1">Password</label>
                        <input type="password" name="password1" class="form-control" id="exampleInputPassword1" placeholder="Password" onChange={this.handleChange} />
                    </div>
                    <div class="form-group">
                        <input type="password" name="password2" class="form-control" id="exampleInputPassword1" placeholder="Confirm Password" onChange={this.handleChange} />
                    </div>
                    <div class="form-group">
                        <label for="exampleInputPassword1">Birth Date</label>
                        <input type="date" name="birthDate" class="form-control" id="exampleInputPassword1" placeholder="Confirm Password" onChange={this.handleChange} />
                    </div>

                    <div className="text-center buttonContainer">
                        <button type="submit" class="btn btn-primary buttonLogin" onClick={this.handleSubmit}>Submit</button>
                    </div>
                </form>
            </div>
        )
    }
}


export default connect(null, mapDispatchToProps)(RegisterForm);