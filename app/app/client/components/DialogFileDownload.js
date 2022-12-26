/**
 * DialogFileDownload.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import Box from '@material-ui/core/Box';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import axios from 'axios';

/**
 * File download dialog
 * @extends React
 */
export default class DialogFileDownload extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {
      fileName: '',
      fileFormat: '',
      fileContentType: '',
    };
  }

  /**
  * Dialog close event
  */
  handleClose() {
    this.props.onClose();
    this.setState({
      fileName: '',
      fileFormat: '',
      fileContentType: '',
    });
  };

  /**
   * File information initialization
   */
  initFilesInfo() {
    let fileName = '';
    let fileFormat = 'csv';
    let contentType = 'text/csv';

    // Set as the initial value if the input filename exists in the local storage.
    if (this.props.fileType == 'editing_vocabulary') {
      // For editing vocabulary, set the file name of the editing vocabulary
      if ( localStorage.getItem('fileName0') ) {
        fileName =
        this.deleteFormat(localStorage.getItem('fileName0')) ;
      } else {
        fileName = 'hensyuugoi';
      }
    } else if (this.props.fileType == 'editing_vocabulary_meta') {
      // For editing_vocabulary_meta, set the file name for editing_vocabulary_meta
      if ( localStorage.getItem('fileName4') ) {
        fileName =
        this.deleteFormat(localStorage.getItem('fileName4')) ;
      } else {
        fileName = 'hensyuugoi_meta';
      }
    } else if (this.props.fileType == 'controlled_vocabulary') {
      // For controlled vocabulary, set the file name for reference vocabulary 1
      fileFormat = this.controlledVocabularyFormat[0].format;
      contentType = this.controlledVocabularyFormat[0].type;
      if ( localStorage.getItem('fileName0') ) {
        fileName =
        this.deleteFormat(localStorage.getItem('fileName0')) + '.' + fileFormat;
      } else {
        fileName = 'touseigoi' + '.' + fileFormat;
      }
    }

    this.setState({
      fileName: fileName,
      fileFormat: fileFormat,
      fileContentType: contentType,
    });
  }

  /**
   * Delete extension
   * @param  {string} fileName - filename
   * @return {string} - filename
   */
  deleteFormat(fileName) {
    let checkFileName = fileName;
    this.getFormatFiles().forEach((format) => {
      // If the file name already contains an extension, delete it.
      if (fileName.endsWith('.' + format.format)) {
        checkFileName = fileName.replace('.' + format.format, '');
      }
    });
    return checkFileName;
  }
  /**
   * returns an object in file format
   * @returns object array
   */
  getFormatFiles(){
    return [...this.controlledVocabularyFormat,
    {
      format: 'csv',
      type: 'text/csv',
    }];
  }

  /**
   * File rename event
   * @param  {object} e - information of event
   */
  changeFileName(e) {
    this.setState({fileName: e.target.value});
  }

  /**
   * Extension change event
   * @param  {object} e - information of event
   */
  changeFileFormat(e) {
    let contentType = '';

    // Get the contentType from a list
    contentType =
    this.controlledVocabularyFormat.find((data) => data.format == e.target.value).type;

    this.setState({
      fileName: this.deleteFormat(this.state.fileName) + '.' + e.target.value,
      fileFormat: e.target.value,
      fileContentType: contentType,
    });
  }

  /**
   * Download run
   */
  execDownload() {
    const fileType = this.props.fileType;
    const url = '/api/v1/download/' + fileType +
      '?out_format=' + this.state.fileFormat;

    axios
        .get(url)
        .then((response) => {
          let fileName = this.state.fileName;
          let noneFormatFlg = true; // True if there is no extension

          // Set initial value if file name is not specified
          if (!fileName) {
            if (fileType == 'editing_vocabulary') {
              fileName = 'hensyuugoi';
            }
            if (fileType == 'editing_vocabulary_meta') {
              fileName = 'hensyuugoi_meta';
            }
            if (fileType == 'controlled_vocabulary') {
              fileName = 'touseigoi';
            }
          }

          // Add if extension has been manually cleared
          this.getFormatFiles().forEach((format) => {
            if (fileName.endsWith('.' + format.format)) {
              noneFormatFlg = false;
            }
          });
          if (noneFormatFlg) {
            fileName = fileName + '.' + this.state.fileFormat;
          }

          const a = document.createElement('a');
          switch (this.state.fileFormat) {
            case 'xlsx':
              // xlsx only the data has been converted, so refer to the original data
              a.href = response.request.responseURL;
              break;
            default:
              // Generate BOM to set character code to UTF -8
              const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
              a.href =
                URL.createObjectURL(new Blob(
                    [bom, response.data],
                    {type: this.state.fileContentType},
                ));
              break;
          }
          a.download = fileName;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }).catch((err) => {
          console.log('[Error] message : ' + err.message);
          let errMsg = '';
          let errCode = -1;
          // If there is a response
          if (err.response) {
            errCode = err.response.status;
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
              default:
                errMsg = '不明なエラー発生';
                break;
            }
          } else {
            errMsg = err.message;
          }
          this.props.editingVocabulary.
              openApiErrorDialog('ダウンロードエラー', errCode, errMsg);
        });
    this.props.onClose();
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
          open={this.props.open}
          fullwidth="false"
          TransitionProps={{
            onEntered:() =>{ this.initFilesInfo(); }
          }}
        >
          <DialogTitle>
            ファイル出力
            
            <IconButton
              aria-label="close"
              onClick={() => this.handleClose()}
              className={this.props.classes.closeButton}
            >
              <CloseIcon />            
            </IconButton>
          </DialogTitle>
          <DialogContent style={{width: '450px'}}>
            <Box component="div" display="block">
              <Input
                value={this.state.fileName}
                type="text"
                onChange={(e) => this.changeFileName(e)}
                startAdornment={
                  <InputAdornment position="start">
                    <InsertDriveFileIcon />
                  </InputAdornment>
                }
                style={{margin: '15px 0px 25px 0px', width: '300px'}}
              />
              <FormControl
                variant="outlined"
                className={this.props.classes.formControl}
              >
              { this.props.fileType == 'controlled_vocabulary'?
                <><InputLabel htmlFor="file-download"></InputLabel>
                <Select
                  native
                  value={this.state.fileFormat}
                  onChange={(e) => this.changeFileFormat(e)}
                  className={this.props.classes.selectFileFormat}
                  inputProps={{
                    name: 'format',
                    id: 'file-download',
                  }}
                >
                  {this.controlledVocabularyFormat.map((item, i) => (
                    <option key={i} value={item.format}>{item.format}</option>
                  ))}
                </Select></>
              :
              <p style={{fontSize:'1.1em'}}>.csv</p>
              }
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.execDownload()} color="primary">
            OK
            </Button>
            <Button onClick={() => this.handleClose()} color="primary">
            Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  controlledVocabularyFormat = [
    {
      format: 'n3',
      type: 'text/n3',
    },
    {
      format: 'nquads',
      type: 'text/x-nquads',
    },
    {
      format: 'nt',
      type: 'application/octet-stream',
    },
    {
      format: 'trix',
      type: 'application/octet-stream',
    },
    {
      format: 'turtle',
      type: 'text/turtle',
    },
    {
      format: 'xml',
      type: 'text/xml',
    },
    {
      format: 'jsonld',
      type: 'application/ld+json',
    },
  ];
}

DialogFileDownload.propTypes = {
  onClose: PropTypes.func,
  fileType: PropTypes.string,
  editingVocabulary: PropTypes.object,
  open: PropTypes.bool,
  classes: PropTypes.object,
};
