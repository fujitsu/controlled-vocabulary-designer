/**
 * DialogSettingSynonym.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import DialogOkCancel from './DialogOkCancel';

/**
 * Select a representative word when setting synonyms dialog
 * @extends React
 */
export default class DialogSettingSynonym extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.preferredList = {ja:[], en:[]};
    this.broaderList = {ja:[], en:[]};
    this.broaderClassName = this.props.classes.displayNone;
    this.message = '代表語を選択してください';
    this.state = {
      dlgOpen: false,      // dialog 
      selectPreferred_Ja: '',
      selectPreferred_En: '',
      selectBroader_Ja: '',
      selectBroader_En: '',
    };
  }

  /**
  * Dialog close event
  */
  handleClose() {
    
    this.crearDatas();
    this.props.onClose('cancel');
  };

  handleOKClose() {
    this.setState({dlgOpen: false});
  }

  /**
  * Data crear
  */
  crearDatas(){
    this.preferredList = {ja:[], en:[]};
    this.broaderList = {ja:[], en:[]};
    this.broaderClassName = this.props.classes.displayNone;
    this.setState({ 
      selectPreferred_Ja: '',
      selectPreferred_En: '',
      selectBroader_Ja: '',
      selectBroader_En: ''
     });
  }

  /**
   * initialization
   */
  initPreferred() {

    const editingVocabulary = this.props.editingVocabulary;

    this.broaderClassName = this.props.classes.displayNone;

    const source = this.props.source;    
    const target = this.props.target;

    editingVocabulary.deselectTermList();
    editingVocabulary.setSelectedTermList(source.term);
    editingVocabulary.setCurrentNodeByTerm(source.term, null, null, true);

    this.setState({ 
      selectPreferred_Ja:editingVocabulary.currentNode.language=='ja'?editingVocabulary.currentNode.preferred_label:editingVocabulary.currentLangDiffNode.preferred_label,
      selectPreferred_En:editingVocabulary.currentNode.language=='en'?editingVocabulary.currentNode.preferred_label:editingVocabulary.currentLangDiffNode.preferred_label,
      selectBroader_Ja:editingVocabulary.currentNode.language=='ja'?editingVocabulary.currentNode.broader_term:editingVocabulary.currentLangDiffNode.broader_term,
      selectBroader_En:editingVocabulary.currentNode.language=='en'?editingVocabulary.currentNode.broader_term:editingVocabulary.currentLangDiffNode.broader_term
    });

    const targetNode = editingVocabulary.getTargetFileData(editingVocabulary.selectedFile.id).find(
      (data)=>{ return data.term == target.term });

    [ editingVocabulary.currentNode, editingVocabulary.currentLangDiffNode].forEach(( currentNode)=>{
      
      // preferred
      const targetSynonymList = editingVocabulary.editingVocabulary.filter((data)=>{
        return data.idofuri == target.idofuri && data.language == currentNode.language;
      })

      const targetSynonymTermList = targetSynonymList.map((data)=>{ return data.term})

      this.preferredList[ currentNode.language] = [...currentNode.synonymList, currentNode.term];
      if( currentNode.language == target.language){
        this.preferredList[ currentNode.language] = [...this.preferredList[ currentNode.language] , target.term]
      }
      if(targetSynonymTermList.length > 0){
        this.preferredList[ currentNode.language] = [...this.preferredList[ currentNode.language] , ...targetSynonymTermList];
      }
      this.preferredList[ currentNode.language] = this.preferredList[ currentNode.language].filter(function(val, i, self){
	      return i === self.indexOf(val);
      });

      // broader
      if( currentNode.broader_term){
        this.broaderList[ currentNode.language] = [ currentNode.broader_term];
      }
      if( targetNode && targetNode.broader_term  && targetNode.language == currentNode.language){
        this.broaderList[ currentNode.language].push( targetNode.broader_term)
      }
    })
    if(  this.broaderList['ja'].length + this.broaderList['en'].length > 0 ){
      this.broaderClassName= this.props.classes.formControl;
    }
  }

  /**
   * Preferred label change event
   * @param  {object} e - information of event
   * @param  {string}lang - language
   */
  changePreferred(e, lang) {
    if(lang == 'ja'){
      this.setState({ selectPreferred_Ja: e.target.value });    
    }else{
      this.setState({ selectPreferred_En: e.target.value });    
    }
  }

   /**
   * Broader label change event
   * @param  {object} e - information of event
   * @param  {string}lang - language
   */
  changeBroader(e, lang) {
    if(lang == 'ja'){
      this.setState({ selectBroader_Ja: e.target.value });  
    }else{
      this.setState({ selectBroader_En: e.target.value });  
    }   
  }
  
  /**
   * Perform synonym settings 
   */
  execSetSynonym() {
    
    if ( this.state.selectPreferred_Ja === '' && this.state.selectPreferred_En === '') {
      this.setState({dlgOpen: true})
      return;
    }    

    // Synonym
    this.props.editingVocabulary.tmpSynonym={
      id: this.props.editingVocabulary.currentNode.id, 
      list:{
        ja: this.preferredList['ja'],
        en: this.preferredList['en']
      }
    }

    // Preferred
    this.props.editingVocabulary.tmpPreferredLabel={
      id: this.props.editingVocabulary.currentNode.id, 
      list:{
        ja: this.state.selectPreferred_Ja?[this.state.selectPreferred_Ja]:[],
        en: this.state.selectPreferred_En?[this.state.selectPreferred_En]:[]
      }
    }
    
    // BroaderTerm
    this.props.editingVocabulary.tmpBroaderTerm={
      id: this.props.editingVocabulary.currentNode.id, 
      list:{
        ja: this.state.selectBroader_Ja?[this.state.selectBroader_Ja]:[],
        en: this.state.selectBroader_En?[this.state.selectBroader_En]:[]
      }
    }

    const ret = this.props.editingVocabulary.updateVocabulary();

    this.crearDatas();
    this.props.onClose( ret);
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const synonymSourceTerm=this.props.source?(this.props.source.term?this.props.source.term:''):'';
    const synonymTargetTerm=this.props.target?(this.props.target.term?this.props.target.term:''):'';
    const title = '「'+synonymSourceTerm+'」の同義語に 「'+synonymTargetTerm+'」を設定します。';
    
    return (
      <div>
        <Dialog
          onClose={() => this.handleClose()}
          open={this.props.open}
          onEntered={() => this.initPreferred()}
        >
          <DialogTitle>
            {title}
            <IconButton
              aria-label="close"
              onClick={() => this.handleClose()}
              className={this.props.classes.closeButton}
            >
              <CloseIcon />            
            </IconButton>
          </DialogTitle>

          <DialogContent style={{width: '420px',overflow: 'hidden'}}  dividers>
            <Box component="div" display="block" >
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <span>
                  代表語となる候補が複数あります。<br />以下より言語ごとに1つまで選択できます。
                  </span>
                </Grid>
                <Grid item xs={6}>
                  <FormControl
                    variant="outlined"
                    className={this.props.classes.formControl}
                  >
                    { this.preferredList['ja'].length > 0 &&
                    <Select
                      native
                      id='preferred'
                      // value={this.state.selectPreferred_Ja}
                      defaultValue={this.state.selectPreferred_Ja}
                      onChange={(e) => this.changePreferred(e, 'ja')}
                      className={this.props.classes.selectSynonymDialog}
                    >
                      <option key={-1} value="">日本語の代表語：指定なし</option>
                      { this.preferredList['ja'].map((item, i) => (
                        <option key={i} value={item}>{item}</option>
                      ))}
                    </Select>
                    }
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl
                    variant="outlined"
                    className={this.props.classes.formControl}
                  >
                    { this.preferredList['en'].length > 0 &&
                    <Select
                      native
                      id='preferred'
                      value={this.state.selectPreferred_En}
                      onChange={(e) => this.changePreferred(e, 'en')}
                      className={this.props.classes.selectSynonymDialog}
                    >
                      <option key={-1} value=''>英語の代表語：指定なし</option>
                      { this.preferredList['en'].map((item, i) => (
                        <option key={i} value={item}>{item}</option>
                      ))}
                    </Select>
                    }
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                <span className={ this.broaderClassName}>
                  <br />
                  上位語となる候補が複数あります。<br />以下より言語ごとに1つまで選択できます。
                </span>
                </Grid>
                <Grid item xs={6}>
                  <FormControl
                    variant="outlined"
                    className={ this.broaderClassName}
                  >
                    { this.broaderList['ja'].length > 0 &&
                    <Select
                      native
                      id='broader'
                      value={this.state.selectBroader_Ja}
                      onChange={(e) => this.changeBroader(e, 'ja')}
                      className={this.props.classes.selectSynonymDialog}                    
                    >
                      <option key={-1} value=''>日本語の上位語：指定なし</option>
                      { this.broaderList['ja'].map((item, i) => (
                        <option key={i} value={item}>{item}</option>
                      ))}
                    </Select>
                    }
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl
                    variant="outlined"
                    className={ this.broaderClassName}
                  >
                    { this.broaderList['en'].length > 0 &&
                    <Select
                      native
                      id='broader'
                      value={this.state.selectBroader_En}
                      onChange={(e) => this.changeBroader(e,'en')}
                      className={this.props.classes.selectSynonymDialog}                    
                    >
                      <option key={-1} value=''>英語の上位語：指定なし</option>
                      { this.broaderList['en'].map((item, i) => (
                        <option key={i} value={item}>{item}</option>
                      ))}
                    </Select>
                    }
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.execSetSynonym()} color="primary">
            OK
            </Button>
            <Button onClick={() => this.handleClose()} color="primary">
            Cancel
            </Button>
          </DialogActions>
        </Dialog>
        <DialogOkCancel
          onOkClose={() => this.handleOKClose()}
          onCancel={() =>this.handleOKClose()}  
          buttonsDisable={ 1}
          open={this.state.dlgOpen}
          classes={this.props.classes}
          message={this.message}
        />
      </div>
    );
  }
}

DialogSettingSynonym.propTypes = {
  onClose: PropTypes.func,  
  open: PropTypes.bool,
  classes: PropTypes.object,
  editingVocabulary: PropTypes.object, 
  source: PropTypes.object,
  target: PropTypes.object,
};
