/**
 * App.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import ControlPanel from './ControlPanel';
import VisualizationPanel from './VisualizationPanel';
import EditPanel from './EditPanel';
import DialogApiError from './DialogApiError';

import editingVocabularyStore from '../stores/EditingVocabulary';

const useStyles = (theme) => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
      overflowY: 'scroll',
    },
  },

  'root': {
    flexGrow: 1,
  },

  'mainPanel': {
    height: '680px',
  },

  'colorChartCheckBox': {
    marginRight: '-6px',
  },

  'autocompleteInputRoot': {
    overflowX: 'scroll',
    flexWrap: 'nowrap',
  },

  'autocompleteDisabledInputRoot': {
    overflowX: 'scroll',
    flexWrap: 'nowrap',
    backgroundColor: 'rgba(0, 0, 0, 0.09)',
  },

  'autocompleteDisabledTag': {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },

  'displayNone': {
    display: 'none',
  },

  'textField': {
    margin: 0,
    width: '100%',
    overflowX: 'scroll',
    flexWrap: 'nowrap',
  },

  'width100': {
    width: '100%',
  },

  'noWrap': {
    whiteSpace: 'nowrap',
  },

  'underlineNone': {
    '&:before': {
      border: '0px',
    },
    '&:after': {
      border: '0px',
    },
  },

  'searchRoot': {
    position: 'absolute',
    zIndex: 1,
    margin: '15px',
    backgroundColor: 'white',
  },

  'search': {
    position: 'relative',
    width: '100%',
  },

  'searchIcon': {
    width: '60%',
    height: '100%',
  },

  'inputRoot': {
    color: 'inherit',
    width: '100%',
  },

  'inputInput': {
    paddingLeft: theme.spacing(4),
    width: '100%',
  },

  'exampleInput': {
    padding: theme.spacing(1),
  },

  'muiDialogTitle': {
    margin: 0,
    padding: theme.spacing(2),
  },

  'muiDialogTitleCloseButton': {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },

  'visualizationVocabularyHead': {
    width: '50%',
    position: 'absolute',
    zIndex: 2,
  },

  'fileSelecter': {
    zIndex: 1,
    marginTop: '15px',
    paddingLeft: '10px',
    paddingRight: '10px',
    paddingBottom: '0px',
    paddingTop: '0px',
    backgroundColor: 'white',
  },

  'tabs': {
    '@media (min-width: 600px)': {
      minWidth: '100px',
    },
  },

  'uploading': {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },

  'selectFileFormat': {
    'width': '120px',
    'height': '30px',
    'borderRadius': 4,
    'position': 'relative',
    'backgroundColor': theme.palette.background.paper,
    'border': '1px solid #ced4da',
    'fontSize': 16,
    'marginTop': '18.5px',
    'transition': theme.transitions.create(['border-color', 'box-shadow']),
    '&:focus': {
      borderRadius: 4,
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
  },

  'formControl': {
    marginLeft: theme.spacing(1),
    padding: '0px',
    minWidth: 120,
  },

  'fileUploadDialog': {
    minWidth: '300px',
  },

  'iconImg': {
    padding: theme.spacing(1),
    marginLeft: theme.spacing(3),
    width: '119px',
    height: '75px',
  },

  'sliderGridRoot': {
    width: '40%',
    position: 'absolute',
    zIndex: 1,
    marginTop: 530,
    marginLeft: theme.spacing(3),
  },

  'homotopicSlider': {
    marginLeft: '5px',
  },

  'opacitySlider': {
    marginLeft: '45px',
  },

  'selectTerm': {
    width: '100%',
    textAlign: 'center',
  },
  
});

/**
 * App
 * @extends React
 */
class App extends React.Component {
  /**
   * App launching mount post-processing
   * Get db data
   */
  componentDidMount() {
    editingVocabularyStore.getPartOfSpeechFilter();
    editingVocabularyStore.getReferenceVocabularyDataFromDB('1');
    editingVocabularyStore.getReferenceVocabularyDataFromDB('2');
    editingVocabularyStore.getReferenceVocabularyDataFromDB('3');
    editingVocabularyStore.getEditingVocabularyDataFromDB();
  }

  /**
   * render
   * @return {element}
   */
  render() {
    return (
      <div className={this.props.classes.root}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <ControlPanel
              classes={this.props.classes}
              editingVocabulary={editingVocabularyStore}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Box border={1} className={this.props.classes.mainPanel}>
              <VisualizationPanel classes={this.props.classes}/>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box border={1} className={this.props.classes.mainPanel}>
              <EditPanel classes={this.props.classes}/>
            </Box>
          </Grid>
        </Grid>
        <DialogApiError
          open={editingVocabularyStore.apiErrorDialog.open}
          classes={this.props.classes}
          close={() => editingVocabularyStore.closeApiErrorDialog()}
          editingVocabulary={editingVocabularyStore}
        />
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object,
};

export default withStyles(useStyles)(App);
