/**
 * EditPanelChip.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Chip from '@material-ui/core/Chip';

import {observer} from 'mobx-react';

import editingVocabularyStore from '../stores/EditingVocabulary';

/**
 * Chip component for editing operation panel
 * @extends React
 */
export default
@observer class EditPanelChip extends React.Component {
  /**
   * render
   * @return {element}
   */
  render() {
    const currentlist = this.props.currentlist;
    let chipColor= '#bbdefb';
    if (!(currentlist.includes(this.props.label))) {
      // Chips added by completion
      chipColor = '#ffcdd2';
    }
    const disp = editingVocabularyStore.isBlankTerm(this.props.label);
    return (
      <>
      { !disp && 
        <Chip
        style={{backgroundColor: chipColor}}
        {...this.props}
        />
      }
      </>
    );
  }
}

EditPanelChip.propTypes = {
  currentlist: PropTypes.array,
  label: PropTypes.string,
  chipid: PropTypes.string,
};
