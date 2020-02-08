import React from 'react'
import './CalendarFieldModal.css'
class CalendarFieldModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            emotionRating: 0
        };
        console.log("AAAAAAAAAAAA");
        console.log(this.state.emotionRating)
    }


    render() {


        if (!this.props.show) {
            return null;
        }

        return <div className="modalBg">
            <div className="flex-container">

                <div id="open-modal" className="modal-window ">
                    <div>
                        <p  className="modal-close" onClick={this.props.close}>Close</p>
                        <div className="flex-in-container">
                            <h2>Input a comment about your week {this.props.id}</h2>
                            <textarea placeholder="This week I ..." className="textarea" ></textarea>
                            <h2 >Select a rating for your week</h2>
                            <select className="emotion-selector">
                                <option value="verygood">Very Good (5)</option>
                                <option value="good">Good (4)</option>
                                <option value="neutral">Neutral (3)</option>
                                <option value="bad">Bad (2)</option>
                                <option value="awful">Awful (1)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

        </div>


    }
}

export default CalendarFieldModal;