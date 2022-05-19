/**
 * EditPanelVocabularyTab.js COPYRIGHT FUJITSU LIMITED 2021
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
import FormLabel from '@material-ui/core/FormLabel';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField'; 
import CreateIcon from '@material-ui/icons/Create';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';

import DialogApiError from './DialogApiError';

import {observer} from 'mobx-react';

import editingHistoryStore from '../stores/EditingHistory';

import SelectOfTerm from './SelectOfTerm';
import TextFieldOfSynonym from './TextFieldOfSynonym';
import TextFieldOfPreferredLabel from './TextFieldOfPreferredLabel';
import TextFieldOfId from './TextFieldOfId'; 
import TextFieldOfUri from './TextFieldOfUri';
import TextFieldOfBroaderTerm from './TextFieldOfBroaderTerm';
import TextFieldOfSubordinateTerm from './TextFieldOfSubordinateTerm';
import DialogUpdateVocabularyError from './DialogUpdateVocabularyError';
import DialogOkCancel from './DialogOkCancel';
import TextFieldOfTermDescription from './TextFieldOfTermDescription'; 
import TextFieldOfOtherVocSynUri from './TextFieldOfOtherVocSynUri'; 

/**
 * Edit Operation panel Vocabulary tab Component
 * @extends React
 *
 */
export default
@observer class EditPanelVocabularyTab extends React.Component {
  /**
   * Constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.tmpData={
        'ja':{
          synonym:'',
          preferredLabel:'',
          termDescription:'',
          broaderTerm:'',
          id:'',
        },
        'en':{
          synonym:'',
          preferredLabel:'',
          termDescription:'',
          broaderTerm:'',
          id:'',
        },
    },
    this.state = {
      disabledFlg: true,
      open: false,
      reason: '',
      synymact: false,
      prfrrdlblact: false,
      idofuriact: false,
      broadertermact: false,
      termdescriptionact: false, 
      defalutValue: this.props.editingVocabulary.currentNode.language,
    };
  }

  /**
   * Key event registration
   */
  componentDidMount() {
    // window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  componentWillUnmount() {
    this.clearTmpLangList();
  }

  /**
   * Key event
   * @param  {object} event - information of key event
   */
  handleKeyDown(event) {
    if (event.keyCode === 46) {
      if (this.state.synymact) {
        this.props.editingVocabulary.popSynonym();
      }
      if (this.state.prfrrdlblact) {
        this.props.editingVocabulary.popPreferredLabel();
      }
      if (this.state.idofuriact) {
        this.props.editingVocabulary.popIdofUri();
      }
      if (this.state.broadertermact) {
        this.props.editingVocabulary.popBroaderTerm();
      }
      if (this.state.termdescriptionact) { 
        this.props.editingVocabulary.popTermDescription(); 
      }
    }
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  }

  /**
   * Focus status update notification for each textField
   * @param  {string} target - target textFiled
   * @param  {bool} value - true:focusin, false:focusout
   */
  changeFocus(target, value) {
    this.setTmpLangList();
    switch (target) {
      case 'synonym':
        this.setState({synymact: value});
        break;
      case 'PreferredLabel':
        this.setState({prfrrdlblact: value});
        break;
      case 'Id':
        this.setState({idofuriact: value});
        break;
      case 'broaderTerm':
        this.setState({broadertermact: value});
        break;
      case 'TermDescription': 
        this.setState({termdescriptionact: value}); 
          break;
        break;
        defalut:
        break;
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
   * Disabled switching event
   */
   disabledToggle() {
    if (this.state.disabledFlg) {
      this.setState({
        disabledFlg: false,
        // editTerm: this.props.editingVocabulary.currentNode.term,
      });
    } else {
      this.setState({disabledFlg: true});
    }
  }

  /**
   * Update edits
   */
  updateVocabulary() {
    const baseTerm= this.props.editingVocabulary.currentNode.term;
    let setLang = false;
    if( this.props.editingVocabulary.tmpLanguage.list !=this.props.editingVocabulary.currentNode.language){
      this.props.editingVocabulary.languageSame();
      setLang = true;
    }else{
      this.props.editingVocabulary.languageChange();
    }
    this.settingTmpLangList();
    let ret = this.props.editingVocabulary.updateVocabulary( baseTerm);
    if (ret !== '') {
      this.errorDialogOpen(ret);
    }else{
      if(setLang){
        this.props.editingVocabulary.languageChange();
      }else{
        this.props.editingVocabulary.languageSame();
      }
      this.settingTmpLangList();
      let ret = this.props.editingVocabulary.updateVocabulary( baseTerm);

      if (ret !== '') {        
        editingHistoryStore.execUndo(); // undo
        // this.clearTmpLangList();
        this.errorDialogOpen(ret);
      }else{  // success
        // this.clearTmpLangList();
        console.log("---[ updateVocabulary() ]---"+baseTerm, )
      }
    }
  }

 

  /**
   * setting save tmp data
   */
  settingTmpLangList( setDiffLang = false){
    const tmpDt = this.getTmpLangList( setDiffLang);
    if( !tmpDt){
      return;
    }

    if(tmpDt.synonym 
      && ((tmpDt.synonym.length != this.props.editingVocabulary.tmpSynonym.list.length )
      || (JSON.stringify( tmpDt.synonym) != JSON.stringify(this.props.editingVocabulary.tmpSynonym.list)))){
      this.props.editingVocabulary.tmpSynonym.list = tmpDt.synonym;
    }
    
    if(tmpDt.preferredLabel 
      &&  (JSON.stringify( tmpDt.preferredLabel) != JSON.stringify(this.props.editingVocabulary.tmpPreferredLabel.list))){
      this.props.editingVocabulary.tmpPreferredLabel.list = tmpDt.preferredLabel;
    }
    if(tmpDt.termDescription 
      && (JSON.stringify( tmpDt.termDescription) != JSON.stringify(this.props.editingVocabulary.tmpTermDescription.list))){
      this.props.editingVocabulary.tmpTermDescription.list = tmpDt.termDescription;
    }
    if(tmpDt.broaderTerm 
      &&  (JSON.stringify( tmpDt.broaderTerm) != JSON.stringify(this.props.editingVocabulary.tmpBroaderTerm.list))){
      this.props.editingVocabulary.tmpBroaderTerm.list = tmpDt.broaderTerm;
    }
    if(tmpDt.id 
      &&  (JSON.stringify( tmpDt.id) != JSON.stringify(this.props.editingVocabulary.tmpIdofUri.list))){
      this.props.editingVocabulary.tmpIdofUri.list = tmpDt.id;
    }
  }

  /**
   * get save tmp data for the selected language
   * @return {object} - Tmp data for the selected language
   */
  getTmpLangList( setDiffLang = false) {
    if( !this.props.editingVocabulary.tmpLanguage.list){
      return null;      
    }else if( setDiffLang){
      return this.tmpData[ this.props.editingVocabulary.tmpLanguage.list == 'ja'?'en':'ja' ];
    }else{
      return this.tmpData[this.props.editingVocabulary.tmpLanguage.list];
    }
  }

  /**
   * set save tmp data
   */
  setTmpLangList() {
    if( this.props.editingVocabulary.tmpLanguage.list){
      this.tmpData[ this.props.editingVocabulary.tmpLanguage.list]={
        synonym: this.props.editingVocabulary.tmpSynonym.list , 
        preferredLabel: this.props.editingVocabulary.tmpPreferredLabel.list,
        termDescription: this.props.editingVocabulary.tmpTermDescription.list,
        broaderTerm: this.props.editingVocabulary.tmpBroaderTerm.list,
      }

      // id has the same value for ja and en
      this.tmpData['ja'].id=this.props.editingVocabulary.tmpIdofUri.list;
      this.tmpData['en'].id=this.props.editingVocabulary.tmpIdofUri.list;
    }
  }
  
  /**
   * Clear save tmp data
   */
  clearTmpLangList() {
    this.tmpData={
      'ja':{
        synonym:[],
        preferredLabel:'',
        termDescription:'',
        broaderTerm:'',
        id:'',
      },
      'en':{
        synonym:[],
        preferredLabel:'',
        termDescription:'',
        broaderTerm:'',
        id:'',
      },
    }
  }
 
  /**
   * radio change
   * @param  {object} event - information of key event
   */
   handleRadioChange(e){
    this.setState({defalutValue: e.target.value});
    
    this.setTmpLangList();  // save tmp values

    if (e.target.value != this.props.editingVocabulary.currentNode.language) {
      this.props.editingVocabulary.languageChange();
    }else {
      this.props.editingVocabulary.languageSame();
    }
    this.settingTmpLangList();
  }

  /**
   * Term select change
   * @param  {String} lang - string of changed lang
   */
   handleTermChange( lang){
    this.clearTmpLangList();
    this.props.editingVocabulary.currentNodeClear();
    this.setState({defalutValue: lang});
  }

  /**
   * Is there any pending data in the language you haven't selected
   * @return {boolean} - true:
   */
   isCurrentDiffNodeChanged(){
    const editingVocabulary = this.props.editingVocabulary;
    if( !editingVocabulary.currentNode.id){
      return false;
    }

    const tmpData = this.getTmpLangList( true);
    if( 1 > tmpData.length){
      return false;
    }
    if( editingVocabulary.isPrfrdLblChanged(true, tmpData.preferredLabel)){
      return true;
    }
    if( editingVocabulary.isBrdrTermChanged(true, tmpData.broaderTerm)){
      return true;
    }
    if( editingVocabulary.isTermDescriptionChanged(true, tmpData.termDescription)){
      return true;
    }
    return false;
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const editingVocabulary = this.props.editingVocabulary;
    let fileId = editingVocabulary.selectedFile.id;
    // Change border color disabled
    let disabledColor = true;
    if ( fileId == 0 && editingVocabulary.currentNode.id) {
      // Allow each component to operate during editing vocabulary selection and term selection
      disabledColor = false;
    }

    // Firm button disabled condition
    // You can control the confirm button when the term in the edited vocabulary is selected and there is no change in the synonym, preferred label, URI or broader term.
    const isCurrentNodeChanged =
      editingVocabulary.isCurrentNodeChanged || this.isCurrentDiffNodeChanged();
    const disabledConfirm = disabledColor || isCurrentNodeChanged ? true:false;

    const confirmed = editingVocabulary.currentNode.confirm;
    let isConfirm = false;
    if (confirmed && confirmed == 1) {
      isConfirm = true;
    }

    // Disabled determination of TextField area
    // Undetermined while selecting a term when editing vocabulary pulldown is selected:enabled
    // No term selected when selecting vocabulary pull-down for editing:enabled
    const disabledTextField =
     ( !isConfirm && this.props.editingVocabulary.currentNode.id) ||
       ( !this.props.editingVocabulary.currentNode.id) ? false : true;

    return (
      <div className={this.props.classes.editPanelVoc} onKeyDown={(e)=>this.handleKeyDown.bind(e)}>
        {/* <Grid container style={{margin: '0.25rem', marginTop: '0.25rem'}}> */}
        <Grid container spacing={2}>
          <Box p={1} width="400px">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box>
                  <SelectOfTerm
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    change={(lang)=>this.handleTermChange( lang)}
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container className={this.props.classes.editPanelVocUsageGap}>
              <Grid item xs={4}>
              </Grid>
              <Grid item xs={4} style={{textAlign: 'right'}}>
                <Typography variant="caption">
                  既存の設定：
                  <Chip
                    size="small" 
                    label="　"
                    onDelete={()=>{}}
                    style={{backgroundColor: '#bbdefb'}}
                  />

                </Typography>
              </Grid>
              <Grid item xs={4} style={{textAlign: 'right'}}>
                <Box mr={0}>
                  <Typography variant="caption">
                    新規の設定：
                    <Chip
                      size="small" 
                      label="　"
                      onDelete={()=>{}}
                      style={{backgroundColor: '#ffcdd2'}}
                    />
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Grid container style={{margin: '0.25rem', marginTop: '0.25rem'}}>
              {/* <Box border={1} p={1} width="430px" height='400px' style={{ overflowX: 'hidden', overflowY: 'auto'}}> */}
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                  </Grid>
                  <Grid item xs={9}>
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
              {/* </Box> */}
            </Grid>
        

            <Grid container spacing={2}>
              <Grid item xs={2}>
                <Box mt={1}>
                  同義語
                </Box>
              </Grid>
              <Grid item xs={10}>
                <Box>
                  <TextFieldOfSynonym
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    disabled={disabledTextField}
                    change={
                      (target, value) => this.changeFocus(target, value)
                    }
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={2} className={this.props.classes.editPanelVocVerticalGap}>
              <Grid item xs={2}>
                <Box mt={1}>
                  代表語
                </Box>
              </Grid>
              <Grid item xs={10}>
                <Box>
                  <TextFieldOfPreferredLabel
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    disabled={disabledTextField}
                    change={
                      (target, value) => this.changeFocus(target, value)
                    }
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={2} className={this.props.classes.editPanelVocVerticalGap}>
              <Grid item xs={2}>
                <Box mt={1}>
                  ID
                </Box>
              </Grid>
              <Grid item xs={10}>
                <Box>
                  <TextFieldOfId
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    disabled={disabledTextField}
                    change={
                      (target, value) => this.changeFocus(target, value)
                    }
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={2} className={this.props.classes.editPanelVocVerticalGap}>
              <Grid item xs={5}>
                <Box mt={1}>
                  代表語のURI
                    <CreateIcon
                      onClick={()=>this.disabledToggle()}
                      disabled={disabledTextField}
                    />
                </Box>
              </Grid>
              <Grid item xs={7}>
                <Box>
                  <TextFieldOfUri
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    uri={this.props.editingVocabulary.currentNode.uri}
                    disabled={disabledTextField}
                    disabledFlg={this.state.disabledFlg}
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={2} className={this.props.classes.editPanelVocVerticalGap}>
              <Grid item xs={2}>
                <Box mt={1}>
                  上位語
                </Box>
              </Grid>
              <Grid item xs={10}>
                <Box>
                  <TextFieldOfBroaderTerm
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    disabled={disabledTextField}
                    change={
                      (target, value) => this.changeFocus(target, value)
                    }
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={2} className={this.props.classes.editPanelVocVerticalGap}>
              <Grid item xs={2}>
                <Box mt={1}>
                  下位語
                </Box>
              </Grid>
              <Grid item xs={10}>
                <Box>
                  <TextFieldOfSubordinateTerm
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    fileId={fileId}
                  />
                </Box>
              </Grid>
            </Grid>
            <Grid container spacing={2} className={this.props.classes.editPanelVocVerticalGap}>
              <Grid item xs={2}>
                <Box mt={1}>
                  用語の説明
                </Box>
              </Grid>
              <Grid item xs={10}>
                <Box>
                  <TextFieldOfTermDescription
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    disabled={disabledTextField}
                    change={
                      (target, value) => this.changeFocus(target, value)
                    }
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={2} className={this.props.classes.editPanelVocVerticalGap}>
              <Grid item xs={2}>
                <Box mt={1}>
                  他語彙体系の同義語のURI
                </Box>
              </Grid>
              <Grid item xs={10}>
                <Box>
                  <TextFieldOfOtherVocSynUri
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    fileId={fileId}
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container>
              <Grid item xs={6}>
              </Grid>
              <Grid item xs={2}>
                <Button
                  className={this.props.classes.buttonPrimary}
                  variant="contained"
                  color="primary"
                  size={'small'}
                  onClick={()=>this.updateVocabulary()}
                  disabled={!isCurrentNodeChanged}
                >
                  反映
                </Button>
                <DialogUpdateVocabularyError
                  onClose={() => this.errorDialogClose()}
                  open={this.state.open}
                  classes={this.props.classes}
                  editingVocabulary={this.props.editingVocabulary}
                  isFromEditPanel={true}
                  reason={this.state.reason}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        <DialogApiError
          open={this.props.editingVocabulary.apiErrorDialog.open}
          classes={this.props.classes}
          editingVocabulary={this.props.editingVocabulary}
          close={() => this.props.editingVocabulary.closeApiErrorDialog()}
        />
      </div>
    );
  }
}

EditPanelVocabularyTab.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
  close: PropTypes.func,
};
