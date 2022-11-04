/**
 * TextFieldOfSynonym.js COPYRIGHT FUJITSU LIMITED 2021
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

import EditPanelChipForSynonym from './EditPanelChipForSynonym';

import {observer} from 'mobx-react';

/**
 * Synonym text filed component
 * @extends React
 */
export default
@observer class TextFieldOfSynonym extends React.Component {
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
   * Warning hiding snackbar event
   */
  handleClose() {
    this.setState({open: false, message: ''});
  };

  /**
   * Synonym update event
   * @param  {object} event - information of event
   * @param  {array} newValue - list of synonym terms
   */
  onChange(event, newValue) {
    const editingVocabulary =this.props.editingVocabulary;
    const inputText = event.target.value;
    const displayLanguage = editingVocabulary.tmpLanguage.value;
    // const find = editingVocabulary.editingVocabulary.find((d)=>{ return (d.term === inputText && displayLanguage ===d.language)});  
    const foundId = editingVocabulary.getIdbyTermandLang(inputText, displayLanguage);  
    if( inputText != '' && inputText != undefined && !foundId){
      const errorMsg =  '「' +inputText + '」 は、' +(displayLanguage=='ja'?'日本語':'英語')+ 'では登録されていない用語です。¥n' +
                       '登録済みの用語を記入してください。';
      const innerText = errorMsg.split('¥n').map((line, key) =>
        <span key={key}>{line}<br /></span>);
      this.openSnackbar(innerText);

      return false;
    }

    const displayNode = displayLanguage == editingVocabulary.currentNode.language ? editingVocabulary.currentNode: editingVocabulary.currentLangDiffNode;
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
    if (editingVocabulary.isNarrowerTerm(_displayNode.term, displayLanguage, newValue)) {
      const errorMsg = '同義語テキストボックスに上位語（下位語）が記入されています。¥n' +
                       '同義語テキストボックスには、上位語・下位語以外の用語を記入してください。';
      const innerText = errorMsg.split('¥n').map((line, key) =>
        <span key={key}>{line}<br /></span>);
      this.openSnackbar(innerText);
    }
    editingVocabulary.updateSynonym(newValue);
    // if the added term have diffrent preferred label the label is added to the Text Field of PrefLabel
    if (this.state.open == false) {
      const preferredLabelLength =
        editingVocabulary.tmpPreferredLabel.list[_displayNode.language].length;
      if (preferredLabelLength > 1) {
        const errorMsg = '代表語テキストボックスに、複数の用語が記入されています。¥n用語を1つだけ記入してください。';
        const innerText = errorMsg.split('¥n').map((line, key) =>
          <span key={key}>{line}<br /></span>);
        this.openSnackbar(innerText);
      }
    }
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const synonym = this.props.editingVocabulary.tmpSynonym.list[this.props.editingVocabulary.tmpLanguage.value];
    let currentSynonym;
    // synonym on the selected term
    if (this.props.editingVocabulary.currentNode.language == this.props.editingVocabulary.tmpLanguage.value) {
      currentSynonym = this.props.editingVocabulary.currentNode.synonymList;
    } else { // synonym when switching with the  language radio button in the selected term
      currentSynonym = this.props.editingVocabulary.currentLangDiffNode.synonymList; 
    }
    /* eslint-disable no-unused-vars */
    // object for rendering
    let length = this.props.editingVocabulary.tmpSynonym.list['ja'].length;
    length = this.props.editingVocabulary.tmpSynonym.list['en'].length;
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
                value={synonym}
                onFocus={(e)=>this.props.change('synonym', true)}
                onBlur={(e)=>this.props.change('synonym', false)}
                onChange={(event, newValue) => this.onChange(event, newValue)}
                classes={
                  {
                    inputRoot: this.props.classes.autocompleteInputRoot,
                    clearIndicator: this.props.classes.displayNone,
                  }
                }
                id="text-field-of-synonym-input"
                options={
                  this.props.editingVocabulary.getCandidateTermList('Synonym')
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
                                'Synonym',
                            )
                          }
                          style={{fontSize: '10px',whiteSpace: 'nowrap',textOverflow: 'ellipsis', overflowX: 'hidden', marginLeft: '10px'}}
                        >
                          {
                            this.props.editingVocabulary.getReferenceFromData(
                                option,
                                'Synonym',
                            )
                          }
                        </Box>
                      </Box>
                    </div>
                  </React.Fragment>
                )}
                renderTags={(tagValue, getTagProps) => {
                  return tagValue.map((option, index) => (
                    <EditPanelChipForSynonym
                      key={index}
                      {...getTagProps({index})}
                      label={option}
                      synonym={currentSynonym}
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

TextFieldOfSynonym.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
  change: PropTypes.func,
  disabled: PropTypes.bool,
};
