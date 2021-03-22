/**
 * DialogSearchTermError.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import WarningIcon from '@material-ui/icons/Warning';
import CloseIcon from '@material-ui/icons/Close';

/**
 * Search error dialog
 * @extends React
 */
export default class DialogSearchTermError extends React.Component {
  /**
   * Dialog close event
   */
  handleClose() {
    this.props.onClose();
  };

  /**
   * render
   * @return {element}
   */
  render() {
    return (
      <Dialog
        onClose={() => this.handleClose()}
        aria-labelledby="dialog-search-term-error"
        open={this.props.open}
      >
        <MuiDialogTitle
          disableTypography
          className={this.props.classes.muiDialogTitle}
        >
          <Typography variant="h6">エラー</Typography>
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

        <DialogContent dividers>
          <DialogContentText id="dialog-search-term-error-content-title">
            <WarningIcon/>
            「{this.props.term}」は存在しません
          </DialogContentText>
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

DialogSearchTermError.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  classes: PropTypes.object,
  term: PropTypes.string,
};
