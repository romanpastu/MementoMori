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
    }

    componentDidMount() {
        this.setState({
            fieldId: this.props.weekId,
        });
    }


    showModal() {
        console.log(this.state.showModal)
        

        this.setState({
            showModal: true
        }, () => {
            console.log(this.state.showModal)
        });
        
        
        console.log("clicked show modal")
    }


    closeModal() {
        this.setState({ showModal: false });
    }

    render() {
        var weekId = this.props.weekId;
        
        //current week, round up
        //lived weeks, round down
        //total weeks, round up
        if (weekId < this.props.livedWeeks) {
            return <div id={weekId} className="cube-lived"></div>
        } else if (weekId == this.props.currentWeek) {
            return <div id={weekId} title={weekId} className="cube green" onClick={this.showModal}> 
                  { this.state.showModal ? <CalendarFieldModal /> : null}
            </div>
        } else {
            return <div id={weekId} title={weekId} className="cube white" onClick={this.showModal}>
                { this.state.showModal ? <CalendarFieldModal /> : null}
                 </div>
        }
            

    }
}
export default CalendarFields;