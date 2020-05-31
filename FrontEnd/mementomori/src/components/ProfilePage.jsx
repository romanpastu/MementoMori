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

    render() {
        if (this.state.loading == true) {
            return <p>loading...</p>
        }
        return (
            <div>
                <Navbar {...this.props} logout={this.props.logout} />
                <p>{this.state.firstName}</p>
                <p>{this.state.secondName}</p>
                <p>{this.state.email}</p>

            </div>
        )

    }
}


export default ProfilePage;