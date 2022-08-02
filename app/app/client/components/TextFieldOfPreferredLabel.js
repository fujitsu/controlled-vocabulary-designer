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
    const editingVocabulary = this.props.editingVocabulary;
    const inputText = event.target.value;
    const find = editingVocabulary.editingVocabulary.find((d)=>{ return d.term == inputText });    
    if( inputText != undefined && !find){
      const errorMsg =  '\"' +inputText + '\" は、登録されていない用語です。¥n' +
                       '既存の用語を記入してください。';
      const innerText = errorMsg.split('¥n').map((line, key) =>
        <span key={key}>{line}<br /></span>);
      this.openSnackbar(innerText);

      return false;
    }
    
    const currentNode = editingVocabulary.tmpLanguage.list == editingVocabulary.currentNode.language ? editingVocabulary.currentNode: editingVocabulary.currentLangDiffNode;

    if (newValue.length > 1) {
      // When more than one preferred label is entered
      const errorMsg = '代表語テキストボックスには、複数の値を記入できません。値を1つだけ記入してください。';
      this.openSnackbar(errorMsg);
    } else if (newValue.length == 1) {
      // When a selected term or a term that is not a synonym is entered in the preferred label
      if (editingVocabulary.isInvalidPreferredLabel(currentNode, newValue[0])) {
        const errorMsg = '代表語テキストボックスに記入された \"' + newValue[0] + '\" は、¥n' +
                         '\"' +currentNode.term + '\" または同義語のいずれにも含まれていません。¥n' +
                         '代表語テキストボックスには、¥n' +
                         '\"' + currentNode.term + '\" または同義語の中から選んで記入してください。';
        const innerText = errorMsg.split('¥n').map((line, key) =>
          <span key={key}>{line}<br /></span>);
        this.openSnackbar(innerText);
      }
    } else if (newValue.length == 0) {
      // Preferred label:Missing error
      if (currentNode.term) {
        // When the vocabulary is not selected, the synonym is also cleared in the subsequent process, so no error message is displayed.
        const errorMsg = '代表語テキストボックスには \"' + currentNode.term +
                          '\" または同義語の中から選んで記入してください。';
        this.openSnackbar(errorMsg);
      }
    }
    editingVocabulary.updataPreferredLabel(newValue);
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const preferredLabel = this.props.editingVocabulary.tmpPreferredLabel.list[this.props.editingVocabulary.tmpLanguage.list];
    let currentPreferredLabel;
    // preferred label on the selected term
    if (this.props.editingVocabulary.currentNode.language == this.props.editingVocabulary.tmpLanguage.list) {
      currentPreferredLabel =
        this.props.editingVocabulary.currentNode.preferred_label;
    } else { // preferred label when switching with the  language radio button in the selected term
      currentPreferredLabel =
        this.props.editingVocabulary.currentLangDiffNode.preferred_label;
    }

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
                onFocus={(e)=>this.props.change('PreferredLabel', true)}
                onBlur={(e)=>this.props.change('PreferredLabel', false)}
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
