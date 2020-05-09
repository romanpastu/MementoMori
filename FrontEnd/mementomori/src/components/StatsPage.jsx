import React from 'react'
import Navbar from './Navbar'
import MyResponsiveLine from './charts/MyResponsiveLine'

import './StatsPage.css'

class StatsPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [
                {
                    "id": "japan",
                    "color": "hsl(24, 70%, 50%)",
                    "data": [
                        {
                            "x": "plane",
                            "y": 154
                        },
                        {
                            "x": "helicopter",
                            "y": 64
                        },
                        {
                            "x": "boat",
                            "y": 34
                        },
                        {
                            "x": "train",
                            "y": 276
                        },
                        {
                            "x": "subway",
                            "y": 31
                        },
                        {
                            "x": "bus",
                            "y": 80
                        },
                        {
                            "x": "car",
                            "y": 283
                        },
                        {
                            "x": "moto",
                            "y": 13
                        },
                        {
                            "x": "bicycle",
                            "y": 12
                        },
                        {
                            "x": "horse",
                            "y": 9
                        },
                        {
                            "x": "skateboard",
                            "y": 63
                        },
                        {
                            "x": "others",
                            "y": 86
                        }
                    ]
                },
                {
                    "id": "france",
                    "color": "hsl(78, 70%, 50%)",
                    "data": [
                        {
                            "x": "plane",
                            "y": 153
                        },
                        {
                            "x": "helicopter",
                            "y": 142
                        },
                        {
                            "x": "boat",
                            "y": 112
                        },
                        {
                            "x": "train",
                            "y": 49
                        },
                        {
                            "x": "subway",
                            "y": 294
                        },
                        {
                            "x": "bus",
                            "y": 68
                        },
                        {
                            "x": "car",
                            "y": 249
                        },
                        {
                            "x": "moto",
                            "y": 177
                        },
                        {
                            "x": "bicycle",
                            "y": 200
                        },
                        {
                            "x": "horse",
                            "y": 60
                        },
                        {
                            "x": "skateboard",
                            "y": 227
                        },
                        {
                            "x": "others",
                            "y": 211
                        }
                    ]
                },
                {
                    "id": "us",
                    "color": "hsl(249, 70%, 50%)",
                    "data": [
                        {
                            "x": "plane",
                            "y": 280
                        },
                        {
                            "x": "helicopter",
                            "y": 138
                        },
                        {
                            "x": "boat",
                            "y": 138
                        },
                        {
                            "x": "train",
                            "y": 151
                        },
                        {
                            "x": "subway",
                            "y": 21
                        },
                        {
                            "x": "bus",
                            "y": 200
                        },
                        {
                            "x": "car",
                            "y": 273
                        },
                        {
                            "x": "moto",
                            "y": 293
                        },
                        {
                            "x": "bicycle",
                            "y": 271
                        },
                        {
                            "x": "horse",
                            "y": 220
                        },
                        {
                            "x": "skateboard",
                            "y": 259
                        },
                        {
                            "x": "others",
                            "y": 152
                        }
                    ]
                },
                {
                    "id": "germany",
                    "color": "hsl(246, 70%, 50%)",
                    "data": [
                        {
                            "x": "plane",
                            "y": 234
                        },
                        {
                            "x": "helicopter",
                            "y": 215
                        },
                        {
                            "x": "boat",
                            "y": 58
                        },
                        {
                            "x": "train",
                            "y": 105
                        },
                        {
                            "x": "subway",
                            "y": 282
                        },
                        {
                            "x": "bus",
                            "y": 190
                        },
                        {
                            "x": "car",
                            "y": 88
                        },
                        {
                            "x": "moto",
                            "y": 170
                        },
                        {
                            "x": "bicycle",
                            "y": 235
                        },
                        {
                            "x": "horse",
                            "y": 121
                        },
                        {
                            "x": "skateboard",
                            "y": 280
                        },
                        {
                            "x": "others",
                            "y": 76
                        }
                    ]
                },
                {
                    "id": "norway",
                    "color": "hsl(241, 70%, 50%)",
                    "data": [
                        {
                            "x": "plane",
                            "y": 277
                        },
                        {
                            "x": "helicopter",
                            "y": 245
                        },
                        {
                            "x": "boat",
                            "y": 41
                        },
                        {
                            "x": "train",
                            "y": 255
                        },
                        {
                            "x": "subway",
                            "y": 18
                        },
                        {
                            "x": "bus",
                            "y": 38
                        },
                        {
                            "x": "car",
                            "y": 50
                        },
                        {
                            "x": "moto",
                            "y": 83
                        },
                        {
                            "x": "bicycle",
                            "y": 223
                        },
                        {
                            "x": "horse",
                            "y": 132
                        },
                        {
                            "x": "skateboard",
                            "y": 196
                        },
                        {
                            "x": "others",
                            "y": 111
                        }
                    ]
                }
            ]
        }
    }



    render() {

        return (

            <div>
                <Navbar {...this.props} logout={this.props.logout} />
                <div className="nivoChart">
                    {/* <p className="welcomecolor">welcome</p> */}
                    <MyResponsiveLine data={this.state.data} /> 
                </div>
            </div>


        )
    }
}

export default StatsPage