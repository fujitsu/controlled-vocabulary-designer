/**
 * DialogSelectPreferred.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

/**
 * Select a representative word when setting synonyms dialog
 * @extends React
 */
export default class DialogSelectPreferred extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {
      selectPreferred: '',
    };
  }

  /**
  * Dialog close event
  */
  handleClose() {
    this.setState({
      selectPreferred: '',
    });
    this.props.onClose();
  };

  /**
   * initialization
   */
  initPreferred() {    
    this.setState({ selectPreferred: this.props.sourceTerm });
  }


   /**
   * Preferred label change event
   * @param  {object} e - information of event
   */
  changePreferred(e) {
    this.setState({ selectPreferred: e.target.value });    
  }

  /**
   * Perform synonym settings 
   */
  execSetSynonym() {
    this.props.onSelectPreferred( this.state.selectPreferred);
    this.props.onClose();
  }

  /**
   * render
   * @return {element}
   */
  render() {

    return (
      <div>
        <Dialog
          onClose={() => this.handleClose()}
          open={this.props.open}
          onEntered={() => this.initPreferred()}
        >
          <DialogTitle style={
            {position: 'relative', justifyContent: 'flex-end'}
          }>
            「{this.props.sourceTerm}」　の同義語に 「{this.props.targetTerm}」　を設定します<br/>

            代表語を選択してください
          </DialogTitle>
          <DialogContent style={{width: '450px',overflow: 'hidden'}}>
            <Box component="div" display="block" >

              <FormControl
                variant="outlined"
                className={this.props.classes.formControl}
              >
                <Select
                  native
                  value={this.state.selectPreferred}
                  onChange={(e) => this.changePreferred(e)}
                  className={this.props.classes.selectFileFormat}
                >
                  {this.props.preferredList.map((item, i) => (
                    <option key={i} value={item}>{item}</option>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.execSetSynonym()} color="primary">
            OK
            </Button>
            <Button onClick={() => this.handleClose()} color="primary">
            Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

DialogSelectPreferred.propTypes = {
  onClose: PropTypes.func,  
  onSelectPreferred: PropTypes.func,  
  open: PropTypes.bool,
  classes: PropTypes.object,
  editingVocabulary: PropTypes.object,  
  preferredList:PropTypes.array,
  sourceTerm: PropTypes.string,
  targetTerm: PropTypes.string,
};
