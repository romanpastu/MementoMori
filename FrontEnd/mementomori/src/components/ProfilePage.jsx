import React from 'react'
import './ProfilePage.css'
import Navbar from './Navbar'

class ProfilePage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    render() {
        return (
            <div>
                 <Navbar {...this.props} logout={this.props.logout} /> 
                <p>Hello world</p>
            </div>
        )

    }
}


export default ProfilePage;