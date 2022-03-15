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
    this.props.tmpColor.id = '';
    this.props.tmpColor.color = '';
  }

  /**
   * Color information update event
   * @param  {object} event - information of color event for update
   */
  selectColor(event) {
    this.props.selectTmpColor(this.props.currentId, event.target.name);
    this.props.selectColor(this.props.currentId, this.props.colorId, event.target.name);

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

    if (this.props.currentId == this.props.tmpColor.id) {
      if (this.props.tmpColor.color) {
        colorSet[this.props.tmpColor.color] = true;
      } else {
        // Rerender separately from the color change without changing the color.
        if (this.props.color) {
          colorSet[this.props.color] = true;
        }
      }
    } else {
      this.props.tmpColor.id = this.props.currentId;
      if (this.props.color) {
        colorSet[this.props.color] = true;
      }
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
  tmpColor: PropTypes.object,
  selectColor: PropTypes.func,
  colorId: PropTypes.string,
  selectTmpColor: PropTypes.func,
  currentId: PropTypes.number,
  color: PropTypes.string,
  classes: PropTypes.object,
  disabled: PropTypes.bool,
  close: PropTypes.func,
};
