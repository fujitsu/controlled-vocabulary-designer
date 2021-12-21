/**
 * DialogOkCancel.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
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
          <DialogTitle style={
            {position: 'relative', justifyContent: 'flex-end'}
          }>
            {renderTexts()}
                  
          </DialogTitle>
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
