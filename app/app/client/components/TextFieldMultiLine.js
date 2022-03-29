/**
 * TextFieldMultiLine.js COPYRIGHT FUJITSU LIMITED 2021
 */
 import React from 'react';
 import PropTypes from 'prop-types';
 
 import Grid from '@material-ui/core/Grid';
 import Box from '@material-ui/core/Box';
 import TextField from '@material-ui/core/TextField';
 import Input from '@material-ui/core/Input';
 import Snackbar from '@material-ui/core/Snackbar';
 import IconButton from '@material-ui/core/IconButton';
 import CloseIcon from '@material-ui/icons/Close';
 
  import {observer} from 'mobx-react';
 
 /**
  * Meta description text filed component
  * @extends React
  */
 export default
 @observer class TextFieldMultiLine extends React.Component {
   /**
    * constructor
    * @param {object} props
    */
   constructor(props) {
     super(props);
     this.state = {
       open: false, 
       message: '',
     };
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
    * Meta description update event
    * @param  {object} event - information of event
    * @param  {array} newValue - list of meta description
    */
   onChange(event, newValue) {
     this.props.change( event.target.value);
   }
 
   /**
    * render
    * @return {element}
    */
   render() {
 
     const bgcolor = this.props.disabled?'rgba(0, 0, 0, 0.09)':'rgba(0, 0, 0, 0)';
     const tmpMetaDescription = this.props.value;

     return (
       <div>
         <form noValidate autoComplete="off">
           <Grid item xs={12}>
            {/* [ inputTextWrap ] - declared a global class to take advantage of WebKit's CSS extensions */}
             <Box border={1} className='inputTextMultiWrap'>
               <div className={this.props.classes.inputTextItem}>
                 <div className={this.props.classes.inputTextDummy}>
                   {tmpMetaDescription}
                 </div>
                 <Input
                    multiline
                    onChange={(e)=>this.onChange(e)}
                    className={this.props.classes.inputText}
                    style={{backgroundColor: bgcolor, minHeight: '4.7em'}}
                    defaultValue={tmpMetaDescription}
                 />
               </div>
             </Box>
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
 
 TextFieldMultiLine.propTypes = {
   editingVocabulary: PropTypes.object,
   editingVocabularyMeta: PropTypes.object,
   classes: PropTypes.object,
   value: PropTypes.string,
   change: PropTypes.func,
   disabled: PropTypes.bool,
 };
 