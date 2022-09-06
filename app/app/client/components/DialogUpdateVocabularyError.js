/**
 * DialogUpdateVocabularyError.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
/**
 * error dialog
 * @extends React
 */
export default class DialogUpdateVocabularyError extends React.Component {  
  
  /**
  * constructor
  * @param {object} props
  */
  constructor(props) {
    super(props);
  }

  /**
   * Dialog close event
   */
  handleClose() {
    this.props.onClose();
  };


  /**
   * get error message
   * 
   * @returns {string}
   */
  getErrorMessage(){

    const editingVocabulary = this.props.editingVocabulary;

    const currentNode = editingVocabulary.tmpLanguage.list == editingVocabulary.currentNode.language ? editingVocabulary.currentNode: editingVocabulary.currentLangDiffNode;
    let _currentNode = currentNode;
    if(  _currentNode.term == '' && editingVocabulary.tmpLanguage.list !== editingVocabulary.currentNode.language // dare editingVocabulary.currentNode
      && editingVocabulary.currentLangDiffNode.term === '' && editingVocabulary.currentLangDiffNode.language !== ''
      && editingVocabulary.tmpSynonym.list[editingVocabulary.currentLangDiffNode.language].length > 0){
        const find = editingVocabulary.editingVocabulary.find((item)=>
            item.term == editingVocabulary.tmpSynonym.list[editingVocabulary.currentLangDiffNode.language][0])
        _currentNode = find?find:currentNode;
    }

    let errorMsgEdt='';
    let errorMsgVoc='';

    switch (this.props.reason) {
      // Preferred label error /////////////////////////////
      // Preferred label:Multiple Input Error
      case 'multiPreferredLabel':
        errorMsgEdt = '代表語テキストボックスには、複数の値を記入できません。¥n値を1つだけ記入してください。';
        errorMsgVoc = '代表語は、複数の値を設定できません。' ;
        break;
      // Preferred label:Invalid input error
      case 'invalidPreferredLabel':
        const prfrrdlbl = editingVocabulary.tmpPreferredLabel.list[editingVocabulary.tmpLanguage.list][0];
        errorMsgEdt =  '代表語テキストボックスに記入された \"' + prfrrdlbl + '\" は、¥n' +
                   '\"' + _currentNode.term + '\" または同義語のいずれにも含まれていません。¥n' +
                   '代表語テキストボックスには、¥n' +
                   '\"' + _currentNode.term +'\" または同義語の中から選んで記入してください。';
        
        errorMsgVoc = '代表語に設定された \"' + prfrrdlbl + '\" は、¥n' +
                    '\"' + _currentNode.term + '\" または同義語のいずれにも含まれていません。¥n' +
                    '代表語には、¥n\"' + _currentNode.term +'\" または同義語の中から選んで設定してください。';
        break;
      // Preferred label:Missing error
      case 'needToPreferredLabel':
        errorMsgEdt = '代表語テキストボックスには \"' + _currentNode.term +
                   '\" または同義語の中から選んで記入してください。';
        errorMsgVoc = '代表語には \"' + _currentNode.term +'\" または同義語の中から選んで設定してください。';
        break;

      // Synonym error /////////////////////////////
      // Synonym:Synonym error registered in the hierarchical relationship
      case 'relationSynonym':
        errorMsgEdt = '下位語テキストボックスに、 \"' + _currentNode.term +
                   '\" あるいは \"' + _currentNode.term + '\" の代表語' +
                   'あるいは \"' + _currentNode.term + '\" の同義語が記入されています。¥n' +
                   '同義語テキストボックスには、 \"' + _currentNode.term +
                   '\" と上下関係を持たないように、¥n' +
                   'かつ記入する複数の用語間にも上下関係を持たないように、用語を記入してください。';
        errorMsgVoc = '同義語には、 \"' + _currentNode.term +
                    '\" と上下関係を持たない用語を設定してください。';
        break;

      // Id of URI error /////////////////////////////
      // Id of URI:Multiple Input Error
      case 'multiIdofUri':
        errorMsgEdt = 'IDテキストボックスには、複数の値を記入できません。¥n値を1つだけ記入してください。';
        errorMsgVoc = 'IDは、複数の値を設定できません。' ;
        break;
      // Id of URI:Duplicate input error
      case 'equalIdofUri':
        errorMsgEdt = '代表語のURIテキストボックスに、¥n' +
                   '同義関係でない別の代表語 \"' + editingVocabulary.equalUriPreferredLabel +
                   '\" と同じ代表語のURIが記入されています。¥n' +
                   '代表語のURIテキストボックスには、¥n' +
                   '既に登録されている他の代表語のURIとは異なる値が入るように、¥n' +
                   'IDテキストボックスの値を変更してください。';
        errorMsgVoc = '同義関係でない別の代表語 \"' + editingVocabulary.equalUriPreferredLabel +
                    '\" と同じ代表語のURIが設定されています。¥n' +
                    '代表語のURIには、¥n' +
                    '既に登録されている他の代表語のURIとは異なる値が入るように、¥n' +
                    'IDを変更してください。';
        break;
      // Id of URI :Missing error
      case 'needToIdofUri':
        errorMsgEdt = 'IDテキストボックスには 既に登録されている他の代表語のURIとは異なる値が入るように、¥n' +
                    'IDテキストボックスの値を記入してください。';
        errorMsgVoc = 'IDテキストボックスには 既に登録されている他の代表語のURIとは異なる値が入るように、¥n' +
                    'IDテキストボックスの値を記入してください。';
        break;

      // Broader term error /////////////////////////////
      // Broader term:Multiple input error
      case 'multiBroaderTerm':
        errorMsgEdt = '上位語テキストボックスには、複数の値を記入できません。¥n値を1つだけ記入してください。';
        errorMsgVoc = '上位語には、複数の値を設定できません。';
        break;
      // Broader term:Invalid input error
      case 'invalidBroaderTerm':
        errorMsgEdt = '上位語テキストボックスに、¥n' +
                   '\"' + _currentNode.term + '\" の代表語あるいは同義語が記入されています。¥n' +
                   '上位語テキストボックスには、¥n' +
                   '\"' + _currentNode.term + '\" の代表語と同義語以外の値を記入してください。';

        errorMsgVoc = '上位語に、¥n' +
                    '\"' + _currentNode.term + '\" の代表語あるいは同義語が設定されています。¥n' +
                    '上位語には、¥n' +
                    '\"' + _currentNode.term + '\" の代表語と同義語以外の値を設定してください。';
        break;
      // Broader term:synonym error
      case 'invalidSynonymBroaderTerm':
        errorMsgEdt = '上位語テキストボックスに、日本語と英語で同義関係ではない用語が記入されています。¥n日本語と英語で同義関係の用語を記入してください。'
        errorMsgVoc = '上位語に、日本語と英語で同義関係ではない用語が設定されています。¥n日本語と英語で同義関係の用語を設定してください。'
        break;
      // Broader term:Loop error
      case 'cycleBroaderTerm':
        const brdrTrm = editingVocabulary.tmpBroaderTerm.list[editingVocabulary.tmpLanguage.list][0];
        errorMsgEdt = '上位語テキストボックスに \"'+
                   brdrTrm +'\" を記入することで、¥n';
        errorMsgEdt += '代表語 ';
        editingVocabulary.cycleBroaderTerm.forEach((term) => {
          errorMsgEdt += '\"';
          errorMsgEdt += term;
          errorMsgEdt += '\", ';
        });
        errorMsgEdt = errorMsgEdt.slice( 0, -2 );
        errorMsgEdt += ' は、¥n上下関係が循環してしまいます。¥n';
        errorMsgEdt += '上位語テキストボックスには、¥n';
        editingVocabulary.cycleBroaderTerm.forEach((term) => {
          errorMsgEdt += '\"';
          errorMsgEdt += term;
          errorMsgEdt += '\", ';
        });
        errorMsgEdt = errorMsgEdt.slice( 0, -2 );
        errorMsgEdt += ' 以外の代表語を持つ用語を記入してください。';
          
        const brdrTrmV = editingVocabulary.tmpBroaderTerm.list[editingVocabulary.tmpLanguage.list][0];
        errorMsgVoc = '上位語に \"'+
                   brdrTrmV +'\" を設定することで、¥n';
        errorMsgVoc += '代表語 ';
        editingVocabulary.cycleBroaderTerm.forEach((term) => {
          errorMsgVoc += '\"';
          errorMsgVoc += term;
          errorMsgVoc += '\", ';
        });
        errorMsgVoc = errorMsgVoc.slice( 0, -2 );
        errorMsgVoc += ' は、¥n上下関係が循環してしまいます。¥n';
        errorMsgVoc += '上位語には、¥n';
        editingVocabulary.cycleBroaderTerm.forEach((term) => {
          errorMsgVoc += '\"';
          errorMsgVoc += term;
          errorMsgVoc += '\", ';
        });
        errorMsgVoc = errorMsgVoc.slice( 0, -2 );
        errorMsgVoc += ' 以外の代表語を持つ用語を設定してください。';
        break;
      case 'multiTermDescription':        
        errorMsgEdt = '用語の説明テキストボックスには、複数の値を記入できません。¥n値を1つだけ記入してください。';
        errorMsgVoc = '用語の説明には、複数の値を設定できません。';
        break;
    }
    let errorMsg = this.props.isFromEditPanel ? errorMsgEdt : errorMsgVoc;
    errorMsg = errorMsg.split('¥n').map((line, key) =>
      <span key={key}>{line}<br /></span>);

    return errorMsg || '用語　設定エラー';
  }
  /**
   * render
   * @return {element}
   */
  render() {
    
    const errorMsg = this.getErrorMessage();

    return (
      <Dialog
        onClose={() => this.handleClose()}
        aria-labelledby="dialog-vocabulary-error" 
        open={this.props.open}
      >
        <DialogTitle className={this.props.classes.closeTitle}>
          <IconButton
            aria-label="close"
            onClick={() => this.handleClose()}
            className={this.props.classes.closeButton}
          >
            <CloseIcon />            
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            {errorMsg}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    );
  }
}

DialogUpdateVocabularyError.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  classes: PropTypes.object,
  editingVocabulary: PropTypes.object,
  isFromEditPanel: PropTypes.bool,
  reason: PropTypes.string,
};
