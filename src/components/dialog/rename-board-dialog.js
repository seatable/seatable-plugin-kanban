import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';

class RenameBoardDialog extends Component {

  constructor(props) {
    super(props);
    this.state = {
      boardName: props.boardName || '',
      errMessage: ''
    };
  }

  handleChange = (event) => {
    let { boardName } = this.state;
    let value = event.target.value;
    if (value === boardName) {
      return;
    } else {
      this.setState({boardName: value});
    }
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.handleSubmit();
      return false;
    }
  }

  handleSubmit = () => {
    let { boardName } = this.state;
    boardName = boardName.trim();
    if (!boardName) {
      this.setState({errMessage: 'Name_is_required'});
      return;
    }
    this.props.onRenameBoard(boardName);
    this.props.hideRenameBoardDialog();
  }

  toggle = () => {
    this.props.hideRenameBoardDialog();
  }

  render() {
    return (
      <Modal isOpen={true} toggle={this.toggle} autoFocus={false}>
        <ModalHeader toggle={this.toggle}>{intl.get('Rename_board')}</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="boardName">{intl.get('Name')}</Label>
              <Input id="boardName" autoFocus={true} value={this.state.boardName}
                onChange={this.handleChange} onKeyDown={this.handleKeyDown} />
            </FormGroup>
          </Form>
          {this.state.errMessage && <Alert color="danger" className="mt-2">{intl.get(this.state.errMessage)}</Alert>}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.toggle}>{intl.get('Cancel')}</Button>
          <Button color="primary" onClick={this.handleSubmit}>{intl.get('Submit')}</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

RenameBoardDialog.propTypes = {
  boardName: PropTypes.string,
  onRenameBoard: PropTypes.func,
  hideRenameBoardDialog: PropTypes.func,
};

export default RenameBoardDialog;