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
 import DialogOkCancel from './DialogOkCancel';
 
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
     this.message='編集中のデータを破棄して用語選択を実行します。\n\nよろしいですか？';
     this.changeId=undefined;
     this.state = {
       tabIndex: this.props.editingVocabulary.currentNode.id ? this.props.editingVocabulary.currentNode.id : '', 
       open: false,
       dlgConfirmOpen: false,
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
    * Discard the data being edited and change the term
    */
   handleConfirmClose(){
     
    const targetList = this.props.editingVocabulary.sortedNodeList;
    let id = undefined;
    for (let i = 0; i < targetList.length; i++) {
      if (targetList[i].id == this.changeId ) {
        this.setState({tabIndex: i});
        this.props.change( targetList[i].language);
        id = targetList[i].id;
        break;
      }
    }

    if( id !== undefined){
      if(id === this.props.editingVocabulary.currentNode.id ){
        // in order to avoid deselection in the function
        this.props.editingVocabulary.currentNodeClear();
      }
      this.props.editingVocabulary.setCurrentNodeById( id );
      this.props.editingVocabulary.deselectTermList();
      if( this.props.editingVocabulary.currentNode.id){
       this.props.editingVocabulary.setSelectedIdList( this.props.editingVocabulary.currentNode );
       this.props.editingVocabulary.fitToCurrent();
      }
    }

    this.setState({ dlgConfirmOpen: false });

   }

   /**
    * Close the confirmation dialog for discarding the data being edited
    */
   handleConfirmCancelClose(){
    this.setState({ dlgConfirmOpen: false });
   }  

   /**
    * Vocabulary selection event
    * @param  {object} event - information of selected vocabulary
    */
   selectCurrentTerm(event) {
     if (event.keyCode == 32) {
       return;
     }
     this.changeId = event.target.dataset.id;
     const ret = this.props.editingVocabulary.getNodesStateChanged;
     if(  this.props.editingVocabulary.currentNode.id !== event.target.dataset.id
       && ( ret['ja'] || ret['en'] )){
       this.setState({ dlgConfirmOpen: true });
     }else{
       this.handleConfirmClose();
     }
   }
 
   render() {
    
     const sortedNodeList  = this.props.editingVocabulary.sortedNodeList.filter((d)=> !d.hidden );
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
              <MenuItem key={i} value={item.id}  data-id={item.id} 
              onClick={(event) => this.selectCurrentTerm(event)}>{item.term}</MenuItem>
            ))}
            </Select>
          </FormControl>
         </Grid>
         <DialogOkCancel
            onOkClose={() => this.handleConfirmClose()}
            onCancel={() =>this.handleConfirmCancelClose()}  
            open={this.state.dlgConfirmOpen}
            classes={this.props.classes}
            message={this.message}
         />
       </form>
     );
   }
 }
  
 SelectOfTerm.propTypes = {
   classes: PropTypes.object,
   editingVocabulary: PropTypes.object,
   change:  PropTypes.func,
 };
