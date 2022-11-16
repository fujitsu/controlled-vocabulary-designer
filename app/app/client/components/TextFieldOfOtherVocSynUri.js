/**
 * TextFieldOfOtherVocSynUri.js COPYRIGHT FUJITSU LIMITED 2021
 */
 import React from 'react';
 import PropTypes from 'prop-types';
 
 import TextField from '@material-ui/core/TextField';
 import Grid from '@material-ui/core/Grid';
 import Box from '@material-ui/core/Box';
 import Autocomplete from '@material-ui/lab/Autocomplete';

 import {observer} from 'mobx-react';
 
 import EditPanelChip from './EditPanelChip';
 
 /**
  * Other vocab syn uri text field component
  * @extends React
  */
 export default
 @observer class TextFieldOfOtherVocSynUri extends React.Component {
   /**
    * render
    * @return {element}
    */
   render() {
     const listOtherVocSynUri = this.props.currentOtherVocSynUri===''?[]:[this.props.currentOtherVocSynUri];
     const tmpOtherVocSynUri = this.props.otherVocSynUri.length>0?this.props.otherVocSynUri:[];
      
     return (
       <form noValidate autoComplete="off">
         <Grid item xs={12}>
           <Box border={1}>
             <Autocomplete
               multiple
               freeSolo
               disabled
               value={tmpOtherVocSynUri}
               classes={{
                 inputRoot: this.props.classes.autocompleteDisabledInputRoot,
                 clearIndicator: this.props.classes.displayNone,
                 tag: this.props.classes.autocompleteDisabledTag,
               }}
               id="text-field-of-other-vocab-syn-uri-input"
               options={[]}
               renderTags={(tagValue, getTagProps) => {
                 return tagValue.map((option, index) => (
                   <EditPanelChip
                     key={index}
                     {...getTagProps({index})}
                     label={option}
                     chipid={'0'}
                     currentlist={listOtherVocSynUri}
                     needblankcheck={'false'}
                   />
                 ));
               }}
               renderInput={(params) => (
                 <TextField
                   {...params}
                   variant="standard"
                 />
               )}
             />
           </Box>
         </Grid>
       </form>
     );
   }
 }
 
 TextFieldOfOtherVocSynUri.propTypes = {
   classes: PropTypes.object,
   currentOtherVocSynUri: PropTypes.string,
   otherVocSynUri: PropTypes.array,
 };
