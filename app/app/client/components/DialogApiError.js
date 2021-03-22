/**
 * DialogApiError.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';

/**
 * API Error Dialog
 * @extends React
 */
export default class DialogApiError extends React.Component {
  /**
  * Dialog Close Event
  */
  handleClose() {
    this.props.close();
  };

  /**
   * render
   * @return {element}
   */
  render() {
    const apiErrorDialog = this.props.editingVocabulary.apiErrorDialog;
    let errCode = '';
    if (apiErrorDialog.errCode > 0) {
      errCode = 'エラーコード：' + apiErrorDialog.errCode;
    }
    return (
      <Dialog
        onClose={() => this.handleClose()}
        aria-labelledby="dialog-file-upload-error"
        open={this.props.open}>
        <MuiDialogTitle
          disableTypography
          className={this.props.classes.muiDialogTitle}
        >
          <Typography variant="h6">{apiErrorDialog.title}</Typography>
          {this.handleClose ? (
            <IconButton
              aria-label="close"
              className={this.props.classes.muiDialogTitleCloseButton}
              onClick={() => this.handleClose()}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
        </MuiDialogTitle>

        <DialogContent dividers className={this.props.classes.fileUploadDialog}>
          <Typography>{errCode}</Typography>
          <Typography>{apiErrorDialog.errMsg}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.handleClose()} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

DialogApiError.propTypes = {
  editingVocabulary: PropTypes.object,
  open: PropTypes.bool,
  classes: PropTypes.object,
  close: PropTypes.func,
};
