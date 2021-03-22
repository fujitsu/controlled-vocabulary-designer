/**
 * IndexTermList.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import {FixedSizeList} from 'react-window';

import IndexTerm from './IndexTerm';

import {observer} from 'mobx-react';

/**
 * Terms component
 * @extends React
 */
export default
@observer class IndexTermList extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {tabIndex: null, fileId: 0};
  }

  /**
   * Key event registration
   */
  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Update selected file information on update
   */
  componentDidUpdate() {
    const fileId = this.props.editingVocabulary.selectedFile.id;
    if (this.state.fileId !== fileId) {
      this.setState({tabIndex: null, fileId: fileId});
    }
  }

  /**
   * Vocabulary selection event
   * @param  {object} event - information of selected vocabulary
   */
  selectCurrentTerm(event) {
    if (event.keyCode == 32) {
      return;
    }
    const targetTerm = this.props.editingVocabulary.sortedNodeList;
    const currentTerm = event.target.textContent;
    for (let i = 0; i < targetTerm.length; i++) {
      if (targetTerm[i].term == currentTerm) {
        this.setState({tabIndex: i});
        break;
      }
    }
    this.props.editingVocabulary.setCurrentNodeByTerm(
        currentTerm,
    );
  }

  /**
   * Key event
   * @param  {object} event - information of key event
   */
  handleKeyDown(event) {
    const focusTerm = this.props.editingVocabulary.sortedNodeList;
    if (this.state.tabIndex !== null) {
      if (this.state.tabIndex > 0 && event.keyCode == 38) {
        this.setState({tabIndex: (this.state.tabIndex - 1)});
        this.props.editingVocabulary.setCurrentNodeByTerm(
            focusTerm[this.state.tabIndex].term,
        );
        this.props.editingVocabulary.scrollToCurrent();
      } else if (this.state.tabIndex < focusTerm.length - 1) {
        if (event.keyCode == 40 || event.keyCode == 32) {
          this.setState({tabIndex: (this.state.tabIndex + 1)});
          this.props.editingVocabulary.setCurrentNodeByTerm(
              focusTerm[this.state.tabIndex].term,
          );
          this.props.editingVocabulary.scrollToCurrent();
        }
      } else {
        // do nothing.
      }
    }
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const sortedNodeList = this.props.editingVocabulary.sortedNodeList;
    return (
      <div>
        <FixedSizeList
          ref={this.props.editingVocabulary.sortedNodeListRef}
          height={615}
          itemSize={55}
          itemCount={sortedNodeList.length}
          isScrolling={true}
          style={{overflowX: 'scroll'}}
        >
          {({index, style}) => (
            <IndexTerm
              index={index}
              style={style}
              editingVocabulary={this.props.editingVocabulary}
              classes={this.props.classes}
              selectCurrentTerm={(e)=> this.selectCurrentTerm(e)}
            >
            </IndexTerm>
          )}
        </FixedSizeList>
      </div>
    );
  }
}

IndexTermList.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
};
