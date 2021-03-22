/**
 * TextFieldOfTerm.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import {observer} from 'mobx-react';

/**
 * Vocabulary text field component
 * @extends React
 */
export default
@observer class TextFieldOfTerm extends React.Component {
  /**
   * render
   * @return {element}
   */
  render() {
    return (
      <form noValidate autoComplete="off">
        <Grid item xs={12}>
          <Box border={1}>
            <TextField
              classes={{root: this.props.classes.textField}}
              id="text-field-of-term-input"
              value={this.props.text}
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

TextFieldOfTerm.propTypes = {
  classes: PropTypes.object,
  text: PropTypes.string,
};
