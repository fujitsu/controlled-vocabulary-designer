/**
 * TextFieldOfSubordinateTerm.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Autocomplete from '@material-ui/lab/Autocomplete';

import {observer} from 'mobx-react';

import EditPanelChip from './EditPanelChip';

/**
 * Narrower term text field component
 * @extends React
 */
export default
@observer class TextFieldOfSubordinateTerm extends React.Component {
  /**
   * render
   * @return {element}
   */
  render() {
    const tmpSubordinateTerm = this.props.editingVocabulary.tmpSubordinateTerm;
    const currentSubordinateTerm = this.props.editingVocabulary.tmpSubordinateTerm;
  

    return (
      <form noValidate autoComplete="off">
        <Grid item xs={12}>
          <Box border={1}>
            <Autocomplete
              multiple
              freeSolo
              disabled
              value={tmpSubordinateTerm}
              classes={{
                inputRoot: this.props.classes.autocompleteDisabledInputRoot,
                clearIndicator: this.props.classes.displayNone,
                tag: this.props.classes.autocompleteDisabledTag,
              }}
              id="text-field-of-subordinateTerm-input"
              options={[]}
              renderTags={(tagValue, getTagProps) => {
                return tagValue.map((option, index) => (
                  <EditPanelChip
                    key={index}
                    {...getTagProps({index})}
                    label={option}
                    chipid={'0'}
                    currentlist={currentSubordinateTerm}
                    needblankcheck={'true'}
                  />
                ));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                />
              )}
            />
          </Box>
        </Grid>
      </form>
    );
  }
}

TextFieldOfSubordinateTerm.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
};
