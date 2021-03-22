/**
 * EditPanelExampleTab.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';
import TextFieldOfTerm from './TextFieldOfTerm';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

import {observer} from 'mobx-react';

import DialogApiError from './DialogApiError';

/**
 * Edit operation panel example statements tab component
 * @extends React
 *
 * @param {string} message - example sentence
 * @param {string} color - display color
 * @return {element} - element of example sentence
 */
export default
@observer class EditPanelExampleTab extends React.Component {
  /**
   * Constructor
   * @param {object} props - property
   */
  constructor(props) {
    super(props);
    this.state = {
      disabled: true, // Button control
    };
  }

  /**
   * Search run
   */
  search() {
    const currentTerm = this.props.editingVocabulary.currentNode.term;
    const searchTerm = this.props.editingVocabulary.searchTerm;
    if (currentTerm != '') {
      let requestIndex = 0;
      if (searchTerm == currentTerm) {
        // Require the next 100 words for a re-search of previously searched terms
        requestIndex = this.props.editingVocabulary.dispNowIndex;
      }
      this.props.editingVocabulary.getExampleMsg(currentTerm, requestIndex);

      this.setState( (prevProps) => {
        return {
          disabled: true,
        };
      });
    }
  }

  /**
   * Search Results Next View
   */
  next() {
    const examplePhrasesLength =
        this.props.editingVocabulary.examplePhrases.length;
    const dispNowIndex = this.props.editingVocabulary.dispNowIndex;

    if (dispNowIndex < examplePhrasesLength ) {
      // If index does not display the end of the sentence data it is retrieving, advance index
      this.props.editingVocabulary.changeDispNowIndex('next');
      const newDispIndex = this.props.editingVocabulary.dispNowIndex;
      this.setState( (prevProps) => {
        let buttonDisabled = prevProps.disabled;

        // Reaches the end of the retrieved example sentence and activates the button if there is an unretrieved example sentence
        if ((newDispIndex == examplePhrasesLength) &&
            (newDispIndex <
                this.props.editingVocabulary.exampleResult.
                    data.AllResultCount)) {
          console.log('[next] search button enabled.');
          buttonDisabled = false;
        }
        // console.log("[next] newIndex: " + newDispIndex);
        return {disabled: buttonDisabled};
      });
    } else {
      // Pressing the next button while the screen is displayed to the end
    }
  }

  /**
   * Pre-display Search Results
   */
  prev() {
    const dispNowIndex = this.props.editingVocabulary.dispNowIndex;
    if (dispNowIndex > 1) {
      this.props.editingVocabulary.changeDispNowIndex('prev');
    }
  }

  /**
   * Search term highlighting
   * @param  {string} message - example sentence
   * @param  {string} searchTerm - search vocabulary
   * @return {array} - split example sentence
   */
  changeTextColor(message, searchTerm) {
    if (message == null || message == '') {
      return [{message: '', color: ''}];
    }

    const rule = new RegExp(searchTerm, 'ig');
    let copy = message;
    const splitMessage = [];
    const msgColorObj = [];
    const matchMsg = message.match(rule);

    if (matchMsg == null || matchMsg == '') {
      return [{message: message, color: 'black'}];
    }

    matchMsg.forEach(function(n) {
      const i = copy.indexOf(n);
      if (i != 0) {
        splitMessage.push(copy.slice(0, i));
      }
      splitMessage.push(copy.slice(i, i + n.length));
      copy = copy.slice(i + n.length);
    });
    if (copy.length != 0) {
      splitMessage.push(copy);
    }

    for (let i = 0; i < splitMessage.length; i ++) {
      let color = 'black';
      const dummyObj = {};
      if (splitMessage[i].toLowerCase() === searchTerm.toLowerCase()) {
        color = 'red';
      }
      dummyObj.message = splitMessage[i];
      dummyObj.color = color;
      msgColorObj.push(dummyObj);
    }
    return msgColorObj;
  }

  ExampleMsg = ({message, color}) => {
    return (
      <span style={{color}}>{message}</span>
    );
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const dispNowIndex = this.props.editingVocabulary.dispNowIndex;
    const message =
        this.props.editingVocabulary.examplePhrases[dispNowIndex - 1];
    const currentTerm = this.props.editingVocabulary.currentNode.term;
    const examplePhrases = this.props.editingVocabulary.examplePhrases;
    const searchTerm = this.props.editingVocabulary.searchTerm;
    let buttonDisabled = this.state.disabled;
    if (searchTerm !== currentTerm) {
      buttonDisabled = false;
    }

    return (
      <div>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Box mt={1}>
              用語名
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Box>
              <TextFieldOfTerm
                classes={this.props.classes}
                text={this.props.editingVocabulary.currentNode.term}
              />
            </Box>
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Box height='400px' m={1.5} border={1}>
              <Grid container spacing={1} item xs={12}>
                <Box height='340px' m={1.5} style={{overflowY: 'auto'}}>
                  {this.changeTextColor(message, searchTerm).map((item, i) => (
                    <span style={{termBreak: 'break-all'}} key={i}>
                      <this.ExampleMsg
                        message={item.message}
                        color={item.color}
                      />
                    </span>
                  ))}
                </Box>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={7}>
                  <Box/>
                </Grid>
                <Grid item xs={3}>
                  <Box
                    m={1}
                    style={dispNowIndex==0?{display: 'none'}:{display: ''}}
                  >
                    <Box component="div" display="inline">
                      {dispNowIndex}
                    </Box>
                    <Box component="div" display="inline">
                      /
                    </Box>
                    <Box component="div" display="inline">
                      {examplePhrases.length}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={7}>
            <Box ml={3} mt={1}>
              <Button
                variant="contained"
                color="primary"
                id="example-search-button"
                onClick={()=>this.search()}
                disabled={buttonDisabled}
              >
                例文を検索
              </Button>
            </Box>
          </Grid>
          <Grid item xs={5}>
            <Box ml={1} mt={1}>
              <ButtonGroup
                variant="contained"
                aria-label="contained primary button group"
              >
                <Button onClick={()=>this.prev()}>
                  <ArrowLeftIcon/>
                </Button>
                <Button onClick={()=>this.next()}>
                  <ArrowRightIcon/>
                </Button>
              </ButtonGroup>
            </Box>
          </Grid>
        </Grid>
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

EditPanelExampleTab.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
};
