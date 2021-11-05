/**
 * VisualizationPanel.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import VisualizationPanelRelationWordTab
  from './VisualizationPanelRelationWordTab';
import VisualizationPanelVocabularyTab from './VisualizationPanelVocabularyTab';
import VisualizationTabPanel from './VisualizationTabPanel';

import editingVocabularyStore from '../stores/EditingVocabulary';

/**
 * Visualization screen panel components
 * @extends React
 */
export default class VisualizationPanel extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor() {
    super();
    this.state = {
      value: 0,
    };
  }

  /**
   * Tab property generation
   * @param  {number} index - id numbering
   * @return {object} - props
   */
  a11yProps(index) {
    return {
      'id': `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  /**
   * Tab selection event
   * @param  {object} event - information of event
   * @param  {number} newValue - selection tab index
   */
  selectTab(event, newValue) {
    if (newValue == 0 && editingVocabularyStore.getSelected(0)) {
      editingVocabularyStore.setSelected(0, false);
      this.setState({value: newValue});
    } else if (newValue == 1 && editingVocabularyStore.getSelected(1)) {
      editingVocabularyStore.setSelected(1, false);
      this.setState({value: newValue});
    } else {
      this.setState({value: newValue});
    }

    if (newValue == 0) {
      setTimeout(()=> {
        editingVocabularyStore.selectFile(0);
      }, 500);
    }

    editingVocabularyStore.selectCurrentVisualTab(newValue);

    if (newValue == 1) {
      // If panzoom is changed while the vocabulary tab is hidden (Selection of terms, etc.), panzoom will not be executed after the vocabulary tab is displayed because panzoom is not set to the correct position.
      setTimeout(() =>{
        editingVocabularyStore.fitToCurrent();
      }, 200);
    }
  }

  /**
   * render
   * @return {element}
   */
  render() {
    return (
      <div className={this.props.classes.root}>
        <AppBar position="static" color="default">
          <Tabs
            value={this.state.value}
            onChange={(event, newValue) => this.selectTab(event, newValue)}
            aria-label="visualization panel tabs"
            indicatorColor="primary"
            textColor="inherit"
            variant="scrollable"
            scrollButtons="auto"
          >
            {/* <Tab
              label="関連用語"
              {...this.a11yProps(0)}
              classes={{root: this.props.classes.tabs}}
            /> */}
            <Tab
              label="語彙"
              {...this.a11yProps(0)}
              classes={{root: this.props.classes.tabs}}
            />
          </Tabs>
        </AppBar>
        {/* <VisualizationTabPanel
          value={this.state.value}
          editingVocabulary={editingVocabularyStore}
          index={0}
        >
          <VisualizationPanelRelationWordTab
            classes={this.props.classes}
            editingVocabulary={editingVocabularyStore}
          />
        </VisualizationTabPanel> */}
        <VisualizationTabPanel
          value={this.state.value}
          editingVocabulary={editingVocabularyStore}
          index={0}
        >
          <VisualizationPanelVocabularyTab
            ref={editingVocabularyStore.visualVocRef}
            classes={this.props.classes}
            editingVocabulary={editingVocabularyStore}
          />
        </VisualizationTabPanel>
      </div>
    );
  }
}

VisualizationPanel.propTypes = {
  classes: PropTypes.object,
};
