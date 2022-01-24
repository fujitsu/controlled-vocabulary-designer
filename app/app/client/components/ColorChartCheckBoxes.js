/**
 * ColorChartCheckBoxes.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import {grey} from '@material-ui/core/colors';
import {brown} from '@material-ui/core/colors';
import {red} from '@material-ui/core/colors';
import {orange} from '@material-ui/core/colors';
import {yellow} from '@material-ui/core/colors';
import {lightGreen} from '@material-ui/core/colors';
import {green} from '@material-ui/core/colors';
import {lightBlue} from '@material-ui/core/colors';
import {blue} from '@material-ui/core/colors';
import {deepPurple} from '@material-ui/core/colors';
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
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const colorSet = {
      black: false,
      brown: false,
      red: false,
      orange: false,
      yellow: false,
      lightGreen: false,
      green: false,
      lightBlue: false,
      blue: false,
      deepPurple: false,
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
        <FormGroup row>
          <FormControlLabel
            className={this.props.classes.colorChartCheckBox}
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.black}
                name='black'
                style={
                  {
                    'color': grey[900],
                    '&$checked': {
                      'color': grey[800],
                    },
                    'checked': {},
                  }
                }
                disabled={this.props.disabled}
              />
            }
          />
          <FormControlLabel
            className={this.props.classes.colorChartCheckBox}
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.brown}
                name='brown'
                style={
                  {
                    'color': brown[500],
                    '&$checked': {
                      'color': brown[500],
                    },
                    'checked': {},
                  }
                }
                disabled={this.props.disabled}
              />
            }
          />

          <FormControlLabel
            className={this.props.classes.colorChartCheckBox}
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.red}
                name='red'
                style={
                  {
                    'color': red[500],
                    '&$checked': {
                      'color': red[500],
                    },
                    'checked': {},
                  }
                }
                disabled={this.props.disabled}
              />
            }
          />
          <FormControlLabel
            className={this.props.classes.colorChartCheckBox}
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.orange}
                name='orange'
                style={
                  {
                    'color': orange[500],
                    '&$checked': {
                      'color': orange[500],
                    },
                    'checked': {},
                  }
                }
                disabled={this.props.disabled}
              />
            }
          />
          <FormControlLabel
            className={this.props.classes.colorChartCheckBox}
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.yellow}
                name='yellow'
                style={
                  {
                    'color': yellow[500],
                    '&$checked': {
                      'color': yellow[500],
                    },
                    'checked': {},
                  }
                }
                disabled={this.props.disabled}
              />
            }
          />
          <FormControlLabel
            className={this.props.classes.colorChartCheckBox}
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.lightGreen}
                name='lightGreen'
                style={
                  {
                    'color': lightGreen[500],
                    '&$checked': {
                      'color': lightGreen[500],
                    },
                    'checked': {},
                  }
                }
                disabled={this.props.disabled}
              />
            }
          />
          <FormControlLabel
            className={this.props.classes.colorChartCheckBox}
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.green}
                name='green'
                style={
                  {
                    'color': green[500],
                    '&$checked': {
                      'color': green[500],
                    },
                    'checked': {},
                  }
                }
                disabled={this.props.disabled}
              />
            }
          />
          <FormControlLabel
            className={this.props.classes.colorChartCheckBox}
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.lightBlue}
                name='lightBlue'
                style={
                  {
                    'color': lightBlue[500],
                    '&$checked': {
                      'color': lightBlue[500],
                    },
                    'checked': {},
                  }
                }
                disabled={this.props.disabled}
              />
            }
          />
          <FormControlLabel
            className={this.props.classes.colorChartCheckBox}
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.blue}
                name='blue'
                style={
                  {
                    'color': blue[500],
                    '&$checked': {
                      'color': blue[500],
                    },
                    'checked': {},
                  }
                }
                disabled={this.props.disabled}
              />
            }
          />
          <FormControlLabel
            className={this.props.classes.colorChartCheckBox}
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.deepPurple}
                name='deepPurple'
                style={
                  {
                    'color': deepPurple[500],
                    '&$checked': {
                      'color': deepPurple[500],
                    },
                    'checked': {},
                  }
                }
                disabled={this.props.disabled}
              />
            }
          />
          <FormControlLabel
            className={this.props.classes.colorChartCheckBox}
            control={
              <ColorChartCheckBox
                selectColor={(event)=>this.selectColor(event)}
                checked={colorSet.purple}
                name='purple'
                style={
                  {
                    'color': purple[500],
                    '&$checked': {
                      'color': purple[500],
                    },
                    'checked': {},
                  }
                }
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
};
