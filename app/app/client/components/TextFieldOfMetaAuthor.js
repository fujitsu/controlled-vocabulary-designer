/**
 * TextFieldOfMetaAuthor.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
// import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import $ from 'jquery';

import EditPanelChipForSynonym from './EditPanelChipForSynonym';

import {observer} from 'mobx-react';

/**
 * Meta author text filed component
 * @extends React
 */
export default
@observer class TextFieldOfMetaAuthor extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {
      open: false, 
      message: '',
    };
  }

  /**
   * Warning displaying snackbar events
   * @param {String} errorMsg - error message
   */
  openSnackbar(errorMsg) {
    this.setState({open: true, message: errorMsg});
  }

  /**
   * Warning hiding snackbar event
   */
  handleClose() {
    this.setState({open: false, message: ''});
  };

  /**
   * Meta author update event
   * @param  {object} event - information of event
   * @param  {array} newValue - list of meta author
   */
  onChange(event, newValue) {
    this.props.change( event.target.value);
  }

  /**
   * render
   * @return {element}
   */
  render() {

    const bgcolor = this.props.disabled?'rgba(0, 0, 0, 0.09)':'rgba(0, 0, 0, 0)';
    const tmpMetaAuthor = this.props.value;

    return (
      <div>
        <form noValidate autoComplete="off">
          <Grid item xs={12}>
            {/* [ inputTextWrap ] - declared a global class to take advantage of WebKit's CSS extensions */}
            <Box border={1} className='inputTextWrap'>      
              <div className={this.props.classes.inputTextItem}>
                <div className={this.props.classes.inputTextDummy}>
                  {tmpMetaAuthor}
                </div>
                <Input
                  onChange={(e)=>this.onChange(e)}
                  className={this.props.classes.inputText}
                  inputProps={{style:{marginBottom: '2px'}}}
                  style={{backgroundColor: bgcolor}}
                  value={tmpMetaAuthor}
                />
              </div>
            </Box>
          </Grid>
        </form>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={this.state.open}
          onClose={() => this.handleClose()}
          message={this.state.message}
          action={
            <React.Fragment>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => this.handleClose()}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </div>
    );
  }
}

TextFieldOfMetaAuthor.propTypes = {
  editingVocabulary: PropTypes.object,
  editingVocabularyMeta: PropTypes.object,
  classes: PropTypes.object,
  value: PropTypes.string,
  change: PropTypes.func,
  disabled: PropTypes.bool,
};
