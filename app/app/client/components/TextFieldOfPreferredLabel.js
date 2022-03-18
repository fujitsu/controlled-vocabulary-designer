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
 * Preferred label text field component
 * @extends React
 */
export default
@observer class TextFieldOfPreferredLabel extends React.Component {
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
    $('#text-field-of-preferred_label-input').focusin(() =>
      this.props.change('PreferredLabel', true));
    $('#text-field-of-preferred_label-input').focusout(() =>
      this.props.change('PreferredLabel', false));
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
   * Preferred label update event
   * @param  {object} event - information of event
   * @param  {array} newValue - list of preferred label
   */
  onChange(event, newValue) {
    if (newValue.length > 1) {
      // When more than one preferred label is entered
      const errorMsg = '代表語テキストボックスには、複数の値を記入できません。値を1つだけ記入してください。';
      this.openSnackbar(errorMsg);
    } else if (newValue.length == 1) {
      // When a selected term or a term that is not a synonym is entered in the preferred label
      if (this.props.editingVocabulary.isInvalidPreferredLabel(newValue[0])) {
        const currentTerm = this.props.editingVocabulary.currentNode.term;
        const errorMsg = '代表語テキストボックスに記入された \"' + newValue[0] + '\" は、¥n' +
                         '\"' +currentTerm + '\" または同義語のいずれにも含まれていません。¥n' +
                         '代表語テキストボックスには、¥n' +
                         '\"' + currentTerm + '\" または同義語の中から選んで記入してください。';
        const innerText = errorMsg.split('¥n').map((line, key) =>
          <span key={key}>{line}<br /></span>);
        this.openSnackbar(innerText);
      }
    } else if (newValue.length == 0) {
      // Preferred label:Missing error
      if (this.props.editingVocabulary.tmpSynonym.list.length > 0) {
        const currentTerm = this.props.editingVocabulary.currentNode.term;
        if (currentTerm) {
          // When the vocabulary is not selected, the synonym is also cleared in the subsequent process, so no error message is displayed.
          const errorMsg = '代表語テキストボックスには \"' + currentTerm +
                           '\" または同義語の中から選んで記入してください。';
          this.openSnackbar(errorMsg);
        }
      }
    }
    this.props.editingVocabulary.updataPreferredLabel(newValue);
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const preferredLabel = this.props.editingVocabulary.tmpPreferredLabel.list;
    const currentPreferredLabel =
        this.props.editingVocabulary.currentNode.preferred_label;
    /* eslint-disable no-unused-vars */
    // object for rendering
    const length = this.props.editingVocabulary.tmpPreferredLabel.list.length;
    /* eslint-enable no-unused-vars */

    return (
      <div>
        <form noValidate autoComplete="off">
          <Grid item xs={12}>
            <Box border={1}>
              <Autocomplete
                multiple
                freeSolo
                disabled={this.props.disabled}
                value={preferredLabel}
                onChange={(event, newValue) => this.onChange(event, newValue)}
                classes={
                  {
                    inputRoot: this.props.classes.autocompleteInputRoot,
                    clearIndicator: this.props.classes.displayNone,
                  }
                }
                id="text-field-of-preferred_label-input"
                options={
                  this.props.editingVocabulary.getCandidateTermList(
                      'preferred_label',
                  )
                }
                getOptionLabel={(option) => option}
                renderOption={(option, {selected}) => (
                  <React.Fragment>
                    <div style={{width: '100%'}}>
                      
                      <Box display="flex" flexDirection="row" alignItems="center">
                        <Box
                          component="span"
                          display="inline"
                          style={{fontSize: '16px',whiteSpace: 'nowrap'}}
                        >
                          {option}
                        </Box>
                        <Box
                          component="span"
                          display="inline"
                          title={
                            this.props.editingVocabulary.getReferenceFromData(
                                option,
                                '',
                            )
                          }
                          style={{fontSize: '10px',whiteSpace: 'nowrap',textOverflow: 'ellipsis', overflowX: 'hidden', marginLeft: '10px'}}
                        >
                          {
                            this.props.editingVocabulary.getReferenceFromData(
                                option,
                                '',
                            )
                          }
                        </Box>
                      </Box>
                      {/* <Box
                        component="span"
                        display="block"
                        style={{fontSize: '16px'}}
                      >
                        {option}
                      </Box>
                      <Box
                        component="span"
                        display="block"
                        style={{fontSize: '10px'}}
                      >
                        {
                          this.props.editingVocabulary.getReferenceFromData(
                              option,
                              '',
                          )
                        }
                      </Box> */}
                    </div>
                  </React.Fragment>
                )}
                renderTags={(tagValue, getTagProps) => {
                  return tagValue.map((option, index) => (
                    <EditPanelChipForOneChip
                      key={index}
                      {...getTagProps({index})}
                      label={option}
                      data={currentPreferredLabel}
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

TextFieldOfPreferredLabel.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
  change: PropTypes.func,
  disabled: PropTypes.bool,
};
