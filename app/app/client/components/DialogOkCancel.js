/**
 * DialogOkCancel.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';

/**
 * ok / cancel dialog
 * @extends React
 */
export default class DialogOkCancel extends React.Component {

  /**
   * render
   * @return {element}
   */
  render() {
    
    const renderTexts = () => {
      if (typeof(this.props.message) === "string") {
        return this.props.message.split("\n").map((m,i) => <span key={i}>{m}<br/></span>)
      } else {
        return "";
      }
    }
    return (
      <div>
        <Dialog
          onClose={() => this.props.onCancel()}
          open={this.props.open}
        >
          <DialogTitle className={this.props.classes.closeTitle}>
            <IconButton
              aria-label="close"
              onClick={() => this.props.onCancel()}
              className={this.props.classes.closeButton}
            >
              <CloseIcon />            
            </IconButton>
          </DialogTitle>
          
          <DialogContent dividers>          
            {renderTexts()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.props.onOkClose()} color="primary">
            OK
            </Button>
            <Button onClick={() => this.props.onCancel()} color="primary">
            Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

DialogOkCancel.propTypes = {
  onOkClose: PropTypes.func,  
  onCancel: PropTypes.func,  
  open: PropTypes.bool,
  classes: PropTypes.object,
  message: PropTypes.string,
};
