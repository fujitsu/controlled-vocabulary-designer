/**
 * DialogHistory.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

/**
 * Undo/redo execution result display dialog
 * @extends React
 */
export default class DialogHistory extends React.Component {
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
        aria-labelledby="dialog-history"
        open={this.props.open}
      >
        <MuiDialogTitle
          disableTypography
          className={this.props.classes.muiDialogTitle}
        >
          <Typography variant="h6">履歴操作</Typography>
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
          {this.props.historyMessage.split('\n').map((t, i) => {
            return <div key={i}>{t}</div>;
          })}
        </DialogContent>
      </Dialog>
    );
  }
}

DialogHistory.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  classes: PropTypes.object,
  historyMessage: PropTypes.string,
};
