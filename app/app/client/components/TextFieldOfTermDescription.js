/**
 * TextFieldOfTermDescription.js COPYRIGHT FUJITSU LIMITED 2021
 */
 import React from 'react';
 import PropTypes from 'prop-types';
 
 import TextField from '@material-ui/core/TextField';
 import Grid from '@material-ui/core/Grid';
 import Box from '@material-ui/core/Box';
 import Autocomplete from '@material-ui/lab/Autocomplete';
 import Snackbar from '@material-ui/core/Snackbar';
 import IconButton from '@material-ui/core/IconButton';
 import CloseIcon from '@material-ui/icons/Close';
 
 import {observer} from 'mobx-react';
 
 import EditPanelChipForOneChip from './EditPanelChipForOneChip';
 import EditPanelChip from './EditPanelChip';
 
 /**
  * Narrower term text field component
  * @extends React
  */
 export default
 @observer class TextFieldOfTermDescription extends React.Component {  

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
  }

  /**
   * Term description update event
   * @param  {object} event - information of event
   * @param  {array} newValue - list of term description
   */
   onChange(event, newValue) {
    if (newValue.length > 1) {
      // When more than one TermDescription is entered
      const errorMsg = '用語の説明テキストボックスには、複数の値を記入できません。値を1つだけ記入してください。';
      this.openSnackbar(errorMsg);
    }
    this.props.editingVocabulary.updataTermDescription(newValue);
  }

   render() {
     const tmpTermDescription = this.props.editingVocabulary.tmpTermDescription.list[this.props.editingVocabulary.tmpLanguage.value];
     let currentTermDescription;
     // term description on the selected term
     if (this.props.editingVocabulary.currentNode.language == this.props.editingVocabulary.tmpLanguage.value) {
       currentTermDescription =
         this.props.editingVocabulary.currentNode.term_description;
     } else { // term description when switching with the  language radio button in the selected term
       currentTermDescription =
         this.props.editingVocabulary.currentLangDiffNode.term_description;
     }
    //  /* eslint-disable no-unused-vars */
    //  // object for rendering
    //  let length = this.props.editingVocabulary.tmpTermDescription.list['ja'].length;
    //  length = this.props.editingVocabulary.tmpTermDescription.list['en'].length;
    //  /* eslint-enable no-unused-vars */

return (
    <div>
      <form noValidate autoComplete="off">
        <Grid item xs={12}>
          <Box border={1}>
            <Autocomplete
              multiple
              freeSolo
              disabled={this.props.disabled}
              value={tmpTermDescription}
              onFocus={(e)=>this.props.change('TermDescription', true)}
              onBlur={(e)=>this.props.change('TermDescription', false)}
              onChange={(event, newValue) => this.onChange(event, newValue)}
              classes={
                {
                  inputRoot: this.props.classes.autocompleteInputRoot,
                  clearIndicator: this.props.classes.displayNone,
                }
              }
              id="text-field-of-term_description-input"
              options={this.props.editingVocabulary.getCandidateTermList('')}
              getOptionLabel={(option) => option}
              renderTags={(tagValue, getTagProps) => {
                return tagValue.map((option, index) => (
                  <EditPanelChipForOneChip
                    key={index}
                    {...getTagProps({index})}
                    label={option}
                    data={currentTermDescription}
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
 
 TextFieldOfTermDescription.propTypes = {
   editingVocabulary: PropTypes.object,
   classes: PropTypes.object,
   change: PropTypes.func,
   disabled: PropTypes.bool,
 };
