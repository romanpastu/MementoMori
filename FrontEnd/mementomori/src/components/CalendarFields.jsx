import React from 'react'
import './CalendarFields.css'
import CalendarFieldModal from './CalendarFieldModal'

class CalendarFields extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fieldId: "",
            rating: -1,
            description: "",
            showModal: false
        };
        console.log(props) //week number, beginning with 0
        this.showModal = this.showModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    componentDidMount() {
        this.setState({
            fieldId: this.props.weekId,
        }, () => {
            // console.log("initial show modal state")
            // console.log(this.state.showModal)
        });
    }


    showModal() {
        console.log("showmodal state before any click")
        console.log(this.state.showModal)


        this.setState({
            showModal: true
        }, () => {
            console.log("clicked show modal")
            console.log(this.state.showModal)
        });



    }

    closeModal() {
        this.setState({
            showModal: false
        }, () => {
            console.log("clicked closeModal")
            console.log(this.state.showModal)
        });
    }



    render() {
        var weekId = this.props.weekId;

        //current week, round up
        //lived weeks, round down
        //total weeks, round up
        if (weekId < this.props.weeksToRegisterDate) {
            return <div id={weekId} className="cube-lived"></div>
        } else {
            const currentStyle = (weekId == this.props.currentWeek) ? "green" : "white";
            var style = "cube "+ currentStyle;
            return <div id={weekId} title={weekId} className={style}
                {...(!this.state.showModal && { onClick: this.showModal })}
            >
                <CalendarFieldModal show={this.state.showModal} close={this.closeModal} id={weekId}/>
            </div>
        }


    }
}
export default CalendarFields;