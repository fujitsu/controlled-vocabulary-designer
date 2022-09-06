/**
 * DialogFileSelector.js COPYRIGHT FUJITSU LIMITED 2021
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

import DialogOkCancel from './DialogOkCancel';

/**
 * File selection dialog
 * @extends React
 */
export default class DialogFileSelector extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {
      uploading: false,
      open: false,
      errOpen: false,
      reason: '',
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
      ],
    };
  }

  /**
   * Determines if the file being uploaded is already uploaded
   * @param  {Object}  fileObj - upload file object
   * @param  {string}  name - uploaded file name
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

    if (undefined != this.state.files[0].file.name & undefined != this.state.files[4].file.name) {
      const fileInfo0 = this.state.files[0];
      const fileInfo4 = this.state.files[4];
      if (this.isSameFile(
          fileInfo0.file,
          localStorage.getItem('fileName0'),
          localStorage.getItem('fileSize0'))
          & this.isSameFile(
            fileInfo4.file,
            localStorage.getItem('fileName4'),
            localStorage.getItem('fileSize4'))) {
        console.log('[setUploadRequestBody] ' +
          fileInfo0.name + ' is already uploaded(not upload).');
        console.log('[setUploadRequestBody] ' +
          fileInfo4.name + ' is already uploaded(not upload).');
      } else {
        formData.append('editing_vocabulary', fileInfo0.file);
        formData.append('editing_vocabulary_meta', fileInfo4.file);
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
    return formData;
  }

  /**
   * Closes error messages where "editing vocabulary file" is not specified 
   */
  handleErrCancel(){   
    this.setState({errOpen: false});
  }
  
  /**
   * File upload run
   * @param  {object} e - information of event
   */
  fileUpload(e) {

    // parameter existence check for editing vocabulary
    if ( undefined != this.state.files[0].file & !this.state.files[0].file.name  ) {      
      this.setState({errOpen: true});
      return false;
    }
    // parameter existence check for editing vocabulary meta
    if ( undefined != this.state.files[4].file & !this.state.files[4].file.name  ) {
      this.setState({errOpen: true});
      return false;
    }

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
          if (undefined != this.state.files[4].file.name) {
            this.props.editingVocabularyMeta.getEditingVocabularyMetaDataFromDB();
          }
          this.handleClose();
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
                // For errors defined in the API
                if (err.response.data.message) {
                  errMsg = err.response.data.message;
                } else {
                  errMsg = '不明なエラー発生';
                }
                break;
              case 404:
                // For errors defined in the API
                if (err.response.data.message) {
                  errMsg = err.response.data.message;
                } else {
                  errMsg = '不明なエラー発生';
                }
                break;
              case 409:
                let file_name=''
                switch(errResponse.data.file_type){
                  case 0:
                    file_name = '編集語彙';
                    break;
                  case 1:
                    file_name = '参照語彙1';
                    break;
                  case 2:
                    file_name = '参照語彙2';
                    break;
                  case 3:
                    file_name = '参照語彙3';
                    break;
                  case 4:
                    file_name = '編集語彙メタ';
                    break;
                };
                if ( (errResponse.data.phase == 1) &&
                     (errResponse.data.reason == 0)) {
                  errMsg = file_name+ 'で、条件を満たさない用語列が空白のものが有ります。代表語のURIは' +
                  errResponse.data.terms[0] +
                  'です。行を削除するか、空白の条件を満たすように編集した後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 1) &&
                    (errResponse.data.reason == 1)) {
                  errMsg = file_name+ 'で、用語名列で空白のものが存在条件を満たしていますが、複数行あります。代表語のURIは' +
                  errResponse.data.terms[0] +
                  'です。行を削除するか、用語を入力した後後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 1) &&
                    (errResponse.data.reason == 2)) {
                  errMsg = file_name+ 'で、用語名列で空白のものが存在条件を満たしていますが、同一言語の同義グループに値のある行があります。代表語のURIは' +
                  errResponse.data.terms[0] +
                  'です。行を削除するか、用語を入力した後後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 1) &&
                    (errResponse.data.reason == 5)) {
                  errMsg = file_name+ 'で、用語名列で用語「' +
                  this.getErrorTermsWithLang(errResponse.data.terms, errResponse.data.langs, ',') +
                  '」が重複しています。行を削除など、重複しないように編集した後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 2) &&
                    (errResponse.data.reason == 0)) {
                  errMsg = file_name+ 'で、同義関係と思われる、用語「' +
                  this.getErrorTerms(errResponse.data.terms, ',') +
                  '」の言語ごとの代表語を1つに揃えた後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 2) &&
                    (errResponse.data.reason == 1)) {
                  errMsg = file_name+ 'で、同義関係の用語「' +
                  this.getErrorTermsWithLang(errResponse.data.terms, errResponse.data.langs, ',') +
                  '」の中に、どの言語にも代表語が無いです。いずれかの言語の代表語を設定した後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 2) &&
                    (errResponse.data.reason == 2)) {
                  errMsg = file_name+ 'で、複数の同義関係の用語「' +
                  this.getErrorTermsWithLang(errResponse.data.terms, errResponse.data.langs, ',') +
                  '」で同じ代表語を持っています。異なる同義語では異なる代表語を持つようにした後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 3) &&
                  (errResponse.data.reason == 0)) {
                  errMsg = file_name+ 'で、「言語」列がja, enもしくは空白以外が含まれています。ja, en, 空文字を記入した後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 4) &&
                  (errResponse.data.reason == 0)) {
                  errMsg = file_name+ 'で、「代表語のURI」列に空白または異なる語彙体系のURIが含まれています。同じ語彙体系のURIを記入した後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 5) &&
                  (errResponse.data.reason == 0)) {
                  errMsg = file_name+ 'で、「上位語のURI」列に空白または異なる語彙体系のURIが含まれています。同じ語彙体系のURIを記入した後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 5) &&
                  (errResponse.data.reason == 1)) {
                  errMsg = file_name+ 'で、同義関係の用語「' +
                  this.getErrorTermsWithLang(errResponse.data.terms, errResponse.data.langs, ',') +
                  '」で上位語のURIが一つに揃っていません。一つになるように編集した後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 5) &&
                  (errResponse.data.reason == 2)) {
                  errMsg = file_name+ 'で、同義関係の用語「' +
                  this.getErrorTermsWithLang(errResponse.data.terms, errResponse.data.langs, ',') +
                  '」で上位語のURIとして指定された用語が存在しません。URIを直すか削除するかして編集した後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 5) &&
                  (errResponse.data.reason == 3)) {
                  errMsg = file_name+ 'で、用語「' +
                  this.getErrorTermsWithLang(errResponse.data.terms, errResponse.data.langs, ',') +
                  '」で、上下関係性が循環しています。上位語を修正した後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 6) &&
                  (errResponse.data.reason == 0)) {
                  errMsg = file_name+ 'で、用語「' +
                  this.getErrorTermsWithLang(errResponse.data.terms, errResponse.data.langs, ',') +
                  '」で、他語彙体系の同義語のURIが同義語内で異なります。1つに揃えた後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 7) &&
                  (errResponse.data.reason == 0)) {
                  errMsg = file_name+ 'で、同義関係の用語「' +
                  this.getErrorTermsWithLang(errResponse.data.terms, errResponse.data.langs, ',') +
                  '」で、用語の説明が異なっています。1つに揃えた後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 8) &&
                  (errResponse.data.reason == 0)) {
                  errMsg = file_name+ 'で、同義関係の用語「' +
                  this.getErrorTermsWithLang(errResponse.data.terms, errResponse.data.langs, ',') +
                  '」で、作成日が異なっています。1つに揃えた後に再読み込みしてください。';
                } else if ((errResponse.data.phase == 9) &&
                  (errResponse.data.reason == 0)) {
                  errMsg = file_name+ 'で、同義関係の用語「' +
                  this.getErrorTermsWithLang(errResponse.data.terms, errResponse.data.langs, ',') +
                  '」で、最終更新日が異なっています。1つに揃えた後に再読み込みしてください。';
                }
                break;
                case 411:
                  if ( (errResponse.data.phase == 0) &&
                       (errResponse.data.reason == 0)) {
                    errMsg = '編集用語彙の、列「' +
                      this.getErrorTerms(errResponse.data.terms, '」,「') +
                      '」が無いためファイルが読み込めません。「'+
                      this.getErrorTerms(errResponse.data.terms, '」,「') +
                      '」を追加して再読み込みしてください。' ;
                  } else if ( (errResponse.data.phase == 1) &&
                       (errResponse.data.reason == 0)) {
                    errMsg = '編集用語彙_metaの、列「' +
                      this.getErrorTerms(errResponse.data.terms, '」,「') +
                      '」が無いためファイルが読み込めません。「'+
                      this.getErrorTerms(errResponse.data.terms, '」,「') +
                      '」を追加して再読み込みしてください。' ;
                  } else if ( (errResponse.data.phase == 2) &&
                      (errResponse.data.reason == 0)) {
                    errMsg = '参照用語彙1の、列「' +
                      this.getErrorTerms(errResponse.data.terms, '」,「') +
                      '」が無いためファイルが読み込めません。「'+
                      this.getErrorTerms(errResponse.data.terms, '」,「') +
                      '」を追加して再読み込みしてください。' ;
                  } else if ( (errResponse.data.phase == 3) &&
                      (errResponse.data.reason == 0)) {
                    errMsg = '参照用語彙2の、列「' +
                      this.getErrorTerms(errResponse.data.terms, '」,「') +
                      '」が無いためファイルが読み込めません。「'+
                      this.getErrorTerms(errResponse.data.terms, '」,「') +
                      '」を追加して再読み込みしてください。' ;
                  } else if ( (errResponse.data.phase == 4) &&
                      (errResponse.data.reason == 0)) {
                    errMsg = '参照用語彙3の、列「' +
                      this.getErrorTerms(errResponse.data.terms, '」,「') +
                      '」が無いためファイルが読み込めません。「'+
                      this.getErrorTerms(errResponse.data.terms, '」,「') +
                      '」を追加して再読み込みしてください。' ;
                  } else if ( (errResponse.data.phase == -1) &&
                      (errResponse.data.reason == 0)) {
                    errMsg = errResponse.data.terms[0];
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
  }

  /**
   * Combine vocabulary for error messages
   * @param  {string} terms - error vocabulary
   * @param  {string} split - delimiter character
   * @return {string} - error message
   */
  getErrorTerms(terms, split) {
    let errTerms = '';
    for (var i =0; i < terms.length; i++){
      if(i != terms.length -1){
        errTerms = errTerms + terms[i] + split;
      }else{
        errTerms = errTerms + terms[i]
      }
    }
    return errTerms;
  }

  /**
   * Combine vocabulary for error messages
   * @param  {string} terms - error vocabulary
   * @param  {string} split - delimiter character
   * @return {string} - error message
   */
     getErrorTermsWithLang(terms, langs, split) {
      let errTerms = '';
      for (var i =0; i < terms.length; i++){
        if(i != terms.length -1){
          errTerms = errTerms + terms[i] + '@'+ langs[i] + split;
        }else{
          errTerms = errTerms + terms[i] + '@'+ langs[i]
        }
      }
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
      }
      // Send to VisualizationPanel.js 
      this.props.onReadFileChange();
    });
  }

  /**
   * Initialize file information on local storage
   */
  initFilesInfo() {
    const array = [];
    for (let i = 0; i < this.state.files.length; i++) {
      const file = {name: '', size: 'サイズ：byte', file: {}};
      if (i ==0 | i ==4){
        ;
      }else{
        if ( localStorage.getItem('fileName' + i) ) {
          file.name = localStorage.getItem('fileName' + i);
          file.size = localStorage.getItem('fileSize' + i);
        }
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

    const stepProps = {};
    const labelProps = {};

    const fileReadContent = (
      <>
        <Box component="div" display="block">

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box component="span" display="inline">
              編集用語彙<span style={{color: 'red'}}>*</span>
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
              編集用語彙_meta<span style={{color: 'red'}}>*</span>
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
              id="editingVocabularyMeta"
              type="file"
              onChange={(e) => this.setFileInfo(e, 4)}
              accept=".xlsx,.csv"
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

      </>);
    

    return (
      <div>
        <Dialog
          onClose={() => this.handleClose()}
          aria-labelledby="dialog-search-term-error"
          open={this.props.open}
          fullwidth="false"
          onEntered={() => this.initFilesInfo()}
          classes={{paper:this.props.classes.fileDialogPaper}}
        >
          <DialogTitle
          className={this.props.classes.fileDialogTitle}
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
          <DialogContent style={{width: '450px', overflow:'hidden'}}>
            { fileReadContent }
          </DialogContent>

          <Grid container justify="center" spacing={1} style={{ marginBottom: '-20px'}}>

          <Button
              color="primary"
              onClick={()=>this.handleClose()}
              className={this.props.classes.stepButton}
            >
              CANCEL
            </Button>

            <Button
              color="primary"
              onClick={()=>this.fileUpload()}
              className={this.props.classes.stepButton}
            >
              OK
            </Button>
          </Grid>
        </Dialog>

        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.uploading}
          message="ファイルアップロード中..."
        />
        <DialogOkCancel
          onCancel={()=>this.handleErrCancel()}
          open={this.state.errOpen}
          buttonsDisable={2}
          classes={this.props.classes}
          message="編集用語彙ファイルと編集用語彙_metaファイルを指定してください。"
        />
      </div>
    );
  }
}

DialogFileSelector.propTypes = {
  classes: PropTypes.object,
  editingVocabulary: PropTypes.object,
  editingVocabularyMeta: PropTypes.object,
  onReadFileChange : PropTypes.func,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  close: PropTypes.bool,
  okCancel: PropTypes.bool,
};
