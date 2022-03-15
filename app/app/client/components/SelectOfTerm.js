/**
 * SelectOfTerm.js COPYRIGHT FUJITSU LIMITED 2021
 */
 import React from 'react';
 import PropTypes from 'prop-types';
 
 import FormControl from '@material-ui/core/FormControl';
 import MenuItem from '@material-ui/core/MenuItem';
 import Select from '@material-ui/core/Select';
 import Grid from '@material-ui/core/Grid';
 
 import {observer} from 'mobx-react';
 
 /**
 * Vocabulary select component
 * @extends React
 */
 export default
 @observer class SelectOfTerm extends React.Component {
   /**
    * render
    * @return {element}
    */
   constructor(props) {
     super(props);
     this.state = {
       tabIndex: this.props.editingVocabulary.currentNode.id ? this.props.editingVocabulary.currentNode.id : '', 
       open: false,
     };
   }
 
   handleChange = event => {
     this.setState({ tabIndex: event.target.value });
   };
 
   handleClose = () => {
     this.setState({ open: false });
   };
 
   handleOpen = () => {
     this.setState({ open: true });
   };
   /**
    * Vocabulary selection event
    * @param  {object} event - information of selected vocabulary
    */
   selectCurrentTerm(event) {
     if (event.keyCode == 32) {
       return;
     }
     const targetTerm = this.props.editingVocabulary.sortedNodeList;
     const currentTerm = event.target.textContent;
     for (let i = 0; i < targetTerm.length; i++) {
       if (targetTerm[i].term == currentTerm) {
         this.setState({tabIndex: i});
         break;
       }
     }

     this.props.editingVocabulary.setCurrentNodeByTerm( currentTerm);     
     this.props.editingVocabulary.deselectTermList();
     if( this.props.editingVocabulary.currentNode.id){
      this.props.editingVocabulary.setSelectedTermList( currentTerm);
     }
   }
 
   render() {
     const sortedNodeList = this.props.editingVocabulary.sortedNodeList;
     const currentId = this.props.editingVocabulary.currentNode.id ? this.props.editingVocabulary.currentNode.id : '';
     return (
       <form noValidate autoComplete="off">
         <Grid item xs={12}>
          <FormControl
            variant="outlined"
            className={this.props.classes.selectTermForm}
          >
            <Select
              open={this.state.open}
              onClose={this.handleClose}
              onOpen={this.handleOpen}
              value={currentId}
              onChange={this.handleChange}
              className={this.props.classes.selectTerm}
              SelectDisplayProps={{ style: { paddingTop: 0, paddingBottom: 0 , paddingLeft: '20px'} }}
            >
            {sortedNodeList.map((item, i) => (
              <MenuItem key={i} value={item.id} 
              onClick={(event) => this.selectCurrentTerm(event)}>{item.term}</MenuItem>
            ))}
            </Select>
          </FormControl>
         </Grid>
       </form>
     );
   }
 }
  
 SelectOfTerm.propTypes = {
   classes: PropTypes.object,
   editingVocabulary: PropTypes.object,
 };
  