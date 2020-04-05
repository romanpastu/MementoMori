import React from 'react'
import axios from 'axios'
import constants from '../constants.js'
import qs from 'qs'
class RegisterForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            email: "",
            firstName: "",
            secondName: "",
            password1: "",
            password2: "",
            birthDate: ""
        }
        this.handleSubmit = this.handleSubmit.bind(this)
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
        event.preventDefault();
        const {email, firstName, secondName, password2, birthDate} = this.state;

        console.log(email,firstName,secondName,password2,birthDate)
        console.log("submited")

        axios({
            method: 'post',
            url: constants.urlBackend + "/register",
            data: qs.stringify({ email, firstName, secondName, password2, birthDate }),
            headers: {
              'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
          }).then((res) => {
              console.log(email)
              console.log(password2)
             this.props.login(email,password2, "register").
             then((data) => {
                 console.log("despues de hacer el login")
                 
                  console.log(data)
             }).catch((err) => {
                  console.log(err)
             })
            
             console.log(res)
        })}

    render() {
        return (
            <div>
                <form>
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


export default RegisterForm;