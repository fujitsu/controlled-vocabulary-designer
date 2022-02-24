/**
 * TextFieldOfUri.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CreateIcon from '@material-ui/icons/Create';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import config from '../config/Config';


import {observer} from 'mobx-react';

import EditPanelChipForOneChip from './EditPanelChipForOneChip';

/**
 * URI text field component
 * @extends React
 */
export default
@observer class TextFieldOfUri extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {
      disabledFlg: true,
      modeChange: true,
      editTerm: '',
      open: false,
      message: '',
      config: config,
    };
  }

  /**
   * componentDidUpdate
   */
   componentDidUpdate(prevProps, prevState) {
    
    if (prevProps.disabledFlg !== this.props.disabledFlg) {
      if ( !this.props.disabledFlg) {
        this.setState({
          disabledFlg: false,
          editTerm: this.props.editingVocabulary.currentNode.term,
        });
      } else {
        this.setState({disabledFlg: true});
      }
    }else{
      return;
    }
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
   * Delete event
   * @param  {object} event - information of event
   */
  onDelete(event) {
    this.props.editingVocabulary.updataUri('');
  }

  /**
   * Key press event
   * @param  {object} event - information of event
   */
  handleKeyDown(event) {
    if (event.keyCode == 13 || event.keyCode == 32) {
      this.updataUri(event);
    }
    event.stopPropagation();
  }

  /**
   * URI edit event
   * @param  {object} event - information of event
   */
  uriTextEdit(event) {
    const currentUri = this.props.editingVocabulary.currentUri;
    event.target.value = currentUri;
  }

  /**
   * URI input event
   * @param  {object} event - information of event
   */
  uriTextEnter(event) {
    this.updataUri(event);
  }

  /**
   * URI update
   * @param  {object} event - information of event
   */
  updataUri(event) {
    let uri = event.target.value;

    // Formalize URI prefix
    const prefixList = this.state.config.prefix;
    const foundPrefix = prefixList.find((prefix) => {
      return uri.startsWith(prefix.equiv);
    });
    if (foundPrefix) {
      uri = uri.replace(foundPrefix.equiv, foundPrefix.origin);
    }

    const prfrrdLbl = this.props.editingVocabulary.tmpPreferredLabel.list[0];

    if (this.props.editingVocabulary.isInvalidUri(uri, prfrrdLbl)) {
      let errorMsg = '代表語のURIテキストボックスに、¥n' +
                     '同義関係でない別の代表語 \"' +
                     this.props.editingVocabulary.equalUriPreferredLabel +
                     '\" と同じ代表語のURIが記入されています。¥n' +
                     '代表語のURIテキストボックスには、¥n' +
                     '既に登録されている他の代表語のURIとは異なる値を記入してください。';
      errorMsg = errorMsg.split('¥n').map((line, key) =>
        <span key={key}>{line}<br /></span>);
      this.setState({modeChange: true});
      setTimeout(() => {
        this.openSnackbar(errorMsg);
      }, 100);
    } else {
      this.setState({modeChange: true, disabledFlg: true});
    }
    this.props.editingVocabulary.updataUri(uri);
  }

  /**
   * URI edit confirm event
   * @param  {object} event - information of event
   */
  onChange(event) {
    this.setState({modeChange: false});
  };

  /**
   * render
   * @return {element}
   */
  render() {
    const uri = this.props.editingVocabulary.tmpUri.list;

    //  URI display in real time
    let finalUri;
    let idofuri = this.props.editingVocabulary.tmpUri.list[0];
    let id  = this.props.editingVocabulary.tmpIdofUri.list[0];
    if (idofuri != undefined) {
      if ((idofuri.substring(idofuri.lastIndexOf('/')+1))!=id && id != undefined) {
          idofuri = idofuri.replace(idofuri.substring(idofuri.lastIndexOf('/')+1), id);
          finalUri = [idofuri];
      }
    }

    // uri number of before
    let urihttp = this.props.editingVocabulary.editingVocabulary.find((data) => data.uri);
    if (urihttp != undefined) {
      urihttp = urihttp.uri;
    }
    if (id != undefined && idofuri == undefined) {
      idofuri = urihttp.replace(urihttp.substring(urihttp.lastIndexOf('/')+1), id);
      finalUri = [idofuri];
    }

    /* eslint-disable no-unused-vars */
    // object for rendering
    const uriNum = this.props.editingVocabulary.tmpUri.list.length;
    /* eslint-enable no-unused-vars */

    // Replace URI prefixes with display labels only
    let alteredUri = uri.map((targetUri) => {
      const prefixList = this.state.config.prefix;
      const foundPrefix = prefixList.find((prefix) => {
        return targetUri.startsWith(prefix.origin);
      });
      if (foundPrefix) {
        return targetUri.replace(foundPrefix.origin, foundPrefix.equiv);
      } else {
        return targetUri;
      }
    });

    if (finalUri != undefined){
      alteredUri = finalUri;
    }


    const currentTerm = this.props.editingVocabulary.currentNode.term;
    let disabledFlg = this.state.disabledFlg;
    if (this.state.editTerm !== currentTerm) {
      disabledFlg = true;
    }
    if (this.props.disabled) {
      disabledFlg = true;
    }
    const currentUri = this.props.editingVocabulary.currentNode.uri;
    // console.log('currentUri(currentNode):', currentUri);


    return (
      <div>
        <form noValidate autoComplete="off">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box border={1}>

                <Autocomplete
                  multiple
                  freeSolo
                  disabled={disabledFlg}
                  style={
                    this.state.modeChange?{display: 'inline'}:{display: 'none'}
                  }
                  value={alteredUri}
                  classes={
                    {
                      inputRoot: this.props.classes.autocompleteInputRoot,
                      clearIndicator: this.props.classes.displayNone,
                    }
                  }
                  id="text-field-of-uri-input"
                  options={this.props.editingVocabulary.editingVocabulary}
                  getOptionLabel={() => ''}
                  renderTags={(tagValue, getTagProps) => {
                    return tagValue.map((option, index) => (
                      // console.log('option:', option),
                      <EditPanelChipForOneChip
                        key={index}
                        {...getTagProps({index})}
                        label={option}
                        data={currentUri}
                        onDelete={(event) => this.onDelete(event)}
                        config={this.state.config}
                      />
                    ));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      onFocus={(event)=>this.onChange(event)}
                      variant="standard"
                      style={
                        disabledFlg ?
                          {backgroundColor: 'rgba(0, 0, 0, 0.09)'}:
                          {backgroundColor: 'rgba(0, 0, 0, 0)'}
                      }
                    />
                  )}
                />

                <div
                  style={this.state.modeChange ?
                    {display: 'none'}:
                    {display: 'inline'}}
                >
                  <TextField
                    classes={{root: this.props.classes.textField}}
                    onFocus={(event)=>this.uriTextEdit(event)}
                    onKeyDown={(event)=>this.handleKeyDown(event)}
                    onBlur={(event)=>this.uriTextEnter(event)}
                    disabled={this.state.disabledFlg}
                    inputProps={
                      {style: {textAlign: 'center', paddingTop: '12px'}}
                    }
                    inputRef={(input) => input && input.focus()}
                  />
                </div>
              </Box>
            </Grid>
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

TextFieldOfUri.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
  disabled: PropTypes.bool,
  disabledFlg: PropTypes.bool,
};
