/**
 * ColorChartCheckBox.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '@material-ui/core/Checkbox';

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

  /**
   * render
   * @return {element}
   */
  render() {
    return (
      <div>
        <Checkbox
          checked={this.props.checked}
          onChange={(event)=>this.checkBoxClick(event)}
          color="default"
          name={this.props.name}
          style={
            this.props.disabled?{color: 'rgba(0, 0, 0, 0.26)'}:this.props.style
          }
          disabled={this.props.disabled}
        />
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
