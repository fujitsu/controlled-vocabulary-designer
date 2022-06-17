/**
 * TextFieldOfUri.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Autocomplete from '@material-ui/lab/Autocomplete';
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
      config: config,
    };
  }


  /**
   * render
   * @return {element}
   */
  render() {
    const uri = this.props.editingVocabulary.tmpUri.list;

    //  URI display in real time
    let finalUri;
    let idofuri;
    let id;
    if( this.props.editingVocabulary.tmpUri.list.length > 0 &&
        this.props.editingVocabulary.tmpIdofUri.list.length > 0) {
          idofuri = this.props.editingVocabulary.tmpUri.list[0];
          id  = this.props.editingVocabulary.tmpIdofUri.list[0];
        }
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

    const  disabledFlg = true;

    const currentUri = this.props.editingVocabulary.currentNode.uri;

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
                  style={{display: 'inline'}}
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
                        config={this.state.config}
                      />
                    ));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      style={
                        disabledFlg ?
                          {backgroundColor: 'rgba(0, 0, 0, 0.09)'}:
                          {backgroundColor: 'rgba(0, 0, 0, 0)'}
                      }
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </form>
      </div>
    );
  }
}

TextFieldOfUri.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
};
