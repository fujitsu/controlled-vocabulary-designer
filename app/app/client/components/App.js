/**
 * App.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import {grey} from '@material-ui/core/colors';
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
      overflowY: 'hidden !important',
      margin:'0 !important',
      padding:0,
    },
  },

  'root': {
    flexGrow: 1,
  },

  'mainPanel': {
    width: '100vw',
    height: '98vh',
    backgroundColor: '#E3E3E3',
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

  'sliderDivRoot': {
    height: '400px',  
    width: '50px',
    position: 'absolute',
    left: '15px',
    bottom: '15px',
    zIndex: 1,
    backgroundColor: 'white',
  },
  
  'sliderRoot':{
    height: '300px !important',  
    padding: '0 23px !important',
  },


  'sliderRail':{
    backgroundColor: grey[300],
    marginLeft:'-3px !important',
    width: '7px !important',
    borderRadius: '4px !important',

  },

  'sliderTrackt':{
    backgroundColor: grey[600],
    marginLeft:'-3px !important',
    width: '7px !important',
    borderRadius: '4px !important',
  },
  'sliderThumb':{
    backgroundColor: 'white',
    border: `2px solid ${grey[600]}`,
    marginLeft:'-4px !important',
    width: '8px !important',
    height: '8px !important',  
  },

  sliderMark:{
    backgroundColor: grey[400],
    marginLeft:'-4px !important',
    width: '8px !important',

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

  'searchRoot': {
    marginRight: '3px',
  },

  'selectIcon': {
    zIndex: 1,
    position: 'relative',
    left: '35px',
    top: '4px',
  },

  'conpaneIcon': {
    marginRight: '5px',
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
    width: '100vw',
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
  
  'visualizationVocabularyHead': {
    width: '100vw',
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
    marginRight:'8px',
    backgroundColor: '#555555',
    borderRadius: '0',
    boxShadow: 'none',
  },

  'buttonPrimary': {
    borderRadius: '0',
    boxShadow: 'none',
  },

  'buttonsGrp': {
    marginTop:'0',
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

  'buttonsDelete': {
    marginTop:'0',
    marginRight:'8px',
    borderRadius: '0',
    boxShadow: 'none',
  },

  'popoverPanelRoot': {
    backgroundColor: "#66666680",
  },
  'popoverPanelpaper': {
    borderRadius: '0',
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

  'selectTermForm': {
    width: '100%',
  },

  'selectTerm': {
    height: '40px',
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
      fileLoadCount: 0,
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
    this.setState({fileLoadCount : ++this.state.fileLoadCount })
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
            <Box className={this.props.classes.mainPanel}>
              <VisualizationPanel 
                classes={this.props.classes}
                hensyuName0={this.state.sFileName0}
                sansyouName1={this.state.sFileName1}
                sansyouName2={this.state.sFileName2}
                sansyouName3={this.state.sFileName3}
                fileLoadCount={this.state.fileLoadCount}
              />
            </Box>
          </Grid>
          {/* ↓Cannot be deleted because it affects apiErrorDialog. Fixed later */}
          <Box className={this.props.classes.displayNone}>
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
