/**
 * TextFieldOfTermDescription.js COPYRIGHT FUJITSU LIMITED 2021
 */
 import React from 'react';
 import PropTypes from 'prop-types';
 import Grid from '@material-ui/core/Grid';
 import Box from '@material-ui/core/Box';
 
 import {observer} from 'mobx-react';
  
 import TextFieldMultiLine from './TextFieldMultiLine';
 
 /**
  * Narrower term text field component
  * @extends React
  */
 export default
 @observer class TextFieldOfTermDescription extends React.Component {  

  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {open: false, message: ''};
  }

  /**
   * Key event registration
   */
   componentDidMount() {
  }

  /**
   * Term description update event
   * @param  {object} event - information of event
   * @param  {array} newValue - list of term description
   */
   onChange( newValue) {
    this.props.editingVocabulary.updataTermDescription(newValue);
  }

   render() {
    const editingVocabulary = this.props.editingVocabulary;
    const tmpTermDescription = editingVocabulary.tmpTermDescription.values[editingVocabulary.tmpLanguage.value];

    // preferred label when switching with the  language radio button in the selected term
    let currentTermDescription = editingVocabulary.currentLangDiffNode.term_description;
    // preferred label on the selected term
    if ( editingVocabulary.currentNode.language == editingVocabulary.tmpLanguage.value) {
      currentTermDescription = editingVocabulary.currentNode.term_description;
    }
     let backColor = 'rgba(0, 0, 0, 0)';
     if( this.props.disabled){
       backColor = 'rgba(0, 0, 0, 0.09)';
     }else if( currentTermDescription !== '' && tmpTermDescription === ''){
       backColor = 'lavenderblush';
     }

    return (
    <div>
      <Grid item xs={12}>
        <Box>
          <TextFieldMultiLine
            classes={this.props.classes}
            editingVocabulary={this.props.editingVocabulary}
            disabled={this.props.disabled}
            backcolor={backColor}
            value={tmpTermDescription}
            change={(value) => this.onChange(value) }
          />
        </Box>
      </Grid>
    </div>
  );

   }
 }
 
 TextFieldOfTermDescription.propTypes = {
   editingVocabulary: PropTypes.object,
   classes: PropTypes.object,
   change: PropTypes.func,
   disabled: PropTypes.bool,
 };
