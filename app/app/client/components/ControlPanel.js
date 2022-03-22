/**
 * ControlPanel.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Popover from "@material-ui/core/Popover";

import DialogFileSelecter from './DialogFileSelecter';
import DialogFileDownload from './DialogFileDownload';
import DialogHistory from './DialogHistory';
import editingHistoryStore from '../stores/EditingHistory';

import ColorChartCheckBoxesOfConfirm from './ColorChartCheckBoxesOfConfirm';

/**
 * Control panel components
 * @extends React
 */
export default class ControlPanel extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      anchorEl2: null,
      anchorElC: false,           // Confirm Color Setting popover togle
      close: false,
      okCancel: false,
      uploadOpen: false,
      downloadOpen: false,
      fileType: '',
      historyDialogOpen: false,
      historyMessage: '',
    };
    this.child = React.createRef();
  }

  /**
    *  Dialog close event
    */
  handleDialogClose() {
    this.setState({
      anchorEl: null,
      anchorEl2: null,
      close: false,
      okCancel: false,
      uploadOpen: false,
      downloadOpen: false,
      fileType: '',
      historyDialogOpen: false,
      historyMessage: '',
    });
  };

  /**
   * Key event registration
   */
  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Shortcut key registration of undo/redo
   * @param  {object} event - information of key event
   */
  handleKeyDown(event) {
    if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
      // undo
      // console.log("undo shortcut key press.");
      this.undo(event);
    }
    if (event.key === 'y' && (event.ctrlKey || event.metaKey)) {
      // redo
      // console.log("redo shortcut key press.");
      this.redo(event);
    }
  }

  /**
   * undo
   * @param  {object} e - information of event
   */
  undo(e) {
    editingHistoryStore.execUndo();
    this.setState({
      historyDialogOpen: true,
      historyMessage: editingHistoryStore.undoMessage(),
    });
  }

  /**
   * redo
   * @param  {object} e - information of event
   */
  redo(e) {
    editingHistoryStore.execRedo();
    this.setState({historyDialogOpen: true,
      historyMessage: editingHistoryStore.redoMessage(),
    });
  }

  /**
   * Open button press event
   * @param  {object} e - information of event
   */
  fileAction(e) {
    this.setState({
      uploadOpen: true,
      okCancel: true,
      file: true,
    });
  }

  /**
   * Download dialog open event
   * @param  {string} fileType
   * File type('editing_vocabulary' or 'controlled_vocabulary')
   */
  downloadDialogOpen(fileType) {
    this.setState({downloadOpen: true, fileType: fileType});
  }

  /**
   * File button press event
   * @param  {object} e - information of event
   */
  handleMenuOpen(e) {
    this.setState({anchorEl: e.currentTarget});
  };

  /**
   * Save button press event
   * @param  {object} e - information of event
   */
  handleMenu2Open(e) {
    this.setState({anchorEl2: e.currentTarget});
  };

  /**
   * File pull-down menu close event
   * @param  {object} e - information of event
   */
  handleMenuClose() {
    this.setState({anchorEl: null, anchorEl2: null});
  };

  /**
   * Confirm Color popover open
   */
   handleConfirmColorPopoverOpen(e){
    // e.stopPropagation();
    // e.preventDefault();
    this.setState({anchorElC: this.state.anchorElC ? null : e.currentTarget});
  }
  /**
   * Confirm Color popover Close
   */
   handleConfirmColorPopoverClose(e){
    this.setState({anchorElC: null});
  }

  /**
   * Fixed term color reflection
   * @param  {String} color - string of changed color
   */
   seletConfirmColor(color) {
    console.log('[seletConfirmColor] change to ', color);
    this.props.editingVocabulary.seletConfirmColor(color);
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const editingVocabulary = this.props.editingVocabulary;
    // for Confirm Button
    let fileId = editingVocabulary.selectedFile.id;
    // Change border color disabled
    let disabledColor = true;
    if ( fileId == 0 && editingVocabulary.currentNode.id) {
      // Allow each component to operate during editing vocabulary selection and term selection
      disabledColor = false;
    }

    // Firm button disabled condition
    // You can control the confirm button when the term in the edited vocabulary is selected and there is no change in the synonym, preferred label, URI or broader term.
    const isCurrentNodeChanged = editingVocabulary.isCurrentNodeChanged;
    const disabledConfirm = disabledColor || isCurrentNodeChanged ? true:false;
    
    const anchorElC = this.state.anchorElC;
    const openC = Boolean(anchorElC);
    const idC = openC ? "popover-c" : undefined;

    return (
      <div>
        <Box>
          <Button
            aria-controls="customized-menu"
            aria-haspopup="true"
            onClick={this.handleMenuOpen.bind(this)}
            size="large" 
            className={this.props.classes.buttonsTop}
          >
             <ExpandMoreIcon />ファイル
          </Button>

          <Menu
            elevation={0}
            getContentAnchorEl={null}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            onClose={() => this.handleMenuClose()}
            id="customized-menu"
            anchorEl={this.state.anchorEl}
            keepMounted
            open={Boolean(this.state.anchorEl)}
            variant="menu"
          >
            <MenuItem onClick={this.fileAction.bind(this)}>
              開く
            </MenuItem>
            <MenuItem onClick={this.handleMenu2Open.bind(this)}>
              保存
              <ArrowRightIcon />
            </MenuItem>
          </Menu>

          <Menu
            elevation={0}
            getContentAnchorEl={null}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            onClose={() => this.handleMenuClose()}
            id="customized-menu"
            anchorEl={this.state.anchorEl2}
            keepMounted
            open={Boolean(this.state.anchorEl2)}
            variant="menu"
          >
            <MenuItem onClick={(fileType) =>
              this.downloadDialogOpen('editing_vocabulary')}
            >
              編集用語彙
            </MenuItem>
            <MenuItem onClick={(fileType) =>
              this.downloadDialogOpen('controlled_vocabulary')}
            >
              統制語彙
            </MenuItem>
          </Menu>
          <Button 
            onClick={this.undo.bind(this)}  
            size="large" 
            className={this.props.classes.buttonsTop}> 
            <UndoIcon className={this.props.classes.conpaneIcon}/>取り消し
          </Button>
          <Button 
            onClick={this.redo.bind(this)}  
            size="large" 
            className={this.props.classes.buttonsTop}> 
            <RedoIcon className={this.props.classes.conpaneIcon}/>やり直し
          </Button>

  
          <Button
            className={this.props.classes.buttonsTop}
            size="large" 
            onClick={(e)=>this.handleConfirmColorPopoverOpen(e)}
          >
            確定色変更
          </Button>
          <Popover 
            id={idC}
            open={openC}
            anchorEl={anchorElC}
            onClose={()=>this.handleConfirmColorPopoverClose()}
            style={{
              backgroundColor: "#66666680",
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <ColorChartCheckBoxesOfConfirm
              classes={this.props.classes}
              currentId={this.props.editingVocabulary.currentNode.id}
              color={this.props.editingVocabulary.confirmColor}
              selectColor={(color) =>
                this.seletConfirmColor(color)
              }
              close={()=>this.handleConfirmColorPopoverClose()}
            />
          </Popover>

          <Button 
            size="large" 
            className={this.props.classes.buttonsTop}
            href='https://fujitsu.github.io/controlled-vocabulary-designer/'
            target="_blank"
            rel="noopener"
          > 
            <OpenInNewIcon className={this.props.classes.conpaneIcon}/>ヘルプ
          </Button>

          <DialogFileSelecter
            open={this.state.uploadOpen}
            close={this.state.close}
            okCancel={this.state.okCancel}
            onClose={() => this.handleDialogClose()}
            onReadFileChange = {() => this.props.onReadFileChange()}
            classes={this.props.classes}
            editingVocabulary={this.props.editingVocabulary}
          />
          <DialogFileDownload
            open={this.state.downloadOpen}
            fileType={this.state.fileType}
            onClose={() => this.handleDialogClose()}
            classes={this.props.classes}
            editingVocabulary={this.props.editingVocabulary}
          />
          <DialogHistory
            open={this.state.historyDialogOpen}
            onClose={() => this.handleDialogClose()}
            classes={this.props.classes}
            historyMessage={this.state.historyMessage}
          />
        </Box>
      </div>
    );
  }
}

ControlPanel.propTypes = {
  classes: PropTypes.object,
  editingVocabulary: PropTypes.object,
  onReadFileChange : PropTypes.func,
};
