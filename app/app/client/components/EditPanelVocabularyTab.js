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
    this.state = {
      disabledFlg: true,
      open: false,
      reason: '',
      synymact: false,
      prfrrdlblact: false,
      idofuriact: false,
      broadertermact: false,
      dlgDeleteTermOpen: false,   // dialog for delete term confirm
      termdescriptionact: false, 
      defalutValue: this.props.editingVocabulary.currentNode.language,
    };

    this.switchStyles = {
      'black': {
        'color': grey[700],
        '&$checked': {
          color: grey[900],
        },
        '&$checked + $track': {
          backgroundColor: grey[200],
        },
      },
      'brown': {
        'color': grey[700],
        '&$checked': {
          color: brown[500],
        },
        '&$checked + $track': {
          backgroundColor: brown[200],
        },
      },
      'red': {
        'color': grey[700],
        '&$checked': {
          color: red[500],
        },
        '&$checked + $track': {
          backgroundColor: red[200],
        },
      },
      'orange': {
        'color': grey[700],
        '&$checked': {
          color: orange[500],
        },
        '&$checked + $track': {
          backgroundColor: orange[200],
        },
      },
      'yellow': {
        'color': grey[700],
        '&$checked': {
          color: yellow[500],
        },
        '&$checked + $track': {
          backgroundColor: yellow[200],
        },
      },
      'lightGreen': {
        'color': grey[700],
        '&$checked': {
          color: lightGreen[500],
        },
        '&$checked + $track': {
          backgroundColor: lightGreen[200],
        },
      },
      'green': {
        'color': grey[700],
        '&$checked': {
          color: green[500],
        },
        '&$checked + $track': {
          backgroundColor: green[200],
        },
      },
      'lightBlue': {
        'color': grey[700],
        '&$checked': {
          color: lightBlue[500],
        },
        '&$checked + $track': {
          backgroundColor: lightBlue[200],
        },
      },
      'blue': {
        'color': grey[700],
        '&$checked': {
          color: blue[500],
        },
        '&$checked + $track': {
          backgroundColor: blue[200],
        },
      },
      'deepPurple': {
        'color': grey[700],
        '&$checked': {
          color: deepPurple[500],
        },
        '&$checked + $track': {
          backgroundColor: deepPurple[200],
        },
      },
      'purple': {
        'color': grey[700],
        '&$checked': {
          color: purple[500],
        },
        '&$checked + $track': {
          backgroundColor: purple[200],
        },
      },
    };
  }

  /**
   * Key event registration
   */
  componentDidMount() {
    // window.addEventListener('keydown', this.handleKeyDown.bind(this));
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
   * Term delete dialog open
   */
   handleTermDelete(){
    let mess =  '「' + this.props.editingVocabulary.currentNode.term +'」';
    this.message = mess+"\nを削除します。よろしいですか？";
    this.setState({dlgDeleteTermOpen: true});  
  }

  /**
   * Term delete dialog close
   */
  handleDeleteTermClose(){
    this.message = '';
    this.setState({dlgDeleteTermOpen: false});
    
    this.props.editingVocabulary.deleteVocabulary();
    this.props.close();
  }

  /**
   * Term delete dialog Cancel
   */
  handleDeleteTermCancelClose(){
    this.message = '';
    this.setState({dlgDeleteTermOpen: false});
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
    const ret = this.props.editingVocabulary.updateVocabulary();
    if (ret !== '') {
      this.errorDialogOpen(ret);
    }else{
      this.props.close();
    }
  }

  /**
   * Confirm switch
   * @param  {Boolean} isConfirm - confirm acceptance
   */
  toggleConfirm(isConfirm) {
    // console.log('[toggleConfirm] change to ' + isConfirm);
    const currentNode = this.props.editingVocabulary.currentNode;

    this.props.editingVocabulary.toggleConfirm(currentNode.term, isConfirm);
    if (!isConfirm) {
      // In the case of a term without a preferred label, supplement the preferred label column when the term is unfixed.
      if (!currentNode.preferred_label) {
        this.props.editingVocabulary.
            tmpPreferredLabel.list.push(currentNode.term);
      }
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
      this.props.editingVocabulary.languageChange();
    }else {
      this.props.editingVocabulary.languageSame();
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
    const isCurrentNodeChanged =
      this.props.editingVocabulary.isCurrentNodeChanged;
    const disabledConfirm = disabledColor || isCurrentNodeChanged ? true:false;

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
              <Grid item xs={5}>
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
              <Grid item>
                <Button
                  className={this.props.classes.buttonsDelete}
                  ml={3}
                  variant="contained"
                  color="secondary"
                  size={'small'}
                  onClick={(e)=>this.handleTermDelete(e)}
                >
                  削除
                </Button>
                <DialogOkCancel
                  onOkClose={() => this.handleDeleteTermClose()}
                  onCancel={() =>this.handleDeleteTermCancelClose()}  
                  open={this.state.dlgDeleteTermOpen}
                  classes={this.props.classes}
                  message={this.message}
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
