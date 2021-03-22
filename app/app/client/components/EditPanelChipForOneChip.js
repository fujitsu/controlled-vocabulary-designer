/**
 * EditPanelChipForOneChip.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Chip from '@material-ui/core/Chip';

import {observer} from 'mobx-react';

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

    // Match a simple prefix (label) with a formal URI
    if (this.props.config) {
      const prefixList = this.props.config.prefix;
      const foundPrefix = prefixList.find((prefix) => {
        return label.startsWith(prefix.equiv);
      });
      if (foundPrefix) {
        label = label.replace(foundPrefix.equiv, foundPrefix.origin);
      }
    }

    if (data != label) {
      // Chips added by completion
      chipColor = '#ffcdd2';
    }


    return (
      <Chip
        style={{backgroundColor: chipColor}}
        {...this.props}
      />
    );
  }
}

EditPanelChipForOneChip.propTypes = {
  data: PropTypes.string,
  label: PropTypes.string,
  config: PropTypes.object,
};
