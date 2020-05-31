import React from 'react'
import './ProfilePage.css'
import Navbar from './Navbar'
import API from '../services/axiosObject.js'
import constants from '../constants.js'
class ProfilePage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            email: "",
            firstName: "",
            secondName: "",
            password1: "",
            password2: ""
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

    handleSubmit = (evt) =>{
        evt.preventDefault();
        console.log("hola")
    }

    deleteProfile = (evt) =>{
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
                {/* <p>{this.state.firstName}</p>
                <p>{this.state.secondName}</p>
                <p>{this.state.email}</p> */}
                <div className="profileContainer">
                    <div className="profileCard">
                        <div className="text-center">
                            <p className="profileP">Personal Information</p>
                        </div>

                        <form >
                            <div class="row">
                                <div class="col">
                                <label for="inputEmail4">First Name</label>
                                    <input type="text" class="form-control" placeholder="First name" name="firstName" value={this.state.firstName} onChange={this.handleChange}/>
                                </div>
                                <div class="col">
                                <label for="inputEmail4">Last Name</label>
                                    <input type="text" class="form-control" placeholder="Last name" name="secondName" value={this.state.secondName} onChange={this.handleChange}/>
                                </div>
                            </div>
                            <div class="row" style={{marginTop:"1vh"}}>
                                <div class="col">
                                <label for="inputEmail4">Email</label>
                                    <input type="email" class="form-control" placeholder="Email" name="email" value={this.state.email} onChange={this.handleChange}/>
                                </div>
                            </div>
                            <div className="text-center buttonProfileUpdate">
                                <button type="submit" class="btn btn-primary" style={{marginRight:"0.5vw"}} onClick={this.handleSubmit}>Update</button>
                                <button class="btn btn-danger" onClick={this.deleteProfile} style={{marginLeft:"0.5vw"}}>Delete Profile</button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        )

    }
}


export default ProfilePage;