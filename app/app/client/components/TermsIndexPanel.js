/**
 * TermsIndexPanel.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import {observer} from 'mobx-react';

import editingVocabularyStore from '../stores/EditingVocabulary';

import SortSelect from './SortSelect';
import IndexTermList from './IndexTermList';

/**
 * Term list panel component
 * @extends React
 */
export default
@observer class TermsIndexPanel extends React.Component {
  /**
   * render
   * @return {element}
   */
  render() {
    return (
      <div>
        <SortSelect
          classes={this.props.classes}
          editingVocabulary={editingVocabularyStore}
        />
        <IndexTermList
          classes={this.props.classes}
          editingVocabulary={editingVocabularyStore}
        />
      </div>
    );
  }
}

TermsIndexPanel.propTypes = {
  classes: PropTypes.object,
};
