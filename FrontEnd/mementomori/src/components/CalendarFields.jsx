import React from 'react'
import './CalendarFields.css'
import CalendarFieldModal from './CalendarFieldModal'

class CalendarFields extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fieldId: "",
            description: this.props.description,
            showModal: false,
            emotionRating:  this.props.rating,
            //   emotionRating:  Math.floor(Math.random() * 5) + 1 
        };
        //console.log(props) //week number, beginning with 0
        this.showModal = this.showModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        
        this.setState({
            fieldId: this.props.weekId
        }, () => {
            // console.log("initial show modal state")
            // console.log(this.state.showModal)
        });
    }


    showModal() {
        // console.log("showmodal state before any click")
        // console.log(this.state.showModal)
        this.setState({
            showModal: true
        }, () => {
            // console.log("clicked show modal")
            // console.log(this.state.showModal)
        });

    }


    closeModal(el) {
        console.log("el")
        console.log(el)
        this.setState({
            showModal: false,
            emotionRating: el
        }, () => {
            // console.log("clicked closeModal")
            // console.log(this.state.showModal)
        });
    }

    handleChange(event){
        this.setState({ 
            emotionRating: event.target.value 
        }, () => {
             console.log("emotion state after change")
            console.log(this.state.emotionRating)
        });
       console.log("triggered")
    }



    render() {
        var weekId = this.props.weekId;

        //current week, round up
        //lived weeks, round down
        //total weeks, round up
        if (weekId < this.props.weeksToRegisterDate) {
            return <div id={weekId} className="cube-lived"></div>
        } else {
            if(this.state.emotionRating == 0){
                var currentStyle = (weekId == this.props.currentWeek) ? " white" /*replace this to green to return the green indicator*/: "white";
            }else if(this.state.emotionRating == 1){
                var currentStyle = (weekId == this.props.currentWeek) ? "rating1" /*replace this to green to return the green indicator*/ : "rating1";
            }else if(this.state.emotionRating == 2){
                var currentStyle = (weekId == this.props.currentWeek) ? " rating2" /*replace this to green to return the green indicator*/: "rating2";
            }else if(this.state.emotionRating == 3){
                var currentStyle = (weekId == this.props.currentWeek) ? " rating3" /*replace this to green to return the green indicator*/: "rating3";
            }else if(this.state.emotionRating == 4){
                var currentStyle = (weekId == this.props.currentWeek) ? " rating4" /*replace this to green to return the green indicator*/: "rating4";
            }else if(this.state.emotionRating == 5){
                var currentStyle = (weekId == this.props.currentWeek) ? " rating5" /*replace this to green to return the green indicator*/: "rating5";
            }
            // const currentStyle = (weekId == this.props.currentWeek) ? "green" : "white"; {/*Uncomment this to return the green indicator*/}
            var style = "cube " + currentStyle;
            

            return <div id={weekId} title={weekId} className={style}
                {...(!this.state.showModal && { onClick: this.showModal })}
            >
                
                {weekId == this.props.currentWeek ? <div className="cross " ></div> : <div className="cube-white"></div> } {/*Remove this to return the green indicator*/}
                <CalendarFieldModal show={this.state.showModal} close={this.closeModal} id={weekId} emotionRating={this.state.emotionRating} description={this.state.description} handleChange={this.handleChange} />
            </div>
        }


    }
}
export default CalendarFields;