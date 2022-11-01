/**
 * TextFieldOfPreferredLabel.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import {observer} from 'mobx-react';

import EditPanelChipForOneChip from './EditPanelChipForOneChip';

/**
 * Preferred label text field component
 * @extends React
 */
export default
@observer class TextFieldOfPreferredLabel extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {open: false, message: ''};
  }

  /**
   * Key event registration
   */
  componentDidMount() {
  }

  /**
   * Warning displaying snackbar events
   * @param {String} errorMsg - error message
   */
  openSnackbar(errorMsg) {
    this.setState({open: true, message: errorMsg});
  }

  /**
   * Warning hiding snackbar events
   */
  handleClose() {
    this.setState({open: false, message: ''});
  };

  /**
   * Preferred label update event
   * @param  {object} event - information of event
   * @param  {array} newValue - list of preferred label
   */
  onChange(event, newValue) {
    const editingVocabulary = this.props.editingVocabulary;
    const inputText = event.target.value;
    const displayLanguage = editingVocabulary.tmpLanguage.value;
    // const find = editingVocabulary.editingVocabulary.find((d)=>{ return d.term == inputText });    
    const foundId = editingVocabulary.getIdbyTermandLang(inputText, displayLanguage);    
    if( inputText != '' && inputText != undefined && !foundId){
      const errorMsg =  '「' +inputText + '」 は、'+(displayLanguage =='ja'?'日本語':'英語')+'では登録されていない用語です。¥n' +
                       '登録済みの用語を記入してください。';
      const innerText = errorMsg.split('¥n').map((line, key) =>
        <span key={key}>{line}<br /></span>);
      this.openSnackbar(innerText);

      return false;
    }
    
    const displayNode = displayLanguage == editingVocabulary.currentNode.language ? editingVocabulary.currentNode: editingVocabulary.currentLangDiffNode;

    if (newValue.length > 1) {
      // When more than one preferred label is entered
      const errorMsg = '代表語テキストボックスには、複数の用語を記入できません。¥n' + '用語を1つだけ記入してください。';
      const innerText = errorMsg.split('¥n').map((line, key) =>
        <span key={key}>{line}<br /></span>);
      this.openSnackbar(innerText);
    } else{
      let _displayNode = displayNode;
      if(  _displayNode.term == '' && editingVocabulary.tmpLanguage.value !== editingVocabulary.currentNode.language // dare editingVocabulary.currentNode
        && editingVocabulary.currentLangDiffNode.term === '' && editingVocabulary.currentLangDiffNode.language !== ''
        && editingVocabulary.tmpSynonym.list[editingVocabulary.currentLangDiffNode.language].length > 0){
        // this condition is satisfied when the currentNode is ja/en and synonym en/ja term does not exist.
        const foundId = editingVocabulary.getIdbyTermandLang(
          editingVocabulary.tmpSynonym.list[editingVocabulary.currentLangDiffNode.language][0],
          editingVocabulary.currentLangDiffNode.language);
        const foundObj = editingVocabulary.editingVocWithId.get(foundId);
        _displayNode = foundObj?foundObj:displayNode;
      }
      if (newValue.length == 1) {

        // When a selected term or a term that is not a synonym is entered in the preferred label
        if (!editingVocabulary.isValidPreferredLabel(_displayNode, newValue[0], displayLanguage)) {
          let errorMsg;
          if(!_displayNode.hidden & _displayNode.term !== '' ){
            errorMsg = '代表語テキストボックスに記入された用語は、¥n' +
                          '「' +_displayNode.term + '」 または同義語のいずれにも含まれていません。¥n' +
                          '代表語テキストボックスには、¥n' +
                          '「' + _displayNode.term + '」 または同義語の中から一つ選んで記入してください。';
          }else{
            errorMsg = '代表語テキストボックスに記入された用語は、¥n' +
                          '同義語のいずれにも含まれていません。¥n' +
                          '代表語テキストボックスには、¥n' +
                          '同義語の中から一つ選んで記入してください。';
          }
          const innerText = errorMsg.split('¥n').map((line, key) =>
            <span key={key}>{line}<br /></span>);
          this.openSnackbar(innerText);
        }
      } else if (newValue.length == 0) {
        // Preferred label:Missing error
        let errorMsg;
        if (!_displayNode.hidden & _displayNode.term !== '' ) {
          // When the vocabulary is not selected, the synonym is also cleared in the subsequent process, so no error message is displayed.
          errorMsg = '代表語テキストボックスに用語が記入されていません。¥n代表語テキストボックスには、 ¥n「' + _displayNode.term +
                            '」または同義語の中から選んで記入してください。';
          errorMsg = errorMsg.split('¥n').map((line, key) => <span key={key}>{line}<br /></span>);
        }else{
          errorMsg = '代表語テキストボックスに用語が記入されていません。¥n代表語テキストボックスには、同義語の中から選んで記入してください。';
          errorMsg = errorMsg.split('¥n').map((line, key) => <span key={key}>{line}<br /></span>);          
        }        
        this.openSnackbar(errorMsg);
      }
    }
    editingVocabulary.updataPreferredLabel(newValue);
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const preferredLabel = this.props.editingVocabulary.tmpPreferredLabel.list[this.props.editingVocabulary.tmpLanguage.value];
    let currentPreferredLabel;
    // preferred label on the selected term
    if (this.props.editingVocabulary.currentNode.language == this.props.editingVocabulary.tmpLanguage.value) {
      currentPreferredLabel =
        this.props.editingVocabulary.currentNode.preferred_label;
    } else { // preferred label when switching with the  language radio button in the selected term
      currentPreferredLabel =
        this.props.editingVocabulary.currentLangDiffNode.preferred_label;
    }
    /* eslint-disable no-unused-vars */
    // object for rendering
    let length = this.props.editingVocabulary.tmpPreferredLabel.list['ja'].length;
    length = this.props.editingVocabulary.tmpPreferredLabel.list['en'].length;
    /* eslint-enable no-unused-vars */

    return (
      <div onKeyDown={(e)=>{e.keyCode===13&&e.preventDefault()}}>
        <form noValidate autoComplete="off">
          <Grid item xs={12}>
            <Box border={1}>
              <Autocomplete
                multiple
                freeSolo
                disabled={this.props.disabled}
                value={preferredLabel}
                onFocus={(e)=>this.props.change('PreferredLabel', true)}
                onBlur={(e)=>this.props.change('PreferredLabel', false)}
                onChange={(event, newValue) => this.onChange(event, newValue)}
                classes={
                  {
                    inputRoot: this.props.classes.autocompleteInputRoot,
                    clearIndicator: this.props.classes.displayNone,
                  }
                }
                id="text-field-of-preferred_label-input"
                options={[]}
                renderTags={(tagValue, getTagProps) => {
                  return tagValue.map((option, index) => (
                    <EditPanelChipForOneChip
                      key={index}
                      {...getTagProps({index})}
                      label={option}
                      data={currentPreferredLabel}
                      needblankcheck={'true'}
                    />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    style={
                        this.props.disabled?
                        {backgroundColor: 'rgba(0, 0, 0, 0.09)'}:
                        {backgroundColor: 'rgba(0, 0, 0, 0)'}
                    }
                  />
                )}
              />
            </Box>
          </Grid>
        </form>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={this.state.open}
          onClose={() => this.handleClose()}
          message={this.state.message}
          action={
            <React.Fragment>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => this.handleClose()}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </div>
    );
  }
}

TextFieldOfPreferredLabel.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
  change: PropTypes.func,
  disabled: PropTypes.bool,
};
