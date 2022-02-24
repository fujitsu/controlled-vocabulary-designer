/**
 * DialogFileSelecter.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';

import axios from 'axios';
import $ from 'jquery';

import DialogApiError from './DialogApiError';

/**
 * File selection dialog
 * @extends React
 */
export default class DialogFileSelecter extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {
      uploading: false,
      open: false,
      files: [
        {
          name: '',
          size: '',
          file: {},
        },
        {
          name: '',
          size: '',
          file: {},
        },
        {
          name: '',
          size: '',
          file: {},
        },
        {
          name: '',
          size: '',
          file: {},
        },
        {
          name: '',
          size: '',
          file: {},
        },
        {
          name: '',
          size: '',
          file: {},
        },
      ],
    };
  }

  /**
   * Determines if the file being uploaded is already uploaded
   * @param  {Object}  fileObj - upload file object
   * @param  {string}  name - uploaded fail name
   * @param  {string}  strSize - uploaded file size
   * @return {Boolean}         true:same file, false:other files
   */
  isSameFile(fileObj, name, strSize) {
    if (!name) return false;
    if (!strSize) return false;
    let size = strSize.replace('サイズ：', '');
    size = size.replace('byte', '');
    if ((fileObj.name === name) && (fileObj.size === Number(size))) {
      return true;
    }
    return false;
  }

  /**
   * RequestBody generation
   * @return {object} formData - file data
   */
  setUploadRequestBody() {
    const formData = new FormData();

    if (undefined != this.state.files[0].file.name) {
      const fileInfo = this.state.files[0];
      if (this.isSameFile(
          fileInfo.file,
          localStorage.getItem('fileName0'),
          localStorage.getItem('fileSize0'))) {
        console.log('[setUploadRequestBody] ' +
          fileInfo.name + ' is already uploaded(not upload).');
      } else {
        formData.append('editing_vocabulary', fileInfo.file);
      }
    }
    if (undefined != this.state.files[1].file.name) {
      const fileInfo = this.state.files[1];
      if (this.isSameFile(
          fileInfo.file,
          localStorage.getItem('fileName1'),
          localStorage.getItem('fileSize1'))) {
        console.log('[setUploadRequestBody] ' +
          fileInfo.name + ' is already uploaded(not upload).');
      } else {
        formData.append('reference_vocabulary1', fileInfo.file);
      }
    }
    if (undefined != this.state.files[2].file.name) {
      const fileInfo = this.state.files[2];
      if (this.isSameFile(
          fileInfo.file,
          localStorage.getItem('fileName2'),
          localStorage.getItem('fileSize2'))) {
        console.log('[setUploadRequestBody] ' +
          fileInfo.name + ' is already uploaded(not upload).');
      } else {
        formData.append('reference_vocabulary2', fileInfo.file);
      }
    }
    if (undefined != this.state.files[3].file.name) {
      const fileInfo = this.state.files[3];
      if (this.isSameFile(
          fileInfo.file,
          localStorage.getItem('fileName3'),
          localStorage.getItem('fileSize3'))) {
        console.log('[setUploadRequestBody] ' +
          fileInfo.name + ' is already uploaded(not upload).');
      } else {
        formData.append('reference_vocabulary3', fileInfo.file);
      }
    }
    if (undefined != this.state.files[4].file.name) {
      const fileInfo = this.state.files[4];
      if (this.isSameFile(
          fileInfo.file,
          localStorage.getItem('fileName4'),
          localStorage.getItem('fileSize4'))) {
        console.log('[setUploadRequestBody] ' +
          fileInfo.name + ' is already uploaded(not upload).');
      } else {
        formData.append('example_phrases', fileInfo.file);
      }
    }
    if (undefined != this.state.files[5].file.name) {
      const fileInfo = this.state.files[5];
      if (this.isSameFile(
          fileInfo.file,
          localStorage.getItem('fileName5'),
          localStorage.getItem('fileSize5'))) {
        console.log('[setUploadRequestBody] ' +
          fileInfo.name + ' is already uploaded(not upload).');
      } else {
        formData.append('editing_vocabulary_meta', fileInfo.file);
      }
    }
    return formData;
  }

  /**
   * File upload run
   * @param  {object} e - information of event
   */
  fileUpload(e) {
    console.log('file upload start.');
    this.uploadingStart();
    const requestBody = this.setUploadRequestBody();

    axios
        .post('/api/v1/upload',
            requestBody,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            },
        )
        .then((response) => {
          console.log('success response.');
          this.saveFileInfoToLocalstorage();
          this.uploadingEnd();
          if (undefined != this.state.files[0].file.name) {
            this.props.editingVocabulary.getEditingVocabularyDataFromDB();
          }
          if (undefined != this.state.files[1].file.name) {
            this.props.editingVocabulary.getReferenceVocabularyDataFromDB('1');
          }
          if (undefined != this.state.files[2].file.name) {
            this.props.editingVocabulary.getReferenceVocabularyDataFromDB('2');
          }
          if (undefined != this.state.files[3].file.name) {
            this.props.editingVocabulary.getReferenceVocabularyDataFromDB('3');
          }
        }).catch((err) => {
          console.log('error callback.');
          this.uploadingEnd();
          let errMsg = '';
          let errCode = -1;
          // If there is a response
          if (err.response) {
            const errResponse = err.response;
            errCode = errResponse.status;
            switch (errCode) {
              case 400:
              case 404:
                // For errors defined in the API
                if (err.response.data.message) {
                  errMsg = err.response.data.message;
                } else {
                  errMsg = '不明なエラー発生';
                }
                break;
              case 409:
                if ( (errResponse.data.phase == 2) &&
                     (errResponse.data.reason == 0)) {
                  errMsg = '同義関係と思われる、用語「' +
                    this.getErrorTerms(errResponse.data.terms, ',') +
                    '」の代表語を1つに揃えてください。';
                } else if ((errResponse.data.phase == 3) &&
                    (errResponse.data.reason == 0)) {
                  errMsg = '用語「' +
                    this.getErrorTerms(errResponse.data.terms, ',') +
                    '」の代表語のURIの個数を1つに絞ってください。';
                } else if ((errResponse.data.phase == 3) &&
                    (errResponse.data.reason == 1)) {
                  errMsg = '用語「' +
                    this.getErrorTerms(errResponse.data.terms, ',') +
                    '」の代表語のURIを統一してください。';
                } else if ((errResponse.data.phase == 3) &&
                    (errResponse.data.reason == 2)) {
                  errMsg = '代表語「' +
                  this.getErrorTerms(errResponse.data.terms, ',') +
                  '」について、同じ代表語のURIが設定されています。代表語のURIを修正してください。';
                } else if ((errResponse.data.phase == 3) &&
                    (errResponse.data.reason == 3)) {
                  errMsg = '用語「' +
                    this.getErrorTerms(errResponse.data.terms, ',') +
                    '」の代表語のURIを1つに揃えてください。';
                } else if ((errResponse.data.phase == 4) &&
                    (errResponse.data.reason == 0)) {
                  errMsg = '代表語「' +
                    errResponse.data.terms[0] +
                    '」の上位語の代表語が一致するように上位語を修正してください。';
                } else if ((errResponse.data.phase == 4) &&
                    (errResponse.data.reason == 1)) {
                  errMsg = '代表語「' +
                    this.getErrorTerms(errResponse.data.terms, ',') +
                    '」は、関係性が循環しています。上位語を修正してください。';
                }
                break;
              default:
                errMsg = '不明なエラー発生';
                break;
            }
          } else {
            errMsg = err.message;
          }
          this.props.editingVocabulary.openApiErrorDialog(
              'アップロードエラー',
              errCode,
              errMsg,
          );
        });
    this.handleClose();
  }

  /**
   * Combine vocabulary for error messages
   * @param  {string} terms - error vocabulary
   * @param  {string} split - delimiter character
   * @return {string} - error message
   */
  getErrorTerms(terms, split) {
    let errTerms = '';
    terms.forEach( (term) => {
      errTerms = errTerms + term + split;
    });
    errTerms = errTerms.slice(0, -1);
    return errTerms;
  }

  /**
   * Dialog close event

   */
  handleClose() {
    this.props.onClose();
  };

  /**
   * Save file information to local storage
   */
  saveFileInfoToLocalstorage() {
    this.state.files.forEach((file, index) => {
      if (file.name != '') {
        localStorage.setItem('fileName' + index, file.name);
        localStorage.setItem('sFileName' + index, file.name);
        localStorage.setItem('fileSize' + index, file.size);

        // Send to VisualizationPanel.js 
        this.props.onReadFileChange();
      }
    });
  }

  /**
   * Initialize file information on local storage
   */
  initFilesInfo() {
    const array = [];
    for (let i = 0; i < this.state.files.length; i++) {
      const file = {name: '', size: 'サイズ：byte', file: {}};
      if ( localStorage.getItem('fileName' + i) ) {
        file.name = localStorage.getItem('fileName' + i);
        file.size = localStorage.getItem('fileSize' + i);
      }
      array.push(file);
    }
    this.setState({files: array});
  }

  /**
   * Delete selected file information
   * @param {number} num - index of save in
   */
  delFileInfo(num) {
    localStorage.setItem('fileName' + num, '');
    localStorage.setItem('fileSize' + num, '');
    const array = this.state.files;
    array[num] = {name: '', size: 'サイズ：byte', file: {}};
    this.setState({files: array});

    switch (num) {
      case 0:
        $('#editingVocabulary').val('');
        break;
      case 1:
        $('#referenceVocaburary1').val('');
        break;
      case 2:
        $('#referenceVocaburary2').val('');
        break;
      case 3:
        $('#referenceVocaburary3').val('');
        break;
      case 4:
        $('#exampleSentences').val('');
        break;
      case 5:
        $('#editingVocabularyMeta').val('');
        break;
      default:
        break;
    }
  };

  /**
   * Set selected file information
   * @param {object} e - file information
   * @param {number} num - index for save in
   */
  setFileInfo(e, num) {
    const array = this.state.files;
    array[num] = {
      name: e.target.files[0].name,
      size: 'サイズ：' + e.target.files[0].size + 'byte',
      file: e.target.files[0],
    };
    this.setState({files: array});
  };

  /**
   * Upload end event
   */
  uploadingEnd() {
    this.setState( {uploading: false} );
  }

  /**
   * Upload start event
   */
  uploadingStart() {
    this.setState( {uploading: true} );
  }

  /**
   * render
   * @return {element}
   */
  render() {
    return (
      <div>
        <Dialog
          onClose={() => this.handleClose()}
          aria-labelledby="dialog-search-term-error"
          open={this.props.open}
          fullwidth="false"
          onEntered={() => this.initFilesInfo()}
        >
          <DialogTitle
            style={{
              position: 'relative',
              justifyContent: 'flex-end',
            }}
          >
            <DialogActions style={{display: this.props.close?'inline':'none'}}>
              <CloseIcon
                style={
                  {position: 'absolute', right: '30px'}
                }
                onClick={() => this.handleClose()}
              />
            </DialogActions>
          </DialogTitle>
          <DialogContent style={{width: '450px'}}>

            <Box component="div" display="block">

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box component="span" display="inline">
                  編集用語彙
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="right">
                    <Box
                      component="span"
                      display="inline"
                      style={{fontSize: '0.75em'}}
                    >
                      {this.state.files[0].size}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Input
                value={this.state.files[0].name}
                type="text"
                readOnly
                startAdornment={
                  <InputAdornment position="start">
                    <InsertDriveFileIcon />
                  </InputAdornment>
                }
                style={
                  {marginBottom: '25px', marginRight: '15px', width: '300px'}
                }
              />
              <Button
                variant="contained"
                value=""
                component="label"
                disableElevation
                style={{marginRight: '5px'}}
                size="small"
              >
                <input
                  style={{display: 'none'}}
                  id="editingVocabulary"
                  type="file"
                  onChange={(e) => this.setFileInfo(e, 0)}
                  accept=".xlsx,.csv"
                />
                参照
              </Button>
              <Button
                variant="contained"
                value=""
                component="label"
                onClick={() => this.delFileInfo(0)}
                disableElevation
                size="small"
              >
                Clear
              </Button>
            </Box>

            <Box component="div" display="block">

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box component="span" display="inline">
                  編集用語彙_meta
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="right">
                    <Box
                      component="span"
                      display="inline"
                      style={{fontSize: '0.75em'}}
                    >
                      {this.state.files[5].size}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Input
                value={this.state.files[5].name}
                type="text"
                readOnly
                startAdornment={
                  <InputAdornment position="start">
                    <InsertDriveFileIcon />
                  </InputAdornment>
                }
                style={
                  {marginBottom: '25px', marginRight: '15px', width: '300px'}
                }
              />
              <Button
                variant="contained"
                value=""
                component="label"
                disableElevation
                style={{marginRight: '5px'}}
                size="small"
              >
                <input
                  style={{display: 'none'}}
                  id="editingVocabularyMeta"
                  type="file"
                  onChange={(e) => this.setFileInfo(e, 5)}
                  accept=".xlsx,.csv"
                />
                参照
              </Button>
              <Button
                variant="contained"
                value=""
                component="label"
                onClick={() => this.delFileInfo(5)}
                disableElevation
                size="small"
              >
                Clear
              </Button>
            </Box>

            <Box component="div" display="block">

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box component="span" display="inline">
                  参照用語彙1
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="right">
                    <Box
                      component="span"
                      display="inline"
                      style={{fontSize: '0.75em'}}
                    >
                      {this.state.files[1].size}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Input
                value={this.state.files[1].name}
                type="text"
                readOnly
                startAdornment={
                  <InputAdornment position="start">
                    <InsertDriveFileIcon />
                  </InputAdornment>
                }
                style={
                  {marginBottom: '25px', marginRight: '15px', width: '300px'}
                }
              />
              <Button
                variant="contained"
                value=""
                component="label"
                disableElevation
                style={{marginRight: '5px'}}
                size="small"
              >
                <input
                  style={{display: 'none'}}
                  id="referenceVocaburary1"
                  type="file"
                  onChange={(e) => this.setFileInfo(e, 1)}
                  accept=".xlsx,.csv"
                />
                参照
              </Button>
              <Button
                variant="contained"
                value=""
                component="label"
                onClick={() => this.delFileInfo(1)}
                disableElevation
                size="small"
              >
                Clear
              </Button>
            </Box>

            <Box component="div" display="block">

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box component="span" display="inline">
                  参照用語彙2
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="right">
                    <Box
                      component="span"
                      display="inline"
                      style={{fontSize: '0.75em'}}
                    >
                      {this.state.files[2].size}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Input
                value={this.state.files[2].name}
                type="text"
                readOnly
                startAdornment={
                  <InputAdornment position="start">
                    <InsertDriveFileIcon />
                  </InputAdornment>
                }
                style={
                  {marginBottom: '25px', marginRight: '15px', width: '300px'}
                }
              />
              <Button
                variant="contained"
                value=""
                component="label"
                disableElevation
                style={{marginRight: '5px'}}
                size="small"
              >
                <input
                  style={{display: 'none'}}
                  id="referenceVocaburary2"
                  type="file"
                  onChange={(e) => this.setFileInfo(e, 2)}
                  accept=".xlsx,.csv"
                />
              参照
              </Button>
              <Button
                variant="contained"
                value=""
                component="label"
                onClick={() => this.delFileInfo(2)}
                disableElevation
                size="small"
              >
                Clear
              </Button>
            </Box>

            <Box component="div" display="block">

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box component="span" display="inline">
                  参照用語彙3
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="right">
                    <Box
                      component="span"
                      display="inline"
                      style={{fontSize: '0.75em'}}
                    >
                      {this.state.files[3].size}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Input
                value={this.state.files[3].name}
                type="text"
                readOnly
                startAdornment={
                  <InputAdornment position="start">
                    <InsertDriveFileIcon />
                  </InputAdornment>
                }
                style={
                  {marginBottom: '25px', marginRight: '15px', width: '300px'}
                }
              />
              <Button
                variant="contained"
                value=""
                component="label"
                disableElevation
                style={{marginRight: '5px'}}
                size="small"
              >
                <input
                  style={{display: 'none'}}
                  id="referenceVocaburary3"
                  type="file"
                  onChange={(e) => this.setFileInfo(e, 3)}
                  accept=".xlsx,.csv"
                />
                参照
              </Button>
              <Button
                variant="contained"
                value=""
                component="label"
                onClick={() => this.delFileInfo(3)}
                disableElevation
                size="small"
              >
                Clear
              </Button>
            </Box>

            <Box component="div" display="block">

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box component="span" display="inline">
                  分かち書き済みテキスト
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="right">
                    <Box
                      component="span"
                      display="inline"
                      style={{fontSize: '0.75em'}}
                    >
                      {this.state.files[4].size}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Input
                value={this.state.files[4].name}
                type="text"
                readOnly
                startAdornment={
                  <InputAdornment position="start">
                    <InsertDriveFileIcon />
                  </InputAdornment>
                }
                style={
                  {marginBottom: '25px', marginRight: '15px', width: '300px'}
                }
              />
              <Button
                variant="contained"
                value=""
                component="label"
                disableElevation
                style={{marginRight: '5px'}}
                size="small"
              >
                <input
                  style={{display: 'none'}}
                  id="exampleSentences"
                  type="file"
                  onChange={(e) => this.setFileInfo(e, 4)}
                  accept=".txt"
                />
              参照
              </Button>
              <Button
                variant="contained"
                value=""
                component="label"
                onClick={() => this.delFileInfo(4)}
                disableElevation
                size="small"
              >
                Clear
              </Button>
            </Box>

          </DialogContent>

          <DialogActions style={{display: this.props.okCancel?'':'none'}}>
            <Button onClick={(e) => this.fileUpload(e)} color="primary">
            NEXT
            </Button>
            <Button onClick={() => this.handleClose()} color="primary">
            Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.uploading}
          message="ファイルアップロード中..."
        />
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

DialogFileSelecter.propTypes = {
  classes: PropTypes.object,
  editingVocabulary: PropTypes.object,
  onClose: PropTypes.func,
  onReadFileChange : PropTypes.func,
  open: PropTypes.bool,
  close: PropTypes.bool,
  okCancel: PropTypes.bool,
};
