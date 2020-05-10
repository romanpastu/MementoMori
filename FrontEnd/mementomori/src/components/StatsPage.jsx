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
            dataLinealEmotion: [],
            loadedDataLinealEmotion: false,
            dataCumulativeEmotion : [],
            loadedDataCumulativeEmotion: false,
            dataCumulativeMaxPotentialEmotion: [],
            loadedDataCumulativeMaxPotentialEmotion: false,
        }
    }

    componentDidMount() {
        console.log("api")
        API.get('/chart/lineal/emotion/' + getUserId()).then(response => {
            // console.log(response.data[0])
            this.setState({
                dataLinealEmotion: response.data
            }, () => {
                this.setState({
                    loadedDataLinealEmotion: true
                })
            }
            )
        })
        API.get('/chart/cumulative/emotion/' + getUserId()).then(response => {
            // console.log(response.data[0])
            this.setState({
                dataCumulativeEmotion: response.data
            }, () => {
                this.setState({
                    loadedDataCumulativeEmotion: true
                })
            }
            )
        })
        API.get('/chart/cumulative-maxpotential/emotion/' + getUserId()).then(response => {
            // console.log(response.data[0])
            this.setState({
                dataCumulativeMaxPotentialEmotion: response.data
            }, () => {
                console.log(this.state.dataCumulativeMaxPotentialEmotion)
                this.setState({
                    loadedDataCumulativeMaxPotentialEmotion: true
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
                    {this.state.loadedDataLinealEmotion ? <MyResponsiveLine id="lineal-emotion-chart" data={this.state.dataLinealEmotion} axisBottom={{
                        orient: 'bottom',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Lineal emotion',
                        legendOffset: 36,
                        legendPosition: 'middle'
                    }} /> : null}
                    {this.state.loadedDataCumulativeEmotion ? <MyResponsiveLine id="cumulative-emotion-chart" data={this.state.dataCumulativeEmotion} axisBottom={{
                        orient: 'bottom',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Cumulative emotion',
                        legendOffset: 36,
                        legendPosition: 'middle'
                    }} /> : null}
                    {this.state.loadedDataCumulativeMaxPotentialEmotion ? <MyResponsiveLine id="cumulative-emotion-chart" data={this.state.dataCumulativeMaxPotentialEmotion} axisBottom={{
                        orient: 'bottom',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Cumulative emotion vs max potential cumulative emotion',
                        legendOffset: 36,
                        legendPosition: 'middle'
                    }} /> : null}
                </div>
            </div>


        )
    }
}

export default StatsPage