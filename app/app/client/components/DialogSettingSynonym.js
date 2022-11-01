/**
 * DialogSettingSynonym.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';

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
    this.message = '';
    this.state = {
      dlgOpen: false,      // dialog 
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
    this.setState({ 
     });
  }

  /**
   * initialization
   */
  initPreferred() {
  }
  

  
  /**
   * Perform synonym settings 
   */
  execSetSynonym() {
    
    const editingVocabulary = this.props.editingVocabulary;

    const source = this.props.source;    
    const target = this.props.target;

    editingVocabulary.deselectTermList();
    editingVocabulary.setSelectedTermList(source.term, source.language);
    editingVocabulary.setCurrentNodeById(Number(source.id), true);

    const sourceNode = editingVocabulary.editingVocWithId.get(Number(source.id));
    const targetNode = editingVocabulary.editingVocWithId.get(Number(target.id));

    const targetSynonymIdList =[...editingVocabulary.uri2synoid[0].get(targetNode.uri)];
    const languageChangeNode = [];
    targetSynonymIdList.forEach((id1)=>{
      const tmpObj = editingVocabulary.editingVocWithId.get(id1);
      if(tmpObj.language !== targetNode.language){
        languageChangeNode.push(tmpObj);
      }
    }, this);
    let targetLangDiffNode;
    if (languageChangeNode.length > 0){
      targetLangDiffNode = languageChangeNode[0];
    }
    let selectPreferred_Ja = '';
    let selectPreferred_En = '';
    let selectBroader_Uri;
    let selectTermDesc_Ja;
    let selectTermDesc_En;    
    if(sourceNode.language === 'ja' && targetNode.language === 'ja'){
      // the preferred label for ja is the target itself
      // the preferred label for en is the one of the target if it exist
      selectPreferred_Ja = targetNode.term;
      if(targetLangDiffNode !== undefined && targetLangDiffNode.preferred_label !== ''){
        selectPreferred_En = targetLangDiffNode.preferred_label;
      }else if(editingVocabulary.tmpPreferredLabel.list['en'][0]){ 
        selectPreferred_En = editingVocabulary.tmpPreferredLabel.list['en'][0];
      }
      if(targetNode.term_description !== ''){
        selectTermDesc_Ja = targetNode.term_description;
      }else{
        selectTermDesc_Ja = sourceNode.term_description;
      }
      if(targetLangDiffNode !== undefined && targetLangDiffNode.term_description !== ''){
        selectTermDesc_En = targetLangDiffNode.term_description;
      }else{
        selectTermDesc_En = editingVocabulary.currentLangDiffNode.term_description;
      }
    }else if(sourceNode.language === 'en' && targetNode.language === 'en'){
      // the preferred label for en is the target itself
      // the preferred label for ja is the one of the target if it exist
      selectPreferred_En = targetNode.term;
      if(targetLangDiffNode !== undefined && targetLangDiffNode.preferred_label !== ''){
        selectPreferred_Ja = targetLangDiffNode.preferred_label;
      }else if(editingVocabulary.tmpPreferredLabel.list['ja'][0]){ 
        selectPreferred_Ja = editingVocabulary.tmpPreferredLabel.list['ja'][0];
      }
      if(targetNode.term_description !== ''){
        selectTermDesc_En = targetNode.term_description;
      }else{
        selectTermDesc_En = sourceNode.term_description;
      }
      if(targetLangDiffNode !== undefined && targetLangDiffNode.term_description !== ''){
        selectTermDesc_Ja = targetLangDiffNode.term_description;
      }else{
        selectTermDesc_Ja = editingVocabulary.currentLangDiffNode.term_description;
      }
    }else if(sourceNode.language === 'ja' && targetNode.language === 'en'){
      // the preferred label for en is the target itself
      // the preferred label for ja is the source itself
      selectPreferred_En = targetNode.term;
      selectPreferred_Ja = sourceNode.term;
      if(targetNode.term_description !== ''){
        selectTermDesc_En = targetNode.term_description;
      }else{
        selectTermDesc_En = editingVocabulary.currentLangDiffNode.term_description;
      }
      if(targetLangDiffNode !== undefined && targetLangDiffNode.term_description !== ''){
        selectTermDesc_Ja = targetLangDiffNode.term_description;
      }else{
        selectTermDesc_Ja = sourceNode.term_description;
      }
    }else if(sourceNode.language === 'en' && targetNode.language === 'ja'){
      // the preferred label for ja is the target itself
      // the preferred label for en is the source itself
      selectPreferred_Ja = targetNode.term;
      selectPreferred_En = sourceNode.term;
      if(targetNode.term_description !== ''){
        selectTermDesc_Ja = targetNode.term_description;
      }else{
        selectTermDesc_Ja = editingVocabulary.currentLangDiffNode.term_description;
      }
      if(targetLangDiffNode !== undefined && targetLangDiffNode.term_description !== ''){
        selectTermDesc_En = targetLangDiffNode.term_description;
      }else{
        selectTermDesc_En = sourceNode.term_description;
      }
    }

    //broader
    // if the target have broader, set it as the new broader
    // if the target have no broader, the source broader is the new broader
    if(targetNode.broader_uri !== ''){
      selectBroader_Uri = targetNode.broader_uri;
    }else{
      selectBroader_Uri = sourceNode.broader_uri;
    }
    
    // set the "tmpXXX" variables

    // Synonym
    // conbine source synonym and target synonym
    let synoList = [...editingVocabulary.uri2synoid[0].get(sourceNode.uri),
                      ...editingVocabulary.uri2synoid[0].get(targetNode.uri)];
    synoList = [...(new Set(synoList))]; // deduplicate 
    editingVocabulary.tmpSynonym.id = sourceNode.id;
    editingVocabulary.tmpSynonym.list['ja'] = [];
    editingVocabulary.tmpSynonym.list['en'] = [];
    editingVocabulary.tmpSynonym.idList['ja'] = [];
    editingVocabulary.tmpSynonym.idList['en'] = [];
    synoList.forEach((id1)=>{
      const tmpObj = editingVocabulary.editingVocWithId.get(id1);
      if(tmpObj.language === 'ja'){
        editingVocabulary.tmpSynonym.list['ja'].push(tmpObj.term);
        editingVocabulary.tmpSynonym.idList['ja'].push(tmpObj.id);
      }else{
        editingVocabulary.tmpSynonym.list['en'].push(tmpObj.term);
        editingVocabulary.tmpSynonym.idList['en'].push(tmpObj.id);
      }

    }, this);
    
    // set the pref label
    editingVocabulary.tmpPreferredLabel.id = sourceNode.id;
    editingVocabulary.tmpPreferredLabel.list['ja'] = [];
    editingVocabulary.tmpPreferredLabel.list['en'] = [];
    if(selectPreferred_Ja !== ''){
      editingVocabulary.tmpPreferredLabel.list['ja'].push(selectPreferred_Ja);
    }
    if(selectPreferred_En !== ''){
      editingVocabulary.tmpPreferredLabel.list['en'].push(selectPreferred_En);
    }
    
    // set the idofuri
    editingVocabulary.tmpIdofUri.id = sourceNode.id;
    editingVocabulary.tmpIdofUri.list = [targetNode.idofuri];

    //set the broader
    editingVocabulary.tmpBroaderTerm.id = sourceNode.id; 
    editingVocabulary.tmpBroaderTerm.list['ja'] = [];
    editingVocabulary.tmpBroaderTerm.list['en'] = [];
    if(editingVocabulary.uri2preflabel[0]['ja'][selectBroader_Uri]){
      editingVocabulary.tmpBroaderTerm.list['ja'] = [editingVocabulary.uri2preflabel[0]['ja'][selectBroader_Uri]];
    }
    if(editingVocabulary.uri2preflabel[0]['en'][selectBroader_Uri]){
      editingVocabulary.tmpBroaderTerm.list['en'] = [editingVocabulary.uri2preflabel[0]['en'][selectBroader_Uri]];
    }
    editingVocabulary.tmpBroaderTerm.broader_uri = selectBroader_Uri;

    // set the term description
    editingVocabulary.tmpTermDescription.id = sourceNode.id; 
    if(undefined !== selectTermDesc_Ja && editingVocabulary.tmpTermDescription.list['ja'] === ''){
      editingVocabulary.tmpTermDescription.list['ja'] = selectTermDesc_Ja;
    }
    if(undefined !== selectTermDesc_En && editingVocabulary.tmpTermDescription.list['en'] === ''){
      editingVocabulary.tmpTermDescription.list['en'] = selectTermDesc_En;
    }

    const ret = editingVocabulary.updateVocabulary(null, 333);

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
