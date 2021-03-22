/**
 * SortSelect.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import {observer} from 'mobx-react';

/**
 * Terms sort selection component
 * @extends React
 */
export default
@observer class SortSelect extends React.Component {
  /**
   * Sort switch event
   * @param  {object} event - information of event
   */
  handleChange(event) {
    this.props.editingVocabulary.changeSort(event.target.value);
  };

  /**
   * render
   * @return {element}
   */
  render() {
    return (
      <div>
        <FormControl style={{margin: '0.5rem', width: '90%'}}>
          <InputLabel id="sort-select-label">並べ替え</InputLabel>
          <Select
            labelId="sort-select-label"
            id="sort-select"
            value={this.props.editingVocabulary.currentSort.key}
            onChange={(event)=>this.handleChange(event)}
          >
            <MenuItem value={'ascend'}>昇順</MenuItem>
            <MenuItem value={'descend'}>降順</MenuItem>
          </Select>
        </FormControl>
      </div>
    );
  }
}

SortSelect.propTypes = {
  editingVocabulary: PropTypes.object,
};
