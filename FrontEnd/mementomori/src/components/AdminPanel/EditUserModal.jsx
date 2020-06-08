import React from 'react'
import './EditUserModal.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons'
import { Alert } from 'react-bootstrap'

/**
 * Component rendered in the admin panel that renders a modal to edit users.
 * 
 * @component
 * @prop {function} handleDismiss Prop that allows to dismiss the alerts
 * @prop {function} handleSubmit Prop that handles the submitting of the form to edit the users
 * @prop {function} closeEditUserModal Prop that closes the modal
 * @prop {var} showEditUserModal Prop that triggers the rendering of the modal
 * @prop {var} userUpdateErrors Prop that contains the different errors that can happen during the update of the user
 * @prop {var} userInfo Prop that contains the user info
 * @prop {function} handleChange... Props that allows to manage the changes in various inputs
 */

class EditUserModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    render() {
        if (!this.props.showEditUserModal) {
            return null;
        }

        return <div className="modalBg">
            <div className="flex-container">

                <div id="open-modal" className="modal-window-1">
                    <form onSubmit={this.props.handleSubmit}>
                        <FontAwesomeIcon className="headerClose" icon={faTimesCircle} onClick={this.props.closeEditUserModal} />
                        <div style={{ marginTop: "20px" }}>
                            {this.props.userUpdateErrors.success ? <Alert className="text-center " style={{ width: "80%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="success" dismissible onClose={this.props.handleDismiss}>
                                User Updated
                                    </Alert> : null}
                            {this.props.userUpdateErrors.wrongEmail ? <Alert className="text-center " style={{ width: "80%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="danger" dismissible onClose={this.props.handleDismiss}>
                                Wrong Email Format
                                    </Alert> : null}
                            {this.props.userUpdateErrors.wrongName ? <Alert className="text-center " style={{ width: "80%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="danger" dismissible onClose={this.props.handleDismiss}>
                                Invalid names
                                    </Alert> : null}
                            {this.props.userUpdateErrors.wrongPassword ? <Alert className="text-center " style={{ width: "80%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="danger" dismissible onClose={this.props.handleDismiss}>
                                Passwords dont match
                                    </Alert> : null}
                            {this.props.userUpdateErrors.dbError ? <Alert className="text-center " style={{ width: "80%", float: "none", margin: "0 auto", marginBottom: "1vw" }} variant="danger" dismissible onClose={this.props.handleDismiss}>
                                Database error
                                    </Alert> : null}

                        </div>
                        <div class="form-group">
                            <label for="exampleInputEmail1" className="label-color-edit">#</label>
                            <input type="email" name="id" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="User Id" readOnly value={this.props.rowId} />
                        </div>

                        <div class="form-group">
                            <label for="exampleInputEmail1" className="label-color-edit">First Name</label>
                            <input type="name" name="firstName" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter first name" value={this.props.userInfo.firstName} onChange={this.props.handleChangeFirstName} />
                        </div>

                        <div class="form-group">
                            <label for="exampleInputEmail1" className="label-color-edit">Second Name</label>
                            <input type="name" name="secondName" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter Second Name" value={this.props.userInfo.secondName} onChange={this.props.handleChangeSecondName} />
                        </div>


                        <div class="form-group">
                            <label for="exampleInputEmail1" className="label-color-edit">Mail</label>
                            <input type="text" name="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" value={this.props.userInfo.email} onChange={this.props.handleChangeMail} />
                        </div>

                        <div class="form-group emailgroup">
                            <label for="exampleFormControlInput1" className="label-color-edit">New Password</label>
                            <input type="password" class="form-control" placeholder="Input new password" onChange={this.props.handleChangePassword1} />
                            <input type="password" class="form-control" placeholder="Confirm new password" onChange={this.props.handleChangePassword2} style={{ marginTop: "5px" }} />
                        </div>

                        <div className="text-center"><button className="btn btn-primary">Update User</button></div>
                    </form>
                </div>
            </div>
        </div>
    }
}

export default EditUserModal;