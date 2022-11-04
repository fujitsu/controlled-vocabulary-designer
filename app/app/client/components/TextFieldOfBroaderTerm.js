/**
 * TextFieldOfBroaderTerm.js COPYRIGHT FUJITSU LIMITED 2021
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
 * Broader term text field component
 * @extends React
 */
export default
@observer class TextFieldOfBroaderTerm extends React.Component {
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
   * Broader term update event
   * @param  {object} event - information of event
   * @param  {array} newValues - broader term list
   */
  onChange(event, newValues) {
    const editingVocabulary = this.props.editingVocabulary;
    const inputText = event.target.value;
    const displayLanguage = editingVocabulary.tmpLanguage.value;
    const foundId = editingVocabulary.getIdbyTermandLang(inputText, displayLanguage);
    if( inputText != '' && inputText != undefined && !foundId){
      const errorMsg =  '「' +inputText + '」 は、' +(displayLanguage=='ja'?'日本語':'英語')+ 'では登録されていない用語です。¥n' +
                       '登録済みの用語を記入してください。';
      const innerText = errorMsg.split('¥n').map((line, key) =>
        <span key={key}>{line}<br /></span>);
      this.openSnackbar(innerText);

      return false;
    }

    // const foundObj = editingVocabulary.editingVocWithId.get(foundId);
    let newValueUri = '';
    if(newValues.length !==0){
      const foundId2 = editingVocabulary.getIdbyTermandLang(newValues[0], displayLanguage);
      const foundObj2 = editingVocabulary.editingVocWithId.get(foundId2);
      if(undefined !== foundObj2){
        newValueUri = foundObj2.uri;
      }
    }

    if (newValues.length > 1) {
      // More than one broader term selected
      let errorMsg = '上位語テキストボックスには、複数の用語を記入できません。¥n用語を1つだけ記入してください。';
      errorMsg = errorMsg.split('¥n').map((line, key) => <span key={key}>{line}<br /></span>);
      this.openSnackbar(errorMsg);
    }else if (newValues.length == 1) {
      const nextBroaderTerm = newValues[0];
      
      // Check the validity of a broader term /////////////////////////////////////////
      const displayNode = displayLanguage == editingVocabulary.currentNode.language ? editingVocabulary.currentNode: editingVocabulary.currentLangDiffNode;
      let _displayNode = displayNode;
      if(  _displayNode.term == '' && displayLanguage !== editingVocabulary.currentNode.language
        && editingVocabulary.currentLangDiffNode.term === '' // && editingVocabulary.currentLangDiffNode.language !== ''
        && editingVocabulary.tmpSynonym.list[editingVocabulary.currentLangDiffNode.language].length > 0){
          // this condition is satisfied when the currentNode is ja/en and synonym en/ja term does not exist.
          const foundId = editingVocabulary.getIdbyTermandLang(
             editingVocabulary.tmpSynonym.list[editingVocabulary.currentLangDiffNode.language][0],
             editingVocabulary.currentLangDiffNode.language);
          const foundObj = editingVocabulary.editingVocWithId.get(foundId);
          _displayNode = foundObj?foundObj:displayNode;
      }
      if (editingVocabulary.isBroaderInSynonym(_displayNode.term, displayLanguage, nextBroaderTerm)) { 
        const errorMsg = '上位語テキストボックスに、¥n' +
                       '「' + _displayNode.term + '」 の代表語あるいは同義語が記入されています。¥n' +
                       '上位語テキストボックスには、¥n' +
                       '「' + _displayNode.term + '」 の代表語と同義語以外の用語を記入してください。';
        const innerText = errorMsg.split('¥n').map((line, key) =>
          <span key={key}>{line}<br /></span>);
        this.openSnackbar(innerText);
      } else if (editingVocabulary.isCyclicBroaders(editingVocabulary.currentNode, String(nextBroaderTerm), newValueUri)){
        // Broader term loop check /////////////////////////////////////////
          const cycleBroaderTerm =
            editingVocabulary.cycleBroaderTerm;

          let errorMsg = '上位語テキストボックスに 「'+
                         nextBroaderTerm +'」 を記入することで、¥n';
          errorMsg += '代表語 ';
          cycleBroaderTerm.forEach((term) => {
            errorMsg += '「';
            errorMsg += term;
            errorMsg += '」, ';
          });
          errorMsg = errorMsg.slice( 0, -2 );
          errorMsg += ' は、¥n上下関係が循環してしまいます。¥n';
          errorMsg += '上位語テキストボックスには、¥n';
          cycleBroaderTerm.forEach((term) => {
            errorMsg += '「';
            errorMsg += term;
            errorMsg += '」, ';
          });
          errorMsg = errorMsg.slice( 0, -2 );
          errorMsg += ' 以外の代表語を持つ用語を記入してください。';
          const innerText = errorMsg.split('¥n').map((line, key) =>
            <span key={key}>{line}<br /></span>);
          this.openSnackbar(innerText);
      } else if (!editingVocabulary.isValidSynonymBrdrTrm(_displayNode, nextBroaderTerm)) {
        let errorMsg = '上位語テキストボックスに、日本語と英語で同義関係ではない用語が記入されています。¥n日本語と英語で同義関係の用語を記入してください。'
        const innerText = errorMsg.split('¥n').map((line, key) =>
          <span key={key}>{line}<br /></span>);
        this.openSnackbar(innerText);
      }
    }
    editingVocabulary.updateBroaderTerm(newValues, displayLanguage, newValueUri);
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const editingVocabulary = this.props.editingVocabulary;
    const broaderTerm = editingVocabulary.tmpBroaderTerm.list[editingVocabulary.tmpLanguage.value];
    
    // broader term when switching with the  language radio button in the selected term
    let currentBroaderTerm = editingVocabulary.currentLangDiffNode.broader_term;
    // broader term on the selected term
    if (editingVocabulary.currentNode.language == editingVocabulary.tmpLanguage.value) {
      currentBroaderTerm = editingVocabulary.currentNode.broader_term;
    }
    
    let backColor = 'rgba(0, 0, 0, 0)';
    if(this.props.disabled){
      backColor = 'rgba(0, 0, 0, 0.09)';
    }else if( currentBroaderTerm !== '' && 0 === broaderTerm.length){
      backColor = 'lavenderblush';
    }
    
    return (
      <div onKeyDown={(e)=>{e.keyCode===13&&e.preventDefault()}}>
        <form noValidate autoComplete="off">
          <Grid item xs={12}>
            <Box border={1}>
              <Autocomplete
                multiple
                freeSolo
                disabled={this.props.disabled}
                value={broaderTerm}
                onFocus={(e)=>this.props.change('broaderTerm', true)}
                onBlur={(e)=>this.props.change('broaderTerm', false)}
                onChange={(event, newValue) => this.onChange(event, newValue)}
                classes={
                  {
                    inputRoot: this.props.classes.autocompleteInputRoot,
                    clearIndicator: this.props.classes.displayNone,
                  }
                }
                id="text-field-of-broader_term-input"
                options={
                  this.props.editingVocabulary.getCandidateTermList(
                      'broader_term',
                  )
                }
                getOptionLabel={(option) => option}
                renderOption={(option, {selected}) => (
                  <React.Fragment>
                    <div style={{width: '100%'}}>
                      
                      <Box display="flex" flexDirection="row" alignItems="center">
                        <Box
                          component="span"
                          display="inline"
                          style={{fontSize: '16px',whiteSpace: 'nowrap'}}
                        >
                          {option}
                        </Box>
                        <Box
                          component="span"
                          display="inline"
                          title={
                            this.props.editingVocabulary.getReferenceFromData(
                                option,
                                'broader_term',
                            )
                          }
                          style={{fontSize: '10px',whiteSpace: 'nowrap',textOverflow: 'ellipsis', overflowX: 'hidden', marginLeft: '10px'}}
                        >
                          {
                            this.props.editingVocabulary.getReferenceFromData(
                                option,
                                'broader_term',
                            )
                          }
                        </Box>
                      </Box>
                    </div>
                  </React.Fragment>
                )}
                renderTags={(tagValue, getTagProps) => {
                  return tagValue.map((option, index) => (
                    <EditPanelChipForOneChip
                      key={{index}}
                      {...getTagProps({index})}
                      label={option}
                      data={currentBroaderTerm}
                      needblankcheck={'true'}
                    />
                  ));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    style={{backgroundColor: backColor}}
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

TextFieldOfBroaderTerm.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
  change: PropTypes.func,
  disabled: PropTypes.bool,
};
