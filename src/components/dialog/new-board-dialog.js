import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert, Button } from 'reactstrap';
import intl from 'react-intl-universal';

class NewBoardDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      boardName: '',
      errMessage: '',
    };
  }

  handleChange = (event) => {
    let value = event.target.value;
    if (value === this.state.boardName) {
      return;
    }
    this.setState({boardName: value});
  };

  toggle = () => {
    this.props.onNewBoardCancel();
  };

  handleSubmit = () => {
    let { boardName } = this.state;
    boardName = boardName.trim();
    if (!boardName) {
      this.setState({errMessage: 'Name_is_required'});
      return;
    }
    this.props.onNewBoardConfirm(boardName);
    this.props.onNewBoardCancel();
  };

  render() {
    return (
      <Modal isOpen={true} toggle={this.toggle} autoFocus={false}>
        <ModalHeader toggle={this.toggle}>{intl.get('New_Board')}</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="boardName">{intl.get('Name')}</Label>
              <Input id="boardName" value={this.state.boardName} innerRef={input => {this.newInput = input;}} onChange={this.handleChange} autoFocus={true} />
              <Input style={{display: 'none'}} />
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

NewBoardDialog.propTypes = {
  onNewBoardConfirm: PropTypes.func,
  onNewBoardCancel: PropTypes.func,
};

export default NewBoardDialog;
