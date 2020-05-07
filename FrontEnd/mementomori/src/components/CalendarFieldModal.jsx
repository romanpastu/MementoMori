import React from 'react'
import './CalendarFieldModal.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowClose } from '@fortawesome/free-solid-svg-icons'
import { getUserId } from '../services/userInfo.js'
import API from '../services/axiosObject.js';
import constants from '../constants.js'

class CalendarFieldModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            emotionRating: this.props.emotionRating,
            description: this.props.description,
            originalDescription : "",
            originalEmotionRating: "",
            timesUpdated: 0
        };
        this.resetText = this.resetText.bind(this)
        this.onClick = this.onClick.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    

    componentDidMount(){
        this.setState({
            originalDescription: this.props.description,
            originalEmotionRating: this.props.emotionRating,
            timesUpdated: 0
        }, () => {
            
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
        if(this.state.timesUpdated == 0){
            this.resetText();

        }
        

    }

    handleSubmit(){
        const userId = getUserId();
        const week_number = this.props.id;
        const emotionRating = this.state.emotionRating;
        const description = this.state.description;
        API.post(constants.urlBackend+"/update/field", { week_number, userId, emotionRating, description }).then(response=>{
            if(response.status == 200){
                console.log("guardado")
                this.setState({
                    timesUpdated: this.state.timesUpdated +1
                })
            }
        })
        console.log("ole")
    }


    componentDidUpdate() {
        if (this.state.emotionRating != this.props.emotionRating) {
            this.setState({
                emotionRating: this.props.emotionRating
            })
            console.log("triggered update")
        }
        //  if(this.state.description != this.props.description){
        //      this.setState({
        //         description: this.props.description
        //      }, () =>{
        //          console.log("updated but "+this.state.description)
        //      })
        //  }
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
                            <p className="modalText">Input a comment about your week {this.props.id}</p>
                            <div className="centeredEls">
                            <textarea name="description" placeholder="This week I ..." className="textarea form-control" value={this.state.description} rows={"5"} onChange={this.handleChange}></textarea>
                            </div>
                            <p className="modalText ratingText">Select a rating for your week</p>
                            <div className="centeredEls">
                            <select className="emotion-selector custom-select" value={this.state.emotionRating == 0 ? 0 : this.state.emotionRating} onChange={this.props.handleChange}>
                                <option value="0" disabled hidden>Select a rating</option>
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