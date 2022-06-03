/**
 * TextFieldOfSynonym.js COPYRIGHT FUJITSU LIMITED 2021
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

import EditPanelChipForSynonym from './EditPanelChipForSynonym';

import {observer} from 'mobx-react';

/**
 * Synonym text filed component
 * @extends React
 */
export default
@observer class TextFieldOfSynonym extends React.Component {
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
    $('#text-field-of-synonym-input').focusin(() =>
      this.props.change('synonym', true));
    $('#text-field-of-synonym-input').focusout(() =>
      this.props.change('synonym', false));
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
   * Synonym update event
   * @param  {object} event - information of event
   * @param  {array} newValue - list of broader terms
   */
  onChange(event, newValue) {
    if (this.props.editingVocabulary.isRelationSynonym(newValue)) {
      const currentTerm = this.props.editingVocabulary.currentNode.term;
      const errorMsg = '下位語テキストボックスに、 \"' + currentTerm +
                       '\" あるいは \"' + currentTerm + '\" の代表語' +
                       'あるいは \"' + currentTerm + '\" の同義語が記入されています。¥n' +
                       '同義語テキストボックスには、 \"' + currentTerm +
                       '\" と上下関係を持たないように、¥n' +
                       'かつ記入する複数の用語間にも上下関係を持たないように、用語を記入してください。';
      const innerText = errorMsg.split('¥n').map((line, key) =>
        <span key={key}>{line}<br /></span>);
      this.openSnackbar(innerText);
    }
    this.props.editingVocabulary.updataSynonym(newValue);
    if (this.state.open == false) {
      const preferredLabelLength =
        this.props.editingVocabulary.tmpPreferredLabel.list.length;
      if (preferredLabelLength > 1) {
        const errorMsg = '代表語テキストボックスには、複数の値を記入できません。値を1つだけ記入してください。';
        this.openSnackbar(errorMsg);
      }
    }
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const synonym = this.props.editingVocabulary.tmpSynonym.list;
    /* eslint-disable no-unused-vars */
    // object for rendering
    const length = this.props.editingVocabulary.tmpSynonym.list.length;
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
                value={synonym}
                onChange={(event, newValue) => this.onChange(event, newValue)}
                classes={
                  {
                    inputRoot: this.props.classes.autocompleteInputRoot,
                    clearIndicator: this.props.classes.displayNone,
                  }
                }
                id="text-field-of-synonym-input"
                options={
                  this.props.editingVocabulary.getCandidateTermList('Synonym')
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
                                'Synonym',
                            )
                          }
                          style={{fontSize: '10px',whiteSpace: 'nowrap',textOverflow: 'ellipsis', overflowX: 'hidden', marginLeft: '10px'}}
                        >
                          {
                            this.props.editingVocabulary.getReferenceFromData(
                                option,
                                'Synonym',
                            )
                          }
                        </Box>
                      </Box>
                    </div>
                  </React.Fragment>
                )}
                renderTags={(tagValue, getTagProps) => {
                  return tagValue.map((option, index) => (
                    <EditPanelChipForSynonym
                      key={index}
                      {...getTagProps({index})}
                      label={option}
                      synonym={this.props.editingVocabulary.currentSynonym.list}
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

TextFieldOfSynonym.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
  change: PropTypes.func,
  disabled: PropTypes.bool,
};
