import React from 'react'
// import './CalendarFieldModal.css'
import './styles/CalendarFieldModal.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowClose } from '@fortawesome/free-solid-svg-icons'
import { getUserId } from '../services/userInfo.js'
import API from '../services/axiosObject.js';
import constants from '../constants.js'
import { Alert } from 'react-bootstrap'
class CalendarFieldModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            emotionRating: this.props.emotionRating,
            description: this.props.description,
            originalDescription : "",
            originalEmotionRating: "",
            timesUpdated: 0,
            networkError: false,
            success: false
        };
        this.resetText = this.resetText.bind(this)
        this.onClick = this.onClick.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleDismiss = this.handleDismiss.bind(this)
    }

    

    componentDidMount(){
        //during the loadup of the modal, we save the initial texts and status
        this.setState({
            originalDescription: this.props.description,
            originalEmotionRating: this.props.emotionRating,
            timesUpdated: 0,
            networkError: false,
            success: false
        }, () => {
            
        })
    }

    handleDismiss(){
        this.setState({
            networkError: false,
            success: false
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

    resetText(){
        this.setState({
            description : this.state.originalDescription
        })
    }

    onClick(event){
        this.props.close(this.state.originalEmotionRating, this.state.timesUpdated);
        //This is triggered when closing the modal, if the update button wasnt clicked, then its reseted to the original state
        if(this.state.timesUpdated >= 0){
            console.log("text reseted")
            this.resetText();

        }
        

    }

    handleSubmit(){
        this.setState({
            networkError: false,
            success: false
        })
        const week_number = this.props.id;
        const emotionRating = this.state.emotionRating;
        const description = this.state.description;
        API.post(constants.urlBackend+"/update/field", { week_number, emotionRating, description }).then(response=>{
            if(response.status == 200){
                console.log("saved")
                //If we have saved the element properly, we update the timesSaved so its not 0 anymore
                this.setState({
                    timesUpdated: this.state.timesUpdated +1,
                    originalDescription: this.state.description,
                    originalEmotionRating: this.state.emotionRating,
                    success : true
                })
                
                
            }
        }).catch( err => {
            if(!err.response){
                this.setState({
                    networkError: true
                })
            }
        })
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
                        <p className="modal-close" onClick={this.onClick} ><FontAwesomeIcon icon={faWindowClose} className="buttonCloseModal"/></p>
                        <div className="flex-in-container">
                        {this.state.networkError ? <Alert variant="danger" dismissible onClose={this.handleDismiss}> Network error </Alert> : null}
                        {this.state.success ? <Alert variant="success" dismissible onClose={this.handleDismiss}> Information updated </Alert> : null}
                            <p className="modalText">Input a comment about your week {this.props.id}</p>
                            <div className="centeredEls">
                            <textarea name="description" placeholder="This week I ..." className="textarea form-control" value={this.state.description} rows={"5"} onChange={this.handleChange}></textarea>
                            </div>
                            <p className="modalText ratingText">Select a rating for your week</p>
                            <div className="centeredEls">
                            <select className="emotion-selector custom-select" value={this.state.emotionRating == 0 ? 0 : this.state.emotionRating} onChange={this.props.handleChange}>
                                <option value="0" >Reset</option>
                                <option value="5" >Very Good (5)</option>
                                <option value="4" >Good (4)</option>
                                <option value="3" >Neutral (3)</option>
                                <option value="2" >Bad (2)</option>
                                <option value="1" >Awful (1)</option>
                            </select>
                            </div>
                            <div className="text-center buttonContainer modalButtonContainer">
                            <button type="submit" class="btn btn-primary modalButton" onClick={this.handleSubmit}>Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>


    }
}

export default CalendarFieldModal;