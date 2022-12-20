/**
 * EditPanelMetaTab.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import DialogApiMetaError from './DialogApiMetaError';

import {observer} from 'mobx-react';

import TextFieldOfMetaName from './TextFieldOfMetaName';
import TextFieldOfMetaVersion from './TextFieldOfMetaVersion';
import TextFieldOfMetaUri from './TextFieldOfMetaUri';
import TextFieldOfMetaPrefix from './TextFieldOfMetaPrefix';
import TextFieldMultiLine from './TextFieldMultiLine';
import TextFieldOfMetaAuthor from './TextFieldOfMetaAuthor';
import DialogUpdateMetaError from './DialogUpdateMetaError'; 

/**
 * Edit Meta Operation panel Vocabulary tab Component
 * @extends React
 *
 */
export default
@observer class EditPanelMetaTab extends React.Component {
  /**
   * Constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.rootElm = undefined;
    this.state = {
      open: false,
      snackOpen: false, 
      message: '',
      reason: '',
      metaName: '',
      metaNameEn: '',
      metaVersion: '',
      metaUri: '',
      metaPrefix: '',
      metaAuthor: '',
      metaDescription: '',
      metaDescriptionEn: '',
      defalutValue: 'ja', 
    };
  }

  /**
   * Key event registration
   */
  componentDidMount() {
    this.props.editingVocabularyMeta.getEditingVocabularyMetaDataFromDB();
    if( undefined != this.props.editingVocabularyMeta.editingVocabularyMeta ){          
        this.setState({
          metaName: this.props.editingVocabularyMeta.editingVocabularyMeta.meta_name,
          metaNameEn: this.props.editingVocabularyMeta.editingVocabularyMeta.meta_enname,
          metaVersion: this.props.editingVocabularyMeta.editingVocabularyMeta.meta_version,
          metaUri: this.props.editingVocabularyMeta.editingVocabularyMeta.meta_uri,
          metaPrefix: this.props.editingVocabularyMeta.editingVocabularyMeta.meta_prefix,
          metaAuthor: this.props.editingVocabularyMeta.editingVocabularyMeta.meta_author,
          metaDescription: this.props.editingVocabularyMeta.editingVocabularyMeta.meta_description,
          metaDescriptionEn: this.props.editingVocabularyMeta.editingVocabularyMeta.meta_endescription,
        });
    } 
    // window.addEventListener('keydown', this.handleKeyDown.bind(this));
    // window.removeEventListener('keydown', this);
    this.rootElm = document.getElementById('vocabulary_meta_panel');
    if( this.rootElm){
      this.rootElm.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    this.rootElm&&this.rootElm.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  // componentWillUnmount(){
  //   if( this.rootElm){
  //     this.rootElm.removeEventListener('keydown', this.handleKeyDown);
  //   }
  // }

  /**
  * Key event
  * @param  {object} event - information of key event
  */
  handleKeyDown(event) {
    if (event.keyCode === 13) {
      //return false;
      console.log("meta keydown hogehoge");
    }
    // event.stopPropagation();
    event.preventDefault();

  }

  /**
   * Warning displaying snackbar events
   * @param {String} errorMsg - error message
   */
   openSnackbar(errorMsg) {
    this.setState({snackOpen: true, message: errorMsg});
  }

  /**
   * Warning hiding snackbar event
   */
   closeSnackbar() {
    this.setState({snackOpen: false, message: ''});
  };

  /**
   * textField
   * @param  {text} value 
  //  */
  changeMetaName( value) {
    if(this.state.defalutValue=='ja') {
      this.props.editingVocabularyMeta.updataMetaName(value);
      this.setState({metaName: value});
      if( value.trim() === ''){
        this.openSnackbar('「語彙の名称」を入力してください。');
      }else{
        this.closeSnackbar();
      }
    }else {
      this.props.editingVocabularyMeta.updataMetaEnName(value);
      this.setState({metaNameEn: value});
    }
  }
  changeMetaVer( value) {
    this.props.editingVocabularyMeta.updataMetaVersion(value);
    this.setState({metaVersion: value});
  }
  changeMetaUri( value) {
    this.props.editingVocabularyMeta.updataMetaUri(value);
    this.setState({metaUri: value});
    if( value.trim() === ''){
      this.openSnackbar('「語彙のURI」を入力してください。');
    }else{
      this.closeSnackbar();
    }
  }
  changeMetaPrefix( value) {
    this.props.editingVocabularyMeta.updataMetaPrefix(value);
    this.setState({metaPrefix: value});
  }
  changeMetaAuthor( value) {
    this.props.editingVocabularyMeta.updataMetaAuthor(value);
    this.setState({ metaAuthor: value});
  }
  changeMetaDescription( value) {
    if(this.state.defalutValue=='ja') {
      this.props.editingVocabularyMeta.updataMetaDescription(value);
      this.setState({metaDescription: value});
    }else {
      this.props.editingVocabularyMeta.updataMetaEnDescription(value);
      this.setState({metaDescriptionEn: value});
    }
  }

  /**
   * Error dialog open
   * @param  {string} ret - error content
   */
  errorDialogOpen(ret) {
    this.setState({open: true, reason: ret});
  }

  /**
   * Error dialog close
   */
  errorDialogClose() {
    this.setState({open: false, reason: ''});
  }

  /**
   * Update edits
   */
  updateMetaData() {
    
    const ret = this.props.editingVocabularyMeta.updateMetaData(this.props.editingVocabulary.editingVocabulary);
    if (ret !== '') {
      this.errorDialogOpen(ret);
    }else{
      this.props.close();
    }
  }
  
  /**
   * radio change
   * @param  {object} event - information of key event
   */
   handleRadioChange(e){
    this.setState({defalutValue: e.target.value});
  }
  
  /**
   * render
   * @return {element}
   */
  render() {        
    // Firm button disabled condition
    const isCurrentNodeChanged =
      this.props.editingVocabularyMeta.isCurrentNodeChanged;

    const disabledTextField = false;
    const bgcolor = disabledTextField?'rgba(0, 0, 0, 0.09)':'rgba(0, 0, 0, 0)'
    let metaName='';
    let metaDescription='';
    if(this.state.defalutValue=='ja'){
      metaName = this.state.metaName ;
      metaDescription = this.state.metaDescription;
    }else{
      metaName = this.state.metaNameEn ;
      metaDescription = this.state.metaDescriptionEn;
    }
    const metaVersion = this.state.metaVersion ? this.state.metaVersion : '';
    const metaUri = this.state.metaUri ? this.state.metaUri : '';
    const metaPrefix = this.state.metaPrefix ? this.state.metaPrefix : '';
    const metaAuthor = this.state.metaAuthor ? this.state.metaAuthor : '';

    return (
      <div id='vocabulary_meta_panel'>
        <Grid container style={{margin: '0.25rem', marginTop: '0.25rem'}}>
          <Box p={1} width="430px" height='100%' padding='20px' style={{ overflowX: 'hidden', overflowY: 'auto'}}>
            <Grid container spacing={2}>
              <Grid item xs={5}>
              </Grid>
              <Grid item xs={7}>
                <FormControl component="fieldset">
                  <RadioGroup row 
                    onChange={(e)=>this.handleRadioChange(e)}
                    aria-label="language" 
                    name="language" 
                    value={this.state.defalutValue}
                  >
                    <FormControlLabel 
                      value="ja" 
                      control={<Radio color="primary" />} 
                      label="日本語" 
                    />
                    <FormControlLabel 
                      value="en" 
                      control={<Radio color="primary" />} 
                      label="英語" 
                    />
                  </RadioGroup>
                </FormControl>  
              </Grid> 
            </Grid>
            <Grid container spacing={1}>
              <Grid item xs={5}>
                <Box mt={1}>
                  語彙の名称<span style={{color: 'red'}}>*</span>
                </Box>
              </Grid>
              <Grid item xs={7}>
                <Box>
                  <TextFieldOfMetaName
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    editingVocabularyMeta={this.props.editingVocabularyMeta}
                    disabled={disabledTextField}
                    value={metaName}
                    change={(value) => this.changeMetaName(value) }
                  />
                </Box>
              </Grid>
            </Grid>
            <Grid container spacing={1}>
              <Grid item xs={5}>
                <Box mt={1}>
                  バージョン
                </Box>
              </Grid>
              <Grid item xs={7}>
                <Box>
                  <TextFieldOfMetaVersion
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    editingVocabularyMeta={this.props.editingVocabularyMeta}
                    disabled={disabledTextField}
                    value={metaVersion}
                    change={(value) => this.changeMetaVer(value) }
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={1}>
              <Grid item xs={5}>
                <Box mt={1}>
                  語彙のURI<span style={{color: 'red'}}>*</span>
                </Box>
              </Grid>
              <Grid item xs={7}>
                <Box>
                  <TextFieldOfMetaUri
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    editingVocabularyMeta={this.props.editingVocabularyMeta}
                    disabled={disabledTextField}
                    value={metaUri}
                    change={(value) => this.changeMetaUri(value) }
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={1}>
              <Grid item xs={5}>
                <Box mt={1}>
                  語彙のURIの省略語
                </Box>
              </Grid>
              <Grid item xs={7}>
                <Box>
                  <TextFieldOfMetaPrefix
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    editingVocabularyMeta={this.props.editingVocabularyMeta}
                    disabled={disabledTextField}
                    value={metaPrefix}
                    change={(value) => this.changeMetaPrefix(value) }
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={1}>
              <Grid item xs={5}>
                <Box mt={1}>
                語彙の説明
                </Box>
              </Grid>
              <Grid item xs={7}>
                <Box>
              <TextFieldMultiLine
                classes={this.props.classes}
                editingVocabulary={this.props.editingVocabulary}
                disabled={disabledTextField}
                backcolor={undefined}
                value={metaDescription}
                change={(value) => this.changeMetaDescription(value) }
              />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={1}>
              <Grid item xs={5}>
                <Box mt={1}>
                  語彙の作成者
                </Box>
              </Grid>
              <Grid item xs={7}>
                <Box>
                  <TextFieldOfMetaAuthor
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    editingVocabularyMeta={this.props.editingVocabularyMeta}
                    disabled={disabledTextField}
                    value={metaAuthor}
                    change={(value) => this.changeMetaAuthor(value) }
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={5}>
                <Box>
                </Box>
              </Grid>
              { !this.props.submitDisabled &&
              <Grid item xs={4}>
                <Box mt={2} mb={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    size={'small'}
                    onClick={()=>this.updateMetaData()}
                    disabled={!isCurrentNodeChanged}
                  >
                    反映
                  </Button>
                  
                  <DialogUpdateMetaError
                    onClose={() => this.errorDialogClose()}
                    open={this.state.open}
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    editingVocabularyMeta={this.props.editingVocabularyMeta}
                    isFromEditPanel={true}
                    reason={this.state.reason}
                  />
                </Box>
              </Grid>
              }
            </Grid>

          </Box>
        </Grid>

        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          open={this.state.snackOpen}
          // onClose={() => this.closeSnackbar()}
          autoHideDuration={3000}
          message={this.state.message}
          action={
            <React.Fragment>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => this.closeSnackbar()}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
        <DialogApiMetaError
          open={this.props.editingVocabularyMeta.apiErrorDialog.open}
          classes={this.props.classes}
          editingVocabulary={this.props.editingVocabulary}
          editingVocabularyMeta={this.props.editingVocabularyMeta}
          close={() => this.props.editingVocabularyMeta.closeApiErrorDialog()}
        />
      </div>
    );
  }
}

EditPanelMetaTab.propTypes = {
  editingVocabulary: PropTypes.object,
  editingVocabularyMeta: PropTypes.object,
  classes: PropTypes.object,
  submitDisabled: PropTypes.bool,
  value: PropTypes.bool,
  close: PropTypes.func,
};
