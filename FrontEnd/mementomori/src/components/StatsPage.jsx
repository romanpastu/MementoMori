import React from 'react'
import Navbar from './Navbar'
import MyResponsiveLine from './charts/MyResponsiveLine'
import store from "../redux/store/reduxStore.js"
import API from '../services/axiosObject.js';
import { getUserId } from '../services/userInfo.js'
import './StatsPage.css'

class StatsPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            loaded: false
        }
    }

    componentDidMount(){
        console.log("api")
        API.get('/chart/lineal/emotion/'+getUserId()).then( response =>{
            console.log(response.data[0])
            this.setState({
                data: response.data
            }, () => {
                this.setState({
                    loaded:true
                })
            }
                )
        })
        // console.log("did mount del stats")
        // console.log(store.getState().currentWeek)
    }



    render() {

        return (

            <div>
                <Navbar {...this.props} logout={this.props.logout} />
                <div className="nivoChart">
                    {/* <p className="welcomecolor">welcome</p> */}
                    {this.state.loaded ?<MyResponsiveLine id="lineal-emotion-chart" data={this.state.data} /> :null}
                     
                </div>
            </div>


        )
    }
}

export default StatsPage