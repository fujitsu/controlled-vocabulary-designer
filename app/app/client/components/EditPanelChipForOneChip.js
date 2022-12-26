/**
 * EditPanelChipForOneChip.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Chip from '@material-ui/core/Chip';

import {observer} from 'mobx-react';

import editingVocabularyStore from '../stores/EditingVocabulary';

/**
 * Only one visible chip component for edit operations panel
 * @extends React
 */
export default
@observer class EditPanelChipForOneChip extends React.Component {
  /**
   * render
   * @return {element}
   */
  render() {
    const data = this.props.data;
    let label = this.props.label;
    let chipColor= '#bbdefb';

    if (data != label) {
      // Chips added by completion
      chipColor = '#ffcdd2';
    }

    const disp = this.props.needblankcheck=='true'?(!editingVocabularyStore.isBlankTerm( label)):true;


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

EditPanelChipForOneChip.propTypes = {
  data: PropTypes.string,
  label: PropTypes.string,
  needblankcheck: PropTypes.string,
};
