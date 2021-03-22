/**
 * CheckboxPartOfSpeechHiddenLabels.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import {observer} from 'mobx-react';

/**
 * CheckboxPartOfSpeechHiddenLabels
 * Part of speech filter check box label
 * @extends React
 * @event uploadFilter
 * @event changeChecked
 */
export default
@observer class CheckboxPartOfSpeechHiddenLabels extends React.Component {
  /**
   * Reflect Button Event
   * DB save changed filter information.
   */
  uploadFilter() {
    this.props.up();
  };

  /**
   * Filter check ON/OFF event
   * @param  {object} event - information of check part of speech
   */
  changeChecked(event) {
    this.props.check(event.target.name);
  };

  /**
   * render
   * @return {element}
   */
  render() {
    return (
      <div>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={this.props.checkList.Noun.value}
                onChange={(event)=>this.changeChecked(event)}
                name='Noun'
                color='primary'
              />
            }
            label='名詞'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={this.props.checkList.Verb.value}
                onChange={(event)=>this.changeChecked(event)}
                name='Verb'
                color='primary'
              />
            }
            label='動詞'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={this.props.checkList.Adjective.value}
                onChange={(event)=>this.changeChecked(event)}
                name='Adjective'
                color='primary'
              />
            }
            label='形容詞'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={this.props.checkList.Adverb.value}
                onChange={(event)=>this.changeChecked(event)}
                name='Adverb'
                color='primary'
              />
            }
            label='副詞'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={this.props.checkList.Adnominal.value}
                onChange={(event)=>this.changeChecked(event)}
                name='Adnominal'
                color='primary'
              />
            }
            label='連体詞'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={this.props.checkList.Interjection.value}
                onChange={(event)=>this.changeChecked(event)}
                name='Interjection'
                color='primary'
              />
            }
            label='感動詞'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={this.props.checkList.Other.value}
                onChange={(event)=>this.changeChecked(event)}
                name='Other'
                color='primary'
              />
            }
            label='その他'
          />

        </FormGroup>
        <Button
          variant='contained'
          color='primary'
          size={'small'}
          onClick={()=>this.uploadFilter()}
        >
          反映
        </Button>
      </div>
    );
  }
}

CheckboxPartOfSpeechHiddenLabels.propTypes = {
  up: PropTypes.func,
  check: PropTypes.func,
  checkList: PropTypes.object,
};
