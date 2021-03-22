/**
 * TextFieldOfPos.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import {observer} from 'mobx-react';

/**
 * Part of speech text field components
 * @extends React
 * @param  {string} partOfSpeech - name of part of speech
 * @return {string} partOfSpeech - name of display part of speech
 */
export default
@observer class TextFieldOfPos extends React.Component {
  partOfSpeechCheck = (partOfSpeech) => {
    const partOfSpeechList = new Set(['名詞', '動詞', '形容詞', '副詞', '連体詞', '感動詞']);
    if (!partOfSpeech) {
      return '';
    }
    if (!partOfSpeechList.has(partOfSpeech)) {
      return 'その他';
    }
    return partOfSpeech;
  }

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
              id="text-field-of-pos-input"
              value={this.partOfSpeechCheck(this.props.text)}
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

TextFieldOfPos.propTypes = {
  classes: PropTypes.object,
  text: PropTypes.string,
};
