/**
 * TextFieldOfMetaName.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Input from '@material-ui/core/Input';

import {observer} from 'mobx-react';

/**
 * Meta name text filed component
 * @extends React
 */
export default
@observer class TextFieldOfMetaName extends React.Component {

  /**
   * Meta name update event
   * @param  {object} event - information of event
   * @param  {array} newValue - list of meta name
   */
  onChange(event, newValue) {
    this.props.change( event.target.value);
  }

  /**
   * render
   * @return {element}
   */
  render() {

    const bgcolor = this.props.disabled?'rgba(0, 0, 0, 0.09)':'rgba(0, 0, 0, 0)';
    const tmpMetaName = this.props.value;

    return (
      <div>
        <form noValidate autoComplete="off">
          <Grid item xs={12}>
            {/* [ inputTextWrap ] - declared a global class to take advantage of WebKit's CSS extensions */}
            <Box border={1} className='inputTextWrap'>      
              <div className={this.props.classes.inputTextItem}>
                <div className={this.props.classes.inputTextDummy}>
                  {tmpMetaName}
                </div>
                <Input
                  onChange={(e)=>this.onChange(e)}
                  onBlur={(e)=>this.onChange(e)}
                  className={this.props.classes.inputText}
                  inputProps={{style:{marginBottom: '2px'}}}
                  style={{backgroundColor: bgcolor}}
                  value={tmpMetaName}
                />
              </div>
            </Box>
          </Grid>
        </form>
      </div>
    );
  }
}

TextFieldOfMetaName.propTypes = {
  editingVocabulary: PropTypes.object,
  editingVocabularyMeta: PropTypes.object,
  classes: PropTypes.object,
  value: PropTypes.string,
  change: PropTypes.func,
  disabled: PropTypes.bool,
};
