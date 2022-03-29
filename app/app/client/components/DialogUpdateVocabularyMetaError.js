/**
 * DialogUpdateVocabularyMetaError.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
/**
 * error dialog
 * @extends React
 */
export default class DialogUpdateVocabularyMetaError extends React.Component {  
  
  /**
  * constructor
  * @param {object} props
  */
  constructor(props) {
    super(props);
  }

  /**
   * Dialog close event
   */
  handleClose() {
    this.props.onClose();
  };


  /**
   * get error message
   * 
   * @returns {string}
   */
  getErrorMessage(){

    const editingVocabularyMeta = this.props.editingVocabularyMeta;

  }
  
  /**
   * render
   * @return {element}
   */
  render() {
    
    const errorMsg = this.getErrorMessage();

    return (
      <Dialog
        onClose={() => this.handleClose()}
        aria-labelledby="dialog-vocabulary-error" 
        open={this.props.open}
      >
        <DialogTitle className={this.props.classes.closeTitle}>
          <IconButton
            aria-label="close"
            onClick={() => this.handleClose()}
            className={this.props.classes.closeButton}
          >
            <CloseIcon />            
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            {errorMsg}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    );
  }
}

DialogUpdateVocabularyMetaError.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  classes: PropTypes.object,
  editingVocabulary: PropTypes.object,
  editingVocabularyMeta: PropTypes.object,
  isFromEditPanel: PropTypes.bool,
  reason: PropTypes.string,
};
