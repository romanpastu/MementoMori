import React from 'react'
import './styles/LoginPage.scss'
import LoginFrom from './LoginForm'
import RegisterForm from './RegisterForm'
import { connect } from "react-redux"

const mapStateToProps = state => {
    return {
        lifeExpectancySet: state.lifeExpectancySet
    }
}

/**
 * Component that contains the Login and Register Form, its the main page for unregistered users , used to acces to the app.
 * 
 * @component
 * @prop {var} lifeExpectancySet Prop received by the LoginPage from the global redux state, which allows to check if the life expectancy has already been set
 * @prop {var} authed Prop received by the LoginPage that allows to check if the user is already authed
 * @prop {function} login Prop passed down to the login form child component
 */

class LoginPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            displayLogin: true,
            lifeExpectancySet: true
        }
        this.displayLogin = this.displayLogin.bind(this);
        this.displayRegister = this.displayRegister.bind(this);
    }

    componentDidMount() {

        if (this.props.authed == true && this.props.lifeExpectancySet == true) {
            this.props.history.push('/lifeExpectancy');
        } else if (this.props.lifeExpectancySet == false && this.props.authed == false) {
            this.props.history.push('/lifeExpectancy')
        } else if (this.props.authed == true && this.props.lifeExpectancySet == false) {
            this.props.history.push('/lifeExpectancy')
        }

    }

    displayLogin() {
        this.setState({
            displayLogin: true
        })
    }

    displayRegister() {
        this.setState({
            displayLogin: false
        })
    }

    render() {
        var selectedRegister = ""
        var selectedLogin = ""
        if(this.state.displayLogin){
            selectedLogin = "selectorLogin selectorLoginSelected"
            selectedRegister= "selectorRegister"
        }else{
            selectedLogin = "selectorLogin"
            selectedRegister= "selectorRegister selectorRegisterSelected"
        }
        
        return (<div>
            <div className="blurredBg"></div>
            <div class="formContainer">
                <div className="titleContainer">
                    <p class="title">MementoMori</p>
                </div>
                <div className="formIn">
                    <div className="selectorContainer">
                        <div className={selectedLogin} onClick={this.displayLogin}>Login</div>
                        <div className={selectedRegister} onClick={this.displayRegister}>Register</div>
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
                    {this.state.displayLogin ? <LoginFrom login={this.props.login} /> : <RegisterForm login={this.props.login} {...this.props} />}
                </div>
            </div>
        </div>
        )
    }
}

export default connect(mapStateToProps)(LoginPage)