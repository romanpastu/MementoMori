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

        return <div className="modalBg">
            <div className="flex-container">
                
            <div id="open-modal" className="modal-window ">
                 <div>
                    <a title="Close" className="modal-close" onClick={this.props.close}>Close</a>
                    <h1>Voilà!</h1>
                    <h1>{this.props.id}</h1>
                    <div className="text"> Lorem ipsum dolor, sit amet consectetur adipisicing elit. Autem eligendi, dicta dolorem facilis consequuntur nam qui quia cupiditate corporis sunt eaque. Excepturi, vel esse voluptates officiis sed iure nemo quaerat. Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi ducimus animi eum deserunt, adipisci neque aspernatur obcaecati minus illum iure dolor voluptates perferendis? Commodi quod, numquam optio consequuntur quibusdam facilis.</div>
                    <div><small>Check out</small></div>
                </div> 
            </div>
            </div>
            
        </div>






    }
}

export default CalendarFieldModal;