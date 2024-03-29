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

import {observer} from 'mobx-react';

import SelectOfTerm from './SelectOfTerm';
import TextFieldOfSynonym from './TextFieldOfSynonym';
import TextFieldOfPreferredLabel from './TextFieldOfPreferredLabel';
import TextFieldOfId from './TextFieldOfId'; 
import TextFieldOfUri from './TextFieldOfUri';
import TextFieldOfBroaderTerm from './TextFieldOfBroaderTerm';
import TextFieldOfSubordinateTerm from './TextFieldOfSubordinateTerm';
import DialogUpdateVocabularyError from './DialogUpdateVocabularyError';
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
    this.rootElm = undefined;
    this.state = {
      disabledFlg: true,
      open: false,
      reason: null,
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
    this.props.editingVocabulary.setCurrentNodeById(
      this.props.editingVocabulary.currentNode.id, true);
    this.props.editingVocabulary.currentNode.id&&this.props.editingVocabulary.fitToCurrent();
    this.rootElm = document.getElementById('vocabulary_edit_panel');
    this.rootElm&&this.rootElm.addEventListener('keydown', this.handleKeyDown.bind(this));
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
    }
  }

  /**
   * Focus status update notification for each textField
   * @param  {string} target - target textFiled
   * @param  {bool} value - true:focusin, false:focusout
   */
  changeFocus(target, value) {
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
      default:
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
    this.setState({open: false, reason: null});
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
    const baseTermId= this.props.editingVocabulary.currentNode.id;   
    const ret = this.props.editingVocabulary.updateVocabulary( baseTermId, 222);
    if (ret !== null) {
      this.errorDialogOpen(ret);
    }else{
      this.props.close( true);  // true=from EditPanelVocabularyTab.updateVocabulary() 
    }
  }

  /**
   * Fixed term color reflection
   * @param  {String} color - string of changed color
   */
  seletConfirmColor(color) {
    // console.log('[seletConfirmColor] change to ');
    this.props.editingVocabulary.seletConfirmColor(color);
  }


  /**
   * radio change
   * @param  {object} event - information of key event
   */
   handleRadioChange(e){
    this.setState({defalutValue: e.target.value});
    if (e.target.value != this.props.editingVocabulary.currentNode.language) {
      this.props.editingVocabulary.tmpLanguage.value = this.props.editingVocabulary.currentNode.language == 'ja'?'en':'ja';
    }else {
      this.props.editingVocabulary.tmpLanguage.value = this.props.editingVocabulary.currentNode.language;
    }
  }

  /**
   * Term select change
   * @param  {String} lang - string of changed lang
   */
   handleTermChange( lang){
    this.setState({defalutValue: lang});
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
    if ( fileId == 0 && this.props.editingVocabulary.currentNode.id) {
      // Allow each component to operate during editing vocabulary selection and term selection
      disabledColor = false;
    }

    // Firm button disabled condition
    // You can control the confirm button when the term in the edited vocabulary is selected and there is no change in the synonym, preferred label, URI or broader term.
    const nodesStateChanged = this.props.editingVocabulary.getNodesStateChanged;

    const confirmed = this.props.editingVocabulary.currentNode.confirm;
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
      <div id="vocabulary_edit_panel" className={this.props.classes.editPanelVoc}>
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

            <Grid container style={{margin: '0.25rem', marginTop: '0.25rem'}}>
                <Grid container spacing={2}>
                  <Grid item xs={2}>
                  </Grid>
                  <Grid item xs={10}>
                    <Box py={1} pl={2}>
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
                            style={{color: nodesStateChanged['ja']?'red':'inherit'}}
                            label="日本語" 
                          />
                          <FormControlLabel
                            value="en" 
                            control={<Radio color="primary" />} 
                            style={{color: nodesStateChanged['en']?'red':'inherit'}}
                            label="英語" 
                          />
                        </RadioGroup>
                      </FormControl>  
                    </Box>
                  </Grid> 
                </Grid>
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
              <Grid item xs={2}>
                <Box mt={1}>
                  代表語のURI
                </Box>
              </Grid>
              <Grid item xs={10}>
                <Box>
                  <TextFieldOfUri
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    uri={this.props.editingVocabulary.currentNode.uri}
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
                    currentOtherVocSynUri={this.props.editingVocabulary.currentNode.other_voc_syn_uri}
                    otherVocSynUri={this.props.editingVocabulary.tmpOtherVocSynUri.list}
                  />
                </Box>
              </Grid>
            </Grid>
            
            <Grid container justifyContent="center">
              <Grid item>
                <Button
                  className={this.props.classes.buttonPrimary}
                  style={{
                    marginTop:'5px',
                    marginLeft:'50px',
                  }}
                  variant="contained"
                  color="primary"
                  size={'small'}
                  onClick={()=>this.updateVocabulary()}
                  disabled={!( nodesStateChanged['ja'] || nodesStateChanged['en'])}
                >
                  反映
                </Button>
              </Grid>
            </Grid>
            <DialogUpdateVocabularyError
              onClose={() => this.errorDialogClose()}
              open={this.state.open}
              classes={this.props.classes}
              editingVocabulary={this.props.editingVocabulary}
              isFromEditPanel={true}
              reason={this.state.reason}
            />
          </Box>
        </Grid>
      </div>
    );
  }
}

EditPanelVocabularyTab.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
  close: PropTypes.func,
};
