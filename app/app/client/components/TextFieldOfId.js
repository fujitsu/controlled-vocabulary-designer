/**
 * TextFieldOfPreferredLabel.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import $ from 'jquery';

import {observer} from 'mobx-react';

import EditPanelChipForOneChip from './EditPanelChipForOneChip';

/**
 * Id text field component
 * @extends React
 */
export default
@observer class TextFieldOfId extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {open: false, message: ''};
  }

  /**
   * Key event registration
   */
  componentDidMount() {
    $('#text-field-of-id-input').focusin(() =>
      this.props.change('Id', true));
    $('#text-field-of-id-input').focusout(() =>
      this.props.change('Id', false));
  }

  /**
   * Warning displaying snackbar events
   * @param {String} errorMsg - error message
   */
  openSnackbar(errorMsg) {
    this.setState({open: true, message: errorMsg});
  }

  /**
   * Warning hiding snackbar events
   */
  handleClose() {
    this.setState({open: false, message: ''});
  };

  /**
   * Id update event
   * @param  {object} event - information of event
   * @param  {array} newValue - list of preferred label
   */
  onChange(event, newValue) {
    const prfrrdLbl = this.props.editingVocabulary.tmpPreferredLabel.list[0];

    if (newValue.length > 1) {
      // When more than one id is entered
      const errorMsg = 'IDテキストボックスには、複数の値を記入できません。値を1つだけ記入してください。';
      this.openSnackbar(errorMsg);
    } else if (newValue.length == 1) {
      if (this.props.editingVocabulary.isInvalidIdofUri(newValue[0], prfrrdLbl)) {
        const errorMsg = '代表語のURIテキストボックスに、¥n' +
                       '同義関係でない別の代表語 \"' +
                       this.props.editingVocabulary.equalUriPreferredLabel +
                       '\" と同じ代表語のURIが記入されています。¥n' +
                       '代表語のURIテキストボックスには、¥n' +
                       '既に登録されている他の代表語のURIとは異なる値が入るように、¥n' +
                       'IDテキストボックスの値を変更してください。';
        const innerText = errorMsg.split('¥n').map((line, key) =>
          <span key={key}>{line}<br /></span>);
        this.openSnackbar(innerText);
      }
    } else if (newValue.length == 0) {
      // idofuri:Missing error
      if (this.props.editingVocabulary.tmpIdofUri.list.length > 0) {
        const currentIdofUri = this.props.editingVocabulary.currentNode.idofuri;
        if (currentIdofUri) {
          const errorMsg = 'IDテキストボックスには \"' + currentIdofUri +
                           '\" または既に登録されている他の代表語のURIとは異なる値が入るように、¥n' +
                           'IDテキストボックスの値を変更してください。';
          const innerText = errorMsg.split('¥n').map((line, key) =>
            <span key={key}>{line}<br /></span>);
          this.openSnackbar(innerText);
        }
      }
    }
    this.props.editingVocabulary.updataIdofUri(newValue); 
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const id = this.props.editingVocabulary.tmpIdofUri.list; 
    const currentId =
        this.props.editingVocabulary.currentNode.idofuri;

    return (
      <div>
        <form noValidate autoComplete="off">
          <Grid item xs={12}>
            <Box border={1}>
              <Autocomplete
                multiple
                freeSolo
                disabled={this.props.disabled}
                value={id}
                onChange={(event, newValue) => this.onChange(event, newValue)}
                classes={
                  {
                    inputRoot: this.props.classes.autocompleteInputRoot,
                    clearIndicator: this.props.classes.displayNone,
                  }
                }
                id="text-field-of-id-input"
                options={
                  this.props.editingVocabulary.getCandidateTermList('')}
                getOptionLabel={(option) => option}
                renderTags={(tagValue, getTagProps) => {
                  return tagValue.map((option, index) => (
                    <EditPanelChipForOneChip 
                      key={index}
                      {...getTagProps({index})}
                      label={option}
                      data={currentId}
                    />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    style={
                        this.props.disabled?
                        {backgroundColor: 'rgba(0, 0, 0, 0.09)'}:
                        {backgroundColor: 'rgba(0, 0, 0, 0)'}
                    }
                  />
                )}
              />
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

TextFieldOfId.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
  change: PropTypes.func,
  disabled: PropTypes.bool,
};
