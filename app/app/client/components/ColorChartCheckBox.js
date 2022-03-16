/**
 * ColorChartCheckBox.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/Check';
import {grey} from '@material-ui/core/colors';

/**
 * Color chart checkbox
 * @extends React
 */
export default class ColorChartCheckBox extends React.Component {
  /**
   * Color selection check event
   * @param  {object} event - event information
   */
  checkBoxClick(event) {
    this.props.selectColor(event);
  }

  checkBoxWrapClick(event){
    const obj={target:{name: this.props.name}};
    this.checkBoxClick(obj);
  }

  buttonStyles(){
    const color = this.props.style.color || 'black';
    const style={ 
      backgroundColor : 'white',
      border : 'solid 3px '+ color,
      width: '120px',
      height: '40px',
      color: color,
      padding: '0 0 0 10px',
      margin: '4px',
      marginLeft: '16px',
      justifyContent: 'left',
      borderRadius: 0,
    };
    return style;
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const setcolor = this.props.checked ?'black':grey[300];

    return (
      <div>
        <Button
          onClick={(event)=>this.checkBoxWrapClick(event)}
          style={this.buttonStyles()}
        >
          <CheckIcon style={{color: setcolor}} />
          {this.props.name}
          <Checkbox
            checked={this.props.checked}
            onChange={(event)=>this.checkBoxClick(event)}
            color="default"
            name={this.props.name}
            style={ {opacity: 0}}
            disabled={this.props.disabled}
          />
        </Button>
      </div>
    );
  }
}

ColorChartCheckBox.propTypes = {
  selectColor: PropTypes.func,
  checked: PropTypes.bool,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  style: PropTypes.object,
};
