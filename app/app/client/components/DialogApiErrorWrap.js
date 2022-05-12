/**
 * DialogApiErrorWrap.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import DialogApiError from './DialogApiError';

/**
 * DialogApiError Disp Component with mobx state management 
 * @extends React
 *
 */
export default
@observer class DialogApiErrorWrap extends React.Component {
  /**
   * Constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
  }

  /**
   * render
   * @return {element}
   */
  render() {
    return (
        <DialogApiError
          open={this.props.editingVocabulary.apiErrorDialog.open}
          classes={this.props.classes}
          editingVocabulary={this.props.editingVocabulary}
          close={() => this.props.editingVocabulary.closeApiErrorDialog()}
        />
    );
  }
}

DialogApiErrorWrap.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
};
