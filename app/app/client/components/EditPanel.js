/**
 * EditPanel.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import EditPanelVocabularyTab from './EditPanelVocabularyTab';
import EditTabPanel from './EditTabPanel';
import editingVocabularyStore from '../stores/EditingVocabulary';

/**
 * Edit operation panel component
 * @extends React
 */
export default class EditPanel extends React.Component {
  /**
   * Constructor
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
   * render
   * @return {element}
   */
  render() {
    return (
      <div className={this.props.classes.root}>
        {/* <AppBar position="static" color="default">
          <Tabs
            value={this.state.value}
            // onChange={(event, newValue) => this.setState({value: newValue})}
            aria-label="visualization panel tabs"
            indicatorColor="primary"
            textColor="inherit"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="語彙"
              {...this.a11yProps(0)}
              classes={{root: this.props.classes.tabs}}
            />
          </Tabs>
        </AppBar> */}
        <EditTabPanel value={this.state.value} index={0}>
          <EditPanelVocabularyTab
            classes={this.props.classes}
            editingVocabulary={editingVocabularyStore}
          />
        </EditTabPanel>
      </div>
    );
  }
}

EditPanel.propTypes = {
  classes: PropTypes.object,
};
