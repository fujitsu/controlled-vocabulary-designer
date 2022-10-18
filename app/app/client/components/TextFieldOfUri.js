/**
 * TextFieldOfUri.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Autocomplete from '@material-ui/lab/Autocomplete';


import {observer} from 'mobx-react';

import EditPanelChipForOneChip from './EditPanelChipForOneChip';

/**
 * URI text field component
 * @extends React
 */
export default
@observer class TextFieldOfUri extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {
      disabledFlg: true,
    };
  }


  /**
   * render
   * @return {element}
   */
  render() {
    // Replace URI prefixes with display labels only
    let alteredUri = this.props.editingVocabulary.tmpUri.list;


    const  disabledFlg = true;

    const currentUri = this.props.editingVocabulary.currentNode.uri;

    return (
      <div>
        <form noValidate autoComplete="off">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box border={1}>

                <Autocomplete
                  multiple
                  freeSolo
                  disabled={disabledFlg}
                  style={{display: 'inline'}}
                  value={alteredUri}
                  classes={
                    {
                      inputRoot: this.props.classes.autocompleteInputRoot,
                      clearIndicator: this.props.classes.displayNone,
                    }
                  }
                  id="text-field-of-uri-input"
                  options={this.props.editingVocabulary.editingVocabulary}
                  getOptionLabel={() => ''}
                  renderTags={(tagValue, getTagProps) => {
                    return tagValue.map((option, index) => (
                      <EditPanelChipForOneChip
                        key={index}
                        {...getTagProps({index})}
                        label={option}
                        data={currentUri}
                        needblankcheck={'false'}
                      />
                    ));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      style={
                        disabledFlg ?
                          {backgroundColor: 'rgba(0, 0, 0, 0.09)'}:
                          {backgroundColor: 'rgba(0, 0, 0, 0)'}
                      }
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </form>
      </div>
    );
  }
}

TextFieldOfUri.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
};
