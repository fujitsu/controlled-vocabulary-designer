/**
 * ColorChartCheckBoxes.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import {grey} from '@material-ui/core/colors';
import {red} from '@material-ui/core/colors';
import {orange} from '@material-ui/core/colors';
import {green} from '@material-ui/core/colors';
import {blue} from '@material-ui/core/colors';
import {purple} from '@material-ui/core/colors';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import ColorChartCheckBox from './ColorChartCheckBox';

/**
 * Feature of color chart check boxes
 * @extends React
 */
export default class ColorChartCheckBoxes extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
  }

  /**
   * Color information update event
   * @param  {object} event - information of color event for update
   */
  selectColor(event) {
    this.props.editingVocabulary.updateColor(this.props.editingVocabulary.selectedIdList, this.props.colorId, event.target.name);

    this.props.close();
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const colorSet = {
      black: false,
      red: false,
      orange: false,
      green: false,
      blue: false,
      purple: false,
    };
    if ( this.props.editingVocabulary.currentNode.color1) {
      colorSet[this.props.editingVocabulary.currentNode.color1] = true;
    }

    return (
      <div>
        <FormGroup style={{ width: '132px', padding: '10px'}}>
          <FormControlLabel
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.black}
                name='black'
                style={{ 'color': grey[900],}}
                disabled={this.props.disabled}
              />
            }
          />

          <FormControlLabel
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.red}
                name='red'
                style={{ 'color': red[500],}}
                disabled={this.props.disabled}
              />
            }
          />
          <FormControlLabel
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.orange}
                name='orange'
                style={{ 'color': orange[500],}}
                disabled={this.props.disabled}
              />
            }
          />
          <FormControlLabel
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.green}
                name='green'
                style={{ 'color': green[500],}}
                disabled={this.props.disabled}
              />
            }
          />
          <FormControlLabel
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.blue}
                name='blue'
                style={{ 'color': blue[500],}}
                disabled={this.props.disabled}
              />
            }
          />
          <FormControlLabel
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.purple}
                name='purple'
                style={{ 'color': purple[500],}}
                disabled={this.props.disabled}
              />
            }
          />

        </FormGroup>
      </div>

    );
  }
}

ColorChartCheckBoxes.propTypes = {
  editingVocabulary: PropTypes.object,
  colorId: PropTypes.string,
  disabled: PropTypes.bool,
  close: PropTypes.func,
};
