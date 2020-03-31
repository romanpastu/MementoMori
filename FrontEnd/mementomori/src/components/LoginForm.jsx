import React from 'react'

class LoginForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            email: "",
            password: "",
            wrongCombo: false,
            serverError: false
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

    handleSubmit = function(event) {
        event.preventDefault();
        
        const { email, password } = this.state;
        
    }

    render() {
        return (
            <div>
                <form>
                <div class="form-group">
                    <label for="exampleInputEmail1">Email address</label>
                    <input type="email" name="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" onChange={this.handleChange}/>
                </div>
                <div class="form-group">
                    <label for="exampleInputPassword1">Password</label>
                    <input type="password" name="password" class="form-control" id="exampleInputPassword1" placeholder="Password" onChange={this.handleChange}/>
                </div>
                <div className="text-center buttonContainer">
                    <button type="submit" class="btn btn-primary" onClick={this.handleSubmit}>Submit</button>
                </div>
                </form>
            </div>
        )
    }
}

export default LoginForm;