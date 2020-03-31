import React from 'react'
import './LoginPage.css'
import LoginFrom from './LoginForm'
import RegisterForm from './RegisterForm'
class LoginPage extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            displayLogin: true
            
        }
        this.displayLogin = this.displayLogin.bind(this);
        this.displayRegister = this.displayRegister.bind(this);
    }

    displayLogin(){
        this.setState({
            displayLogin:true
        })
    }

    displayRegister(){
        this.setState({
            displayLogin:false
        })
    }

    render() {
        return (<div>
            <div className="blurredBg"></div>
                <div class="formContainer">
                    <div className="titleContainer">
                        <p class="title">MementoMori</p>
                    </div>
                    <div className="formIn">
                        <div className="selectorContainer">
                            <div className="selectorLogin" onClick={this.displayLogin}>Login</div>
                            <div className="selectorRegister" onClick={this.displayRegister}>Register</div>
                        </div>
                        <br></br>
                        {/* <div class="form-group">
                            <label for="exampleInputEmail1">Email address</label>
                            <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" />
                        </div>
                        <div class="form-group">
                            <label for="exampleInputPassword1">Password</label>
                            <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password" />
                        </div>
                        <div className="text-center buttonContainer">
                            <button type="submit" class="btn btn-primary">Submit</button>
                        </div> */}
                        {this.state.displayLogin ? <LoginFrom /> : <RegisterForm/>}
                    </div>
                </div>
                </div>
        )
    }
}

export default LoginPage;