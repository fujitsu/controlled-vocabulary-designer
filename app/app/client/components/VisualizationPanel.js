/**
 * VisualizationPanel.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { withStyles} from '@material-ui/core/styles';

import VisualizationPanelVocabularyTab from './VisualizationPanelVocabularyTab';
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
    
    editingVocabularyStore.selectFile(newValue);
    if (newValue == 0) {
      editingVocabularyStore.setSelected(0, true);
      editingVocabularyStore.setSelected(1, false);
    } else {
      editingVocabularyStore.setSelected(0, true);
      editingVocabularyStore.setSelected(1, true);
    }

    this.setState({value: newValue});

  }

  /**
   * render
   * @return {element}
   */
  render() {

    const hensyuName0 = this.props.hensyuName0; 
    const sansyouName1 = this.props.sansyouName1; 
    const sansyouName2 = this.props.sansyouName2; 
    const sansyouName3 = this.props.sansyouName3; 

    return(
      <div className={this.props.classes.root}>
        <Tabs
          value={this.state.value}
          onChange={(event, newValue) => this.selectTab(event, newValue)}
          aria-label="visualization panel tabs"
          textColor="inherit"
          variant="scrollable"
          scrollButtons="auto"
          classes={{root: this.props.classes.tabs}}
        >
          <Tab
            label="編集用語彙"
            {...this.a11yProps(0)}
            classes={{root: this.props.classes.tab,  selected: this.props.classes.selected}}
          />
          <Tab
            label="参照用語彙1"
            {...this.a11yProps(1)}
            classes={{root: this.props.classes.tab,  selected: this.props.classes.selected}}
            disabled={ !sansyouName1}
          />
          <Tab
            label="参照用語彙2"
            {...this.a11yProps(2)}
            classes={{root: this.props.classes.tab,  selected: this.props.classes.selected}}
            disabled={ !sansyouName2}
          />
          <Tab
            label="参照用語彙3"
            {...this.a11yProps(3)}
            classes={{root: this.props.classes.tab,  selected: this.props.classes.selected}}
            disabled={ !sansyouName3}
          />
        </Tabs>
        <VisualizationPanelVocabularyTab
          ref={editingVocabularyStore.visualVocRef}
          classes={this.props.classes}
          editingVocabulary={editingVocabularyStore}
          fileLoadCount={this.props.fileLoadCount}
          fileId={editingVocabularyStore.selectedFile.id}
        />
      </div>
    );
  }
}

VisualizationPanel.propTypes = {
  classes: PropTypes.object,
  hensyuName0: PropTypes.string,
  sansyouName1: PropTypes.string,
  sansyouName2: PropTypes.string,
  sansyouName3: PropTypes.string,
  fileLoadCount: PropTypes.number,
};
