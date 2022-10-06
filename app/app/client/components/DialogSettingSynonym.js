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

    let selectPreferred_Ja = editingVocabulary.currentNode.language=='ja'?editingVocabulary.currentNode.preferred_label:editingVocabulary.currentLangDiffNode.preferred_label;
    let selectPreferred_En = editingVocabulary.currentNode.language=='en'?editingVocabulary.currentNode.preferred_label:editingVocabulary.currentLangDiffNode.preferred_label;
    let selectBroader_Ja = editingVocabulary.currentNode.language=='ja'?editingVocabulary.currentNode.broader_term:editingVocabulary.currentLangDiffNode.broader_term;
    let selectBroader_En = editingVocabulary.currentNode.language=='en'?editingVocabulary.currentNode.broader_term:editingVocabulary.currentLangDiffNode.broader_term;

    const targetNode = editingVocabulary.getTargetFileData(editingVocabulary.selectedFile.id).find(
      (data)=>{ return data.term == target.term });

    if( targetNode.language =='ja'){
      if( selectPreferred_Ja == '' && targetNode.preferred_label != ''){
        selectPreferred_Ja = targetNode.preferred_label;
      }
      if( selectBroader_Ja == '' && targetNode.broader_term != ''){
        selectBroader_Ja = targetNode.broader_term;
      }
    }else if( targetNode.language =='en' ){
      if( selectPreferred_En == '' && targetNode.preferred_label != ''){
        selectPreferred_En = targetNode.preferred_label;
      }
      if( selectBroader_En == '' && targetNode.broader_term != ''){
        selectBroader_En = targetNode.broader_term;
      }
    }
    this.setState({ 
      selectPreferred_Ja:selectPreferred_Ja,
      selectPreferred_En:selectPreferred_En,
    });

    this.broaderList = {ja:[], en:[]};
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
	      return i === self.indexOf(val) && val != '';
      });

      // broader
      // Add the representative word of another language of broader term to the list
      if( currentNode.broader_term){
        this.broaderList[ currentNode.language].push({ term:currentNode.broader_term, id:'currentNode' });

        const pre = this.getPreferredFromBroadrByTerm( currentNode.broader_term, currentNode.language);
        if(pre != ''){
          this.broaderList[ currentNode.language=='ja'?'en':'ja'].push( {term:pre, id:'currentNode'});    
          if(currentNode.language=='ja'){
            selectBroader_En = pre;
          } else{
            selectBroader_Ja = pre;
          }     
        }
      }
      if( targetNode && targetNode.broader_term  && targetNode.language == currentNode.language
        && currentNode.broader_term != targetNode.broader_term){
        this.broaderList[ currentNode.language].push( { term:targetNode.broader_term, id:'targetNode' });

        const pre = this.getPreferredFromBroadrByTerm( targetNode.broader_term, targetNode.language);
        if(pre != ''){
          this.broaderList[ currentNode.language=='ja'?'en':'ja'].push(  {term:pre, id:'targetNode'});   
          if(currentNode.language=='ja' && selectBroader_En == ''){
            selectBroader_En = pre;
          } else if(currentNode.language=='en' && selectBroader_Ja == ''){
            selectBroader_Ja = pre;
          }             
        }
      }
    })

    // Priority is given to the broader term of the source node.If there is another language, arrange it.
    if( this.broaderList['en'].length > 1 && this.broaderList['ja'].length > 0){
      selectBroader_Ja = this.broaderList['ja'][0].term;
      this.broaderList['en'].forEach(( item)=>{
        if(item.id == this.broaderList['ja'][0].id)
        selectBroader_En = item.term;
      });
    }else if( this.broaderList['ja'].length > 1 && this.broaderList['en'].length > 0){
      selectBroader_En = this.broaderList['en'][0].term;
      this.broaderList['ja'].forEach(( item)=>{
        if(item.id == this.broaderList['en'][0].id)
        selectBroader_Ja = item.term;
      });
    }

    this.preferredList['ja'] = this.preferredList['ja'].filter(( item)=>{ return !editingVocabulary.isBlankTerm(item)});
    this.preferredList['en'] = this.preferredList['en'].filter(( item)=>{ return !editingVocabulary.isBlankTerm(item)});
    this.broaderList['ja'] = this.broaderList['ja'].filter(( item)=>{ return !editingVocabulary.isBlankTerm(item.term)});
    this.broaderList['en'] = this.broaderList['en'].filter(( item)=>{ return !editingVocabulary.isBlankTerm(item.term)});

    this.setState({ 
      selectBroader_Ja:selectBroader_Ja,
      selectBroader_En:selectBroader_En,
    });

    // No selection is also an option, so if any language has broader terms, show the broader term selection
    if(  this.broaderList['ja'].length + this.broaderList['en'].length > 0 ){
      this.broaderClassName= this.props.classes.formControl;
    }
  }
  
  /**
   * Get the representative term from the broader term name
   * @param  {string} term - broader term
   * @param  {string} lang - language
   * @return {string} preferred label
   */
  getPreferredFromBroadrByTerm( term, lang){

    let ret = '';
    const brdNode = this.props.editingVocabulary.editingVocabulary.find((data)=>{
      return data.term == term ;
    })
    if( brdNode){
      const find = this.props.editingVocabulary.editingVocabulary.find((data)=>{
        return data.uri == brdNode.uri &&  data.language != lang;
      })
      if( find){
        ret = find.preferred_label;
      }
    }
    return ret;
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
    const id = e.target[e.target.selectedIndex].getAttribute('data-id');
    const brdTerm = e.target.value;
    if(lang == 'ja'){
      this.setState({ selectBroader_Ja: brdTerm });
      this.broaderList['en'].forEach(( item)=>{
        if(item.id == id)
          this.setState({ selectBroader_En: item.term });  
      });
    }else{
      this.setState({ selectBroader_En: brdTerm });
      this.broaderList['ja'].forEach(( item)=>{
        if(item.id == id)
          this.setState({ selectBroader_Ja: item.term });  
      });
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

    // idofuri
    const term = this.state.selectPreferred_Ja?this.state.selectPreferred_Ja:
                  this.state.selectPreferred_En?this.state.selectPreferred_En:'';
    let idofuri = term;
    if(term){
      const targetNode = this.props.editingVocabulary.getTargetFileData(this.props.editingVocabulary.selectedFile.id).find(
        (data)=>{ return data.term == term });
      if( targetNode) idofuri = targetNode.idofuri;
    }
    this.props.editingVocabulary.tmpIdofUri={
      id: this.props.editingVocabulary.currentNode.id, 
      list: [ idofuri ]
    }

    // BroaderTerm
    this.props.editingVocabulary.tmpBroaderTerm={
      id: this.props.editingVocabulary.currentNode.id, 
      list:{
        ja: this.state.selectBroader_Ja?[this.state.selectBroader_Ja]:[],
        en: this.state.selectBroader_En?[this.state.selectBroader_En]:[]
      }
    }
    
    // langDiff termDescript
    if( this.props.target.language != this.props.editingVocabulary.currentNode.language
      && this.props.editingVocabulary.tmpTermDescription.list[this.props.target.language] == ''){
      this.props.editingVocabulary.tmpTermDescription.list[this.props.target.language][0] = this.props.target.term_description;
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
    const selectedOK = ((1 > this.preferredList['ja'].length || this.state.selectPreferred_Ja!='')
                    || ( 1 > this.preferredList['en'].length || this.state.selectPreferred_En!=''))
                    &&(( 1 > this.broaderList['ja'].length   || this.state.selectBroader_Ja!='')
                    || ( 1 > this.broaderList['en'].length   || this.state.selectBroader_En!=''))
    
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

          <DialogContent style={{width: '520px',overflow: 'hidden'}}  dividers>
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
                        <option key={i} value={item.term} data-id={item.id}>{item.term}</option>
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
                        <option key={i} value={item.term} data-id={item.id}>{item.term}</option>
                      ))}
                    </Select>
                    }
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button disabled={!selectedOK} onClick={() => this.execSetSynonym()} color="primary">
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
