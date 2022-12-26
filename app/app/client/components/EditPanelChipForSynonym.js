/**
 * EditPanelChipForSynonym.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Chip from '@material-ui/core/Chip';

import {observer} from 'mobx-react';

import editingVocabularyStore from '../stores/EditingVocabulary';

/**
 * Synonym chip component for edit operations panel
 * @extends React
 */
export default
@observer class EditPanelChipForSynonym extends React.Component {
  /**
   * render
   * @return {element}
   */
  render() {
    const currentSynonym = this.props.synonym;
    let chipColor;
    if (currentSynonym.includes(this.props.label)) {
      chipColor = '#bbdefb';
    } else {
      // Chips added by completion
      chipColor = '#ffcdd2';
    }
    const disp = !editingVocabularyStore.isBlankTerm(this.props.label);

    return (
      <>
      { disp && 
        <Chip
          style={{backgroundColor: chipColor}}
          {...this.props}
        />
      }
      </>
    );
  }
}

EditPanelChipForSynonym.propTypes = {
  synonym: PropTypes.array,
  label: PropTypes.string,
};
