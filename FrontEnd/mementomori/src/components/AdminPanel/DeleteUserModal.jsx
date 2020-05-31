import React from 'react'
import './DeleteUserModal.css'

class DeleteUserModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    render() {
        if (!this.props.showDeleteUserModal) {
            return null;
        }

        return <div className="modalBg">
            <div className="flex-container">

                <div id="open-modal" className="modal-window">

                    {/* {this.props.userDeleted ? <Alert className="alertRegister userDeleted" variant="success" dismissible onClose={this.props.handleDismiss}>
                        User deleted properly
                                    </Alert> : null}
                    {this.props.userDeletedError ? <Alert className="alertRegister userDeleted" variant="danger" dismissible onClose={this.props.handleDismiss}>
                        Error deleting the user
                                    </Alert> : null} */}
                    <h6 className="text-center deleteText">Are you sure that you want to delete the user?</h6>
                    <div className="text-center">
                        <button class="btn btn-danger btnDel"onClick={() => this.props.deleteUser()}>
                            Delete user
                        </button>
                        <button class="btn btn-primary btnDel" onClick={() => this.props.closeDeleteUserModal()}>Cancel</button>
                    </div>

                </div>
            </div>
        </div>
    }
}

export default DeleteUserModal;