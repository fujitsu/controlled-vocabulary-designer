/**
 * EditPanelVocabularyTab.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

import {grey} from '@material-ui/core/colors';
import {brown} from '@material-ui/core/colors';
import {red} from '@material-ui/core/colors';
import {orange} from '@material-ui/core/colors';
import {yellow} from '@material-ui/core/colors';
import {lightGreen} from '@material-ui/core/colors';
import {green} from '@material-ui/core/colors';
import {lightBlue} from '@material-ui/core/colors';
import {blue} from '@material-ui/core/colors';
import {deepPurple} from '@material-ui/core/colors';
import {purple} from '@material-ui/core/colors';

import DialogApiError from './DialogApiError';

import {observer} from 'mobx-react';

import ColorChartCheckBoxes from './ColorChartCheckBoxes';
import ColorChartCheckBoxesOfConfirm from './ColorChartCheckBoxesOfConfirm';
import SelectOfTerm from './SelectOfTerm';
import TextFieldOfSynonym from './TextFieldOfSynonym';
import TextFieldOfPreferredLabel from './TextFieldOfPreferredLabel';
import TextFieldOfUri from './TextFieldOfUri';
import TextFieldOfBroaderTerm from './TextFieldOfBroaderTerm';
import TextFieldOfSubordinateTerm from './TextFieldOfSubordinateTerm';

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
      open: false,
      reason: '',
      synymact: false,
      prfrrdlblact: false,
      broadertermact: false,
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
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
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
      if (this.state.broadertermact) {
        this.props.editingVocabulary.popBroaderTerm();
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
      case 'broaderTerm':
        this.setState({broadertermact: value});
        break;
        defalut:
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
    this.setState({open: false, reason: ''});
  }

  /**
   * [ErrorDialog description]
   * @param {object} props
   * @return {element} errordialog
   */
  ErrorDialog(props) {
    const {onClose, open, reason, editingVocabulary} = props;
    let errorMsg = '';

    const handleClose = () => {
      onClose();
    };

    // const currentTerm = editingVocabulary.currentNode.term;
    let currentTerm;
    if (editingVocabulary.currentNode.term) {
      currentTerm = editingVocabulary.currentNode.term;
    } else {
      // Display the preferred label as the term name if the term is not selected
      currentTerm = editingVocabulary.tmpPreferredLabel.list.length>0 ? editingVocabulary.tmpPreferredLabel.list[0] : '';
    }
    switch (reason) {
      // Preferred label error /////////////////////////////
      // Preferred label:Multiple Input Error
      case 'multiPreferredLabel':
        errorMsg = '代表語テキストボックスには、複数の値を記入できません。値を1つだけ記入してください。';
        break;
      // Preferred label:Invalid input error
      case 'invalidPreferredLabel':
        const prfrrdlbl = editingVocabulary.tmpPreferredLabel.list[0];
        errorMsg = '代表語テキストボックスに記入された \"' + prfrrdlbl + '\" は、¥n' +
                   '\"' + currentTerm + '\" または同義語のいずれにも含まれていません。¥n' +
                   '代表語テキストボックスには、¥n' +
                   '\"' + currentTerm +'\" または同義語の中から選んで記入してください。';
        errorMsg = errorMsg.split('¥n').map((line, key) =>
          <span key={key}>{line}<br /></span>);
        break;
      // Preferred label:Missing error
      case 'needToPreferredLabel':
        errorMsg = '代表語テキストボックスには \"' + currentTerm +
                   '\" または同義語の中から選んで記入してください。';
        break;

      // Synonym error /////////////////////////////
      // Synonym:Synonym error registered in the hierarchical relationship
      case 'relationSynonym':
        errorMsg = '下位語テキストボックスに、 \"' + currentTerm +
                   '\" あるいは \"' + currentTerm + '\" の代表語' +
                   'あるいは \"' + currentTerm + '\" の同義語が記入されています。¥n' +
                   '同義語テキストボックスには、 \"' + currentTerm +
                   '\" と上下関係を持たないように、¥n' +
                   'かつ記入する複数の用語間にも上下関係を持たないように、用語を記入してください。';
        errorMsg = errorMsg.split('¥n').map((line, key) =>
          <span key={key}>{line}<br /></span>);
        break;

      // URI error /////////////////////////////
      // URI:Duplicate input error
      case 'equalUri':
        errorMsg = '代表語のURIテキストボックスに、¥n' +
                   '同義関係でない別の代表語 \"' + editingVocabulary.equalUriPreferredLabel +
                   '\" と同じ代表語のURIが記入されています。¥n' +
                   '代表語のURIテキストボックスには、¥n' +
                   '既に登録されている他の代表語のURIとは異なる値を記入してください。';
        errorMsg = errorMsg.split('¥n').map((line, key) =>
          <span key={key}>{line}<br /></span>);
        break;

      // Broader term error /////////////////////////////
      // Broader term:Multiple input error
      case 'multiBroaderTerm':
        errorMsg = '上位語テキストボックスには、複数の値を記入できません。値を1つだけ記入してください。';
        break;
      // Broader term:Invalid input error
      case 'invalidBroaderTerm':
        errorMsg = '上位語テキストボックスに、¥n' +
                   '\"' + currentTerm + '\" の代表語あるいは同義語が記入されています。¥n' +
                   '上位語テキストボックスには、¥n' +
                   '\"' + currentTerm + '\" の代表語と同義語以外の値を記入してください。';
        errorMsg = errorMsg.split('¥n').map((line, key) =>
          <span key={key}>{line}<br /></span>);
        break;
      // Broader term:Loop error
      case 'cycleBroaderTerm':
        const brdrTrm = editingVocabulary.tmpBroaderTerm.list[0];
        errorMsg = '上位語テキストボックスに \"'+
                   brdrTrm +'\" を記入することで、¥n';
        errorMsg += '代表語 ';
        editingVocabulary.cycleBroaderTerm.forEach((term) => {
          errorMsg += '\"';
          errorMsg += term;
          errorMsg += '\", ';
        });
        errorMsg = errorMsg.slice( 0, -2 );
        errorMsg += ' は、¥n上下関係が循環してしまいます。¥n';
        errorMsg += '上位語テキストボックスには、¥n';
        editingVocabulary.cycleBroaderTerm.forEach((term) => {
          errorMsg += '\"';
          errorMsg += term;
          errorMsg += '\", ';
        });
        errorMsg = errorMsg.slice( 0, -2 );
        errorMsg += ' 以外の代表語を持つ用語を記入してください。';
        errorMsg = errorMsg.split('¥n').map((line, key) =>
          <span key={key}>{line}<br /></span>);
        break;
    }

    return (
      <Dialog
        onClose={handleClose}
        aria-labelledby="dialog-search-term-error" open={open}
      >
        <DialogContent>
          <DialogContentText>
            {errorMsg}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    );
  }

  /**
   * Update edits
   */
  updateVocabulary() {
    const ret = this.props.editingVocabulary.updateVocabulary();
    if (ret !== '') {
      this.errorDialogOpen(ret);
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
   * render
   * @return {element}
   */
  render() {
    const editingVocabulary = this.props.editingVocabulary;
    let fileId = editingVocabulary.selectedFile.id;
    // Change border color disabled
    let disabledColor = true;
    if ( this.props.editingVocabulary.currentNode.id) {
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

    // Fix button text
    let confirmButtonText = '確定';
    if (disabledTextField) {
      confirmButtonText = '確定解除';
    }

    return (
      <div>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Box mt={1}>
              用語名
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Box>
              <SelectOfTerm
                classes={this.props.classes}
                editingVocabulary={this.props.editingVocabulary}
              />
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Box mt={1}>
              枠線色
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Box>
              <ColorChartCheckBoxes
                colorId="color1"
                classes={this.props.classes}
                currentId={this.props.editingVocabulary.currentNode.id}
                color={this.props.editingVocabulary.currentNode.color1}
                selectColor={(currentId, colorId, color) =>
                  this.props.editingVocabulary.updateColor(currentId,
                      colorId, color)
                }
                tmpColor={this.props.editingVocabulary.tmpBorderColor}
                selectTmpColor={(id, color) =>
                  this.props.editingVocabulary.selectTmpBorderColor(
                      id, color)
                }
                disabled={disabledColor}
              />
            </Box>
          </Grid>
        </Grid>

        <Grid container style={{margin: '0.25rem', marginTop: '0.25rem'}}>
          <Box border={1} p={1} width="350px">
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Box mt={1}>
                  同義語
                </Box>
              </Grid>
              <Grid item xs={7}>
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
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Box mt={1}>
                  代表語
                </Box>
              </Grid>
              <Grid item xs={7}>
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

            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Box mt={1}>
                  代表語のURI
                </Box>
              </Grid>
              <Grid item xs={9}>
                <Box>
                  <TextFieldOfUri
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    uri={this.props.editingVocabulary.currentNode.uri}
                    disabled={disabledTextField}
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Box mt={1}>
                  上位語
                </Box>
              </Grid>
              <Grid item xs={7}>
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

            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Box mt={1}>
                  下位語
                </Box>
              </Grid>
              <Grid item xs={7}>
                <Box>
                  <TextFieldOfSubordinateTerm
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    fileId={fileId}
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={3}>
                <Box>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box mt={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    size={'small'}
                    onClick={()=>this.updateVocabulary()}
                    disabled={!isCurrentNodeChanged}
                  >
                    反映
                  </Button>
                  <this.ErrorDialog
                    open={this.state.open}
                    onClose={() => this.errorDialogClose()}
                    reason={this.state.reason}
                    editingVocabulary={this.props.editingVocabulary}
                  />
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box mt={1}>
                  <Button
                    ml={3}
                    variant="contained"
                    color="primary"
                    size={'small'}
                    disabled={disabledConfirm}
                    onClick={()=>this.toggleConfirm(!isConfirm)}
                  >
                    {confirmButtonText}
                  </Button>
                </Box>
              </Grid>
            </Grid>

          </Box>
        </Grid>

        <Grid container spacing={2}>

          <Grid item xs={3}>
            <Box mt={1} ml={2}>
              確定色
            </Box>
          </Grid>

          <Grid item xs={9}>
            <Box>
              <ColorChartCheckBoxesOfConfirm
                classes={this.props.classes}
                currentId={this.props.editingVocabulary.currentNode.id}
                color={this.props.editingVocabulary.confirmColor}
                selectColor={(color) =>
                  this.seletConfirmColor(color)
                }
              />
            </Box>
          </Grid>

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
};
