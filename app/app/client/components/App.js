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
    width: '97vw',
    height: '90vh',
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
    marginTop: '0',
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

  'tabs': {
    backgroundColor: '#555555',
    minHeight: '35px',
    height: '35px',
    width: '97vw',
    "& .MuiTabs-indicator": {
      display: "none",
    }
  },

  'tab': {
    '@media (min-width: 600px)': {
      minWidth: '100px',
      minHeight: '35px',
      height: '35px',
      color: 'white',
      marginTop: '5px',
      marginLeft: '15px',
      '&$selected': {
        backgroundColor: '#BEBEBE',
        color: '#333333',
        borderRadius: '5px 5px 0 0',
      },
    },
    'selected': {},
  },
  'selected': {},

  'tabToolTip': {    
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    // maxWidth: 220,
    // fontSize: theme.typography.pxToRem(12),
    // border: '1px solid #dadde9',
    marginTop: '-20px',
  },
  
  'visualizationVocabularyHead': {
    width: '97vw',
    height: '50px',
    margin: 0,
    position: 'absolute',
    zIndex: 2,
    backgroundColor: '#99999980',
  },

  'buttonsTop': {
    marginTop:'0',
    marginRight:'8px',
    paddingTop: '0',
    paddingBottom: '4px',
  },

  'buttons': {
    marginTop:'0',
    marginRight:'16px',
    backgroundColor: '#555555',
    borderRadius: '0',
    boxShadow: 'none',
  },

  'buttonsNewAdd': {
    marginTop:'0',
    marginRight:'8px',
    borderRadius: '0',
    boxShadow: 'none',
  },

  'popoverTitle': {
    minWidth: "90%",
    paddingLeft: "20px",
    borderBottom: 'solid 1px #eee',
    display: "flex",
    justifyContent: "space-between",
    Height: "48px",
    lineHeight: "48px"
  },

  'popoverTitleCloseButton': {
    position: 'absolute',
    right: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  
  'closeTitle': {    
    height: '30px',
    textAlign: 'right',
    paddingTop: '5px',
    paddingRight: '10px',
    color: theme.palette.grey[500],
  },

  'closeButton': {
    position: 'absolute',
    right: theme.spacing(1),
    top:   '4px',
  },

  'dlgFileDownloadTitle': {
    justifyContent: "space-between",
    paddingRight: '15px',

  },

  'editPanelVoc': {
    padding: '30px',
  },

  'editPanelVocVerticalGap': {
    marginTop: '10px',
  },

  'editPanelVocUsageGap': {
    marginTop: '10px',
    marginBottom: '2px',
  },


  'fileSelecter': {
    zIndex: 1,
    marginTop: '15px',
    paddingLeft: '10px',
    paddingRight: '10px',
    paddingBottom: '0px',
    paddingTop: '0px',
    backgroundColor: 'white',
    float: 'right',
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
  
  'selectSynonymDialog': {
    'width': 'auto',
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
   * constructor
   * @param {object} props
   */
  constructor() {
    super();
    this.state = {
      sFileName0: '',
      sFileName1: '',
      sFileName2: '',
      sFileName3: '',
    };
  }
  /**
   * App launching mount post-processing
   * Get db data
   */
  async componentDidMount() {

    editingVocabularyStore.getEditingVocabularyDataFromDB();
    await editingVocabularyStore.getReferenceVocabularyDataFromDB('1');
    await editingVocabularyStore.getReferenceVocabularyDataFromDB('2');
    await editingVocabularyStore.getReferenceVocabularyDataFromDB('3');

    await this.readFileChack();
  }

  readFileChack(){
    setTimeout(()=> {
      this.readFileSet();
    }, 3000);
  }
  
  readFileSet(){
    this.setState({
      sFileName0: localStorage.getItem('sFileName0') || (editingVocabularyStore.editingVocabulary.length > 0?' ':''),
      sFileName1: localStorage.getItem('sFileName1') || (editingVocabularyStore.referenceVocabulary1.length > 0?' ':''),
      sFileName2: localStorage.getItem('sFileName2') || (editingVocabularyStore.referenceVocabulary2.length > 0?' ':''),
      sFileName3: localStorage.getItem('sFileName3') || (editingVocabularyStore.referenceVocabulary3.length > 0?' ':''),
    });
  
  }

  onReadFileChange(){

    this.readFileSet();
  }

  /**
   * render
   * @return {element}
   */
  render() {
    return (
      <div className={this.props.classes.root}>
        <Grid container>
          <Grid item xs={12}>
            <ControlPanel
              classes={this.props.classes}
              editingVocabulary={editingVocabularyStore}
              onReadFileChange = {() => this.onReadFileChange()}
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            <Box border={1} className={this.props.classes.mainPanel}>
              <VisualizationPanel 
                classes={this.props.classes}
                hensyuName0={this.state.sFileName0}
                sansyouName1={this.state.sFileName1}
                sansyouName2={this.state.sFileName2}
                sansyouName3={this.state.sFileName3}
              />
            </Box>
          </Grid>
          {/* ↓Cannot be deleted because it affects apiErrorDialog. Fixed later */}
          <Box border={1} className={this.props.classes.displayNone}>
            <EditPanel classes={this.props.classes}/>
          </Box>
          {/* ↑Cannot be deleted because it affects apiErrorDialog. Fixed later */}
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
