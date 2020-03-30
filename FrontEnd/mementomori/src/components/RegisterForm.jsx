import React from 'react'

class RegisterForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    render(){
        return (
            <div>
                <div class="form-group">
                    <label for="exampleInputEmail1">Email address</label>
                    <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" />
                </div>
                <div class="form-group">
                    <label for="exampleInputEmail1">First Name</label>
                    <input type="text" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter First Name" />
                </div>
                <div class="form-group">
                    <label for="exampleInputEmail1">Second Name</label>
                    <input type="text" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter Second Name" />
                </div>
                <div class="form-group">
                    <label for="exampleInputPassword1">Password</label>
                    <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password" />
                </div>
                <div class="form-group">
                    <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Confirm Password" />
                </div>
                <div class="form-group">
                    <label for="exampleInputPassword1">Birth Date</label>
                    <input type="date" class="form-control" id="exampleInputPassword1" placeholder="Confirm Password" />
                </div>
                
                <div className="text-center buttonContainer">
                    <button type="submit" class="btn btn-primary">Submit</button>
                </div>
            </div>
        )
    }
}


export default RegisterForm;