import React from 'react'
import './LoginPage.css'
class LoginPage extends React.Component {
    constructor(props) {
        super(props)

        this.state = {

        }

    }

    render() {
        return (
            <div className="main">
                <section className="background">
                </section>
                <div class="form">
                    <form className="formIn">
                    <div className="selector">
                        <div className="selectorLogin"><p>Login</p></div>
                        <div className="selectorRegister"><p>Register</p></div>
                    </div>
                    <br></br>
                        <div class="form-group">
                            <label for="exampleInputEmail1">Email address</label>
                            <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" />
                        </div>
                        <div class="form-group">
                            <label for="exampleInputPassword1">Password</label>
                            <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password" />
                        </div>
                        <button type="submit" class="btn btn-primary">Submit</button>
                    </form>
                </div>
            </div>
        )
    }
}

export default LoginPage;