/**
 * EditPanelRelationWordTab.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import {observer} from 'mobx-react';

import ColorChartCheckBoxes from './ColorChartCheckBoxes';
import TextFieldOfTerm from './TextFieldOfTerm';
import TextFieldOfPos from './TextFieldOfPos';
import TextFieldOfPosition from './TextFieldOfPosition';
import CheckboxPartOfSpeechHiddenLabels
  from './CheckboxPartOfSpeechHiddenLabels';
// import CheckboxTermHiddenLabels from './CheckboxTermHiddenLabels';
import DialogApiError from './DialogApiError';

/**
 * Edit action panel related terms tab components
 * @extends React
 */
export default
@observer class EditPanelRelationWordTab extends React.Component {
  /**
   * render
   * @return {element}
   */
  render() {
    const editingVocabulary = this.props.editingVocabulary;
    let fileId = editingVocabulary.selectedFile.id;
    const currentRefFile =
     editingVocabulary.getTargetFileData(editingVocabulary.homotopicFile.id);

    const edit = editingVocabulary.editingVocabulary.find(
        (edit) => editingVocabulary.currentNode.term === edit.term);

    const refere = currentRefFile.find(
        (ref) => editingVocabulary.currentNode.term === ref.term);

    if (!edit && refere) {
      fileId = editingVocabulary.homotopicFile.id;
    }

    let disabled = true;
    if (fileId == 0 && this.props.editingVocabulary.currentNode.id) {
      // Allow each component to operate during editing vocabulary selection and term selection
      disabled = false;
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

        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Box mt={1}>
              品詞
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Box>
              <TextFieldOfPos
                classes={this.props.classes}
                text={this.props.editingVocabulary.currentNode.part_of_speech}
              />
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Box mt={1}>
              座標値
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Box>
              <TextFieldOfPosition
                classes={this.props.classes}
                selectedFile={this.props.editingVocabulary.selectedFile}
                currentNode={this.props.editingVocabulary.currentNode}
                editingVocabulary={this.props.editingVocabulary}
              />
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Box mt={1}>
              枠線色
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Box>
              <ColorChartCheckBoxes
                colorId="color1"
                classes={this.props.classes}
                currentId={this.props.editingVocabulary.currentNode.id}
                color={this.props.editingVocabulary.currentNode.color1}
                selectColor={(currentId, colorId, color) =>
                  this.props.editingVocabulary.updateColor(currentId,
                      colorId, color)
                }
                tmpColor={this.props.editingVocabulary.tmpBorderColor}
                selectTmpColor={(id, color) =>
                  this.props.editingVocabulary.selectTmpBorderColor(
                      id, color)
                }
                disabled={disabled}
              />
            </Box>
          </Grid>
        </Grid>

        {/*
          <Grid container spacing={2}>
          <Grid item xs={3}>
            <Box>
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Box>
              <CheckboxTermHiddenLabels
                hidden={this.props.editingVocabulary.currentNode.hidden}
                change={(e) => this.props.editingVocabulary.changeHidden(e)}
                editingVocabulary={this.props.editingVocabulary}
              />
            </Box>
          </Grid>
        </Grid>
        */}

        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Box mt={1}>
              フィルター
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Box border={1} p={1}>
              <CheckboxPartOfSpeechHiddenLabels
                checkList={
                  this.props.editingVocabulary.tmpPartOfSpeechCheckList
                }
                check={(e) => this.props.editingVocabulary.checkPartOfSpeech(e)}
                up={(e) => this.props.editingVocabulary.upPartOfSpeech(e)}
              />
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

EditPanelRelationWordTab.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
};
