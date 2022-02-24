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
 
 import $ from 'jquery';

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
    * render
    * @return {element}
    */

  /**
   * Key event registration
   */
   componentDidMount() {
    $('#text-field-of-term_description-input').focusin(() =>
      this.props.change('TermDescription', true));
    $('#text-field-of-term_description-input').focusout(() =>
      this.props.change('TermDescription', false));
  }

  /**
   * Term description update event
   * @param  {object} event - information of event
   * @param  {array} newValue - list of term description
   */
   onChange(event, newValue) {
    this.props.editingVocabulary.updataTermDescription(newValue);
  }

   render() {
     const tmpTermDescription = this.props.editingVocabulary.tmpTermDescription.list;
     const currentTermDescription = this.props.editingVocabulary.currentNode.term_description;

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
