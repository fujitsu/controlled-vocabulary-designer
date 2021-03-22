/**
 * TextFieldOfPosition.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import {observer} from 'mobx-react';

/**
 * Coordinate text field component
 * @extends React
 */
export default
@observer class TextFieldOfPosition extends React.Component {
  /**
   * render
   * @return {element}
   */
  render() {
    let strPos = ' ';
    if (this.props.currentNode.id) {
      const currentPos =
      this.props.editingVocabulary.getCurrentNodePosition();

      if (currentPos) {
      strPos = '(' +
        currentPos.position_x +
        ',' +
        currentPos.position_y + ')';
      }
    }

    return (
      <form noValidate autoComplete="off">
        <Grid item xs={12}>
          <Box border={1}>
            <TextField
              classes={{root: this.props.classes.textField}}
              id="text-field-of-position-input"
              value={strPos}
              inputProps={{style: {textAlign: 'center', paddingTop: '12px'}}}
              InputProps={{
                readOnly: true,
              }}
              variant="filled"
            />
          </Box>
        </Grid>
      </form>
    );
  }
}

TextFieldOfPosition.propTypes = {
  selectedFile: PropTypes.object,
  currentNode: PropTypes.object,
  classes: PropTypes.object,
  editingVocabulary: PropTypes.object,
};
