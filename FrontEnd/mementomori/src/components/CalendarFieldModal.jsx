import React from 'react'
import './CalendarFieldModal.css'
class CalendarFieldModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            emotionRating: this.props.emotionRating
        };

    }


    componentDidUpdate() {
        if (this.state.emotionRating != this.props.emotionRating) {
            this.setState({
                emotionRating: this.props.emotionRating
            })
            console.log("triggered update")
        }
    }

    render() {


        if (!this.props.show) {
            return null;
        }

        return <div className="modalBg">
                <div className="flex-container">
                
                <div id="open-modal" className="modal-window ">
                    <div>
                        <p className="modal-close" onClick={this.props.close}>Close</p>
                        <div className="flex-in-container">
                            <h2>Input a comment about your week {this.props.id}</h2>
                            <textarea placeholder="This week I ..." className="textarea" ></textarea>
                            <h2 >Select a rating for your week</h2>
                            <select className="emotion-selector" value={this.state.emotionRating == 0 ? 0 : this.state.emotionRating} onChange={this.props.handleChange}>
                                <option value="0" disabled hidden>Select a rating</option>
                                <option value="5" >Very Good (5)</option>
                                <option value="4" >Good (4)</option>
                                <option value="3" >Neutral (3)</option>
                                <option value="2" >Bad (2)</option>
                                <option value="1" >Awful (1)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

        </div>


    }
}

export default CalendarFieldModal;