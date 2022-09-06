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
   * @param  {array} newValue - broader term list
   */
  onChange(event, newValue) {
    const editingVocabulary = this.props.editingVocabulary;
    const inputText = event.target.value;
    const find = editingVocabulary.editingVocabulary.find((d)=>{ return d.term == inputText });    
    if( inputText != '' && inputText != undefined && !find){
      const errorMsg =  '\"' +inputText + '\" は、登録されていない用語です。¥n' +
                       '既存の用語を記入してください。';
      const innerText = errorMsg.split('¥n').map((line, key) =>
        <span key={key}>{line}<br /></span>);
      this.openSnackbar(innerText);

      return false;
    }
    if( find && find.language != editingVocabulary.tmpLanguage.list){
      const errorMsg =  '\"' +inputText + '\" は、'+(find.language=='ja'?'日本語':'英語')+'の用語です。¥n' +
                      '現在選択されている言語の用語を記入してください。';
      const innerText = errorMsg.split('¥n').map((line, key) =>
        <span key={key}>{line}<br /></span>);
      this.openSnackbar(innerText);

      return false;
    }

    if (newValue.length > 1) {
      // More than one broader term selected
      const errorMsg = '上位語テキストボックスには、複数の値を記入できません。値を1つだけ記入してください。';
      this.openSnackbar(errorMsg);
    } else if (newValue.length == 1) {
      const nextBroaderTerm = newValue[0];

      // Check the validity of a broader term /////////////////////////////////////////
      const currentNode = editingVocabulary.tmpLanguage.list == editingVocabulary.currentNode.language ? editingVocabulary.currentNode: editingVocabulary.currentLangDiffNode;
      let _currentNode = currentNode;
      if(  _currentNode.term == '' && editingVocabulary.tmpLanguage.list !== editingVocabulary.currentNode.language // dare editingVocabulary.currentNode
        && editingVocabulary.currentLangDiffNode.term === '' && editingVocabulary.currentLangDiffNode.language !== ''
        && editingVocabulary.tmpSynonym.list[editingVocabulary.currentLangDiffNode.language].length > 0){
          const find = editingVocabulary.editingVocabulary.find((item)=>
              item.term == editingVocabulary.tmpSynonym.list[editingVocabulary.currentLangDiffNode.language][0])
          _currentNode = find?find:currentNode;
      }
      if (editingVocabulary.isInvalidBrdrTrm(_currentNode, nextBroaderTerm)) {
        const errorMsg = '上位語テキストボックスに、¥n' +
                       '\"' + _currentNode.term + '\" の代表語あるいは同義語が記入されています。¥n' +
                       '上位語テキストボックスには、¥n' +
                       '\"' + _currentNode.term + '\" の代表語と同義語以外の値を記入してください。';
        const innerText = errorMsg.split('¥n').map((line, key) =>
          <span key={key}>{line}<br /></span>);
        this.openSnackbar(innerText);
      } else if (editingVocabulary.isCycleBrdrTrm(_currentNode, nextBroaderTerm)) {
        // Broader term loop check /////////////////////////////////////////
          const cycleBroaderTerm =
            editingVocabulary.cycleBroaderTerm;

          let errorMsg = '上位語テキストボックスに \"'+
                         nextBroaderTerm +'\" を記入することで、¥n';
          errorMsg += '代表語 ';
          cycleBroaderTerm.forEach((term) => {
            errorMsg += '\"';
            errorMsg += term;
            errorMsg += '\", ';
          });
          errorMsg = errorMsg.slice( 0, -2 );
          errorMsg += ' は、¥n上下関係が循環してしまいます。¥n';
          errorMsg += '上位語テキストボックスには、¥n';
          cycleBroaderTerm.forEach((term) => {
            errorMsg += '\"';
            errorMsg += term;
            errorMsg += '\", ';
          });
          errorMsg = errorMsg.slice( 0, -2 );
          errorMsg += ' 以外の代表語を持つ用語を記入してください。';
          const innerText = errorMsg.split('¥n').map((line, key) =>
            <span key={key}>{line}<br /></span>);
          this.openSnackbar(innerText);
      } else if (editingVocabulary.isInvalidSynonymBrdrTrm(_currentNode, nextBroaderTerm)) {
        let errorMsg = '上位語テキストボックスに、日本語と英語で同義関係ではない用語が記入されています。¥n日本語と英語で同義関係の用語を記入してください。'
        const innerText = errorMsg.split('¥n').map((line, key) =>
          <span key={key}>{line}<br /></span>);
        this.openSnackbar(innerText);
      }
    }
    editingVocabulary.updataBroaderTerm(newValue);
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const broaderTerm = this.props.editingVocabulary.tmpBroaderTerm.list[this.props.editingVocabulary.tmpLanguage.list];
    let currentBroaderTerm;
    // broader term on the selected term
    if (this.props.editingVocabulary.currentNode.language == this.props.editingVocabulary.tmpLanguage.list) {
      currentBroaderTerm =
        this.props.editingVocabulary.currentNode.broader_term;
    } else { // broader term when switching with the  language radio button in the selected term
      currentBroaderTerm =
        this.props.editingVocabulary.currentLangDiffNode.broader_term;
    }
    
    return (
      <div>
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

TextFieldOfBroaderTerm.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
  change: PropTypes.func,
  disabled: PropTypes.bool,
};
