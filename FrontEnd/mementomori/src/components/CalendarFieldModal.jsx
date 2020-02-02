import React from 'react'
import './CalendarFieldModal.css'
class CalendarFieldModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };

    }


    render() {


        if (!this.props.show) {
            return null;
        }
        // return <div className="cube-to-spawn"></div>
        return <div className = "modalBg">
            <div id="open-modal" className="modal-window">
            <div>
                <a title="Close" className="modal-close" onClick={this.props.close}>Close</a>
                <h1>Voilà!</h1>
                <h1>{this.props.id}</h1>
                <div>A CSS-only modal based on the :target pseudo-class. Hope you find it helpful.</div>
                <div><small>Check out</small></div>
            </div>
        </div>
        </div>



    }
}

export default CalendarFieldModal;