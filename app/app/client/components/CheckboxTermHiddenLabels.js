/**
 * CheckboxTermHiddenLabels.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import {observer} from 'mobx-react';

/**
 * CheckboxTermHiddenLabels
 * Hidden checkbox label
 * @extends React
 */
export default
@observer class CheckboxTermHiddenLabels extends React.Component {
  /**
   * Hidden check event
   * @param  {object} event - information of check event
   */
  handleChange(event) {
    this.props.change();
  };

  /**
   * render
   * @return {element}
   */
  render() {
    const editingVocabulary = this.props.editingVocabulary;
    return (
      <div>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={!editingVocabulary.currentNode.id?
                  false:this.props.hidden}
                onChange={(e) => this.handleChange(e)}
                name='checkedHidden'
                color='primary'
                disabled={!editingVocabulary.currentNode.id}
              />
            }
            label='非表示'
          />
        </FormGroup>
      </div>
    );
  }
}

CheckboxTermHiddenLabels.propTypes = {
  hidden: PropTypes.bool,
  handleChange: PropTypes.func,
  editingVocabulary: PropTypes.object,
  change: PropTypes.func,
};
