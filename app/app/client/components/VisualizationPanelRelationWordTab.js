/**
 * VisualizationPanelRelationWordTab.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import {brown} from '@material-ui/core/colors';
import {red} from '@material-ui/core/colors';
import {orange} from '@material-ui/core/colors';
import {yellow} from '@material-ui/core/colors';
import {lightGreen} from '@material-ui/core/colors';
import {green} from '@material-ui/core/colors';
import {lightBlue} from '@material-ui/core/colors';
import {blue} from '@material-ui/core/colors';
import {deepPurple} from '@material-ui/core/colors';
import {purple} from '@material-ui/core/colors';

import CytoscapeComponent from 'react-cytoscapejs';

import {observer} from 'mobx-react';

import Search from './Search';

/**
 * Visualization screen panels related terms tab components
 * @extends React
 */
export default
@observer class VisualizationPanelRelationWordTab extends React.Component {
  /**
   * Constructor
   */
  constructor() {
    super();
    // this.state = {nodeNum: 0};
    this.setInitialPanZoom = false;
    this.zoomTimeoutId = -1;
  }

  /**
   * Post-mount processing
   * Graph information initialization
   */
  componentDidMount() {
    this.setUpListeners();
    this.cy.reset();
    this.props.editingVocabulary.initRelationWordMinZoom(-1);
  }

  /**
   * Update post-processing
   * Graph redraw process after update
   */
  componentDidUpdate() {
    // console.log($('canvas[data-id="layer1-drag"]')[0]);
    // const canvas = $('canvas[data-id="layer1-drag"]')[0];
    // console.log(canvas.getContext('2d'));
    this.updateElesClass();
  }

  /**
   * Max min scale
   */
  setCyMinMaxZoom() {
    const cy = this.cy;
    cy.minZoom(0.0025);
    cy.maxZoom(1.2);
    const cyw = cy.width();
    const cyh = cy.height();
    cy.viewport({zoom: 0.005, pan: {x: cyw/2, y: cyh/2}});
  }

  /**
   * Update graph data
   */
  updateElesClass() {
    const cy = this.cy;
    const termListForRelationWord =
        this.props.editingVocabulary.termListForRelationWord;
    cy.nodes().removeClass(
        [
          'selected',
          'black',
          'brown',
          'red',
          'orange',
          'yellow',
          'lightGreen',
          'green',
          'lightBlue',
          'blue',
          'deepPurple',
          'purple',
          'bgBlack',
          'bgBrown',
          'bgRed',
          'bgOrange',
          'bgYellow',
          'bgLightGreen',
          'bgGreen',
          'bgLightBlue',
          'bgBlue',
          'bgDeepPurple',
          'bgPurple',
          'displayNone',
          'showText',
        ],
    );
    const size = Math.max(6/this.cy.zoom(), 0.01);
    cy.nodes().style({'width': size,
      'height': size,
      'border-width': 0});
    cy.nodes().unselect();

    termListForRelationWord.forEach((node, index) => {
      const eles = cy.$id(node.data.id);
      eles.addClass(node.data.relationTermColor);

      if (node.data.term === this.props.editingVocabulary.currentNode.term) {
        eles.addClass('selected');
        eles.addClass('showText');
        eles.select();

        // Center selected eles
        this.cy.animate({
          zoom: cy.zoom(),
          center: {
            eles: eles,
          },
        }, {
          duration: 200,
        });
      }

      // Support for homotopic display: Update to updated coordinate values after render
      eles.unlock();
      eles.position({
        x: node.position.x,
        y: node.position.y,
      });
      eles.lock();

      const currentRefFile =
       this.props.editingVocabulary.
           getTargetFileData(this.props.editingVocabulary.homotopicFile.id);

      const foundRef = currentRefFile.find(
          (ref) => node.data.term === ref.term);

      const foundEdit = this.props.editingVocabulary.editingVocabulary.find(
          (data) => data.term === node.data.term);

      let selectedPosX;
      let selectedPosY;
      let visible = true;

      if (foundEdit && foundRef) {
        selectedPosX = foundEdit.position_x;
        selectedPosY = foundEdit.position_y;

        if (!selectedPosX && !selectedPosY) {
          selectedPosX = foundRef.position_x;
          selectedPosY = foundRef.position_y;
        }

        if (!(selectedPosX == 0 && selectedPosY == 0) &&
          (node.position.x === 0 && node.position.y === 0)) {
          selectedPosX = foundEdit.position_x;
          selectedPosY = foundEdit.position_y;
          visible = false;
        }
      } else if (foundEdit) {
        selectedPosX = foundEdit.position_x;
        selectedPosY = foundEdit.position_y;
      } else if (foundRef) {
        selectedPosX = foundRef.position_x;
        selectedPosY = foundRef.position_y;

        visible = false;
      }

      if (!selectedPosX && !selectedPosY) {
        visible = false;
      }

      if (visible) {
        eles.style({
          visibility: 'visible',
        });
      } else {
        eles.style({
          visibility: 'hidden',
        });
      }


      // Hides if the value of the homotopic slider is 0 and the target term is only in the reference vocabulary or if the value of the homotopic slider is 100 and the target term is only in the edited vocabulary.
      // if ((foundEdit && foundRef) &&
      //   (node.position.x === 0 && node.position.y === 0)) {
      //   if ((homotopicValue === 100 &&
      //     !(foundRef.position_x == 0 && foundRef.position_y == 0)) ||
      //     (homotopicValue === 0 &&
      //       !(foundEdit.position_x == 0 && foundEdit.position_y == 0))) {
      //     eles.style({
      //       visibility: 'hidden',
      //     });
      //   } else {
      //     eles.style({
      //       visibility: 'visible',
      //     });
      //   }
      // } else if ((node.position.x == 0 && node.position.y == 0) &&
      //  (homotopicValue === 100 && foundEdit)) {
      //   eles.style({
      //     visibility: 'hidden',
      //   });
      // } else if ((node.position.x == 0 && node.position.y == 0) &&
      //  (homotopicValue === 0 && foundRef)) {
      //   eles.style({
      //     visibility: 'hidden',
      //   });
      // } else {
      //   eles.style({
      //     visibility: 'visible',
      //   });
      // }

      // if (index >= (termListForRelationWord.length -
      //        this.props.editingVocabulary.DISP_NODE_MAX) ) {
      // eles.addClass('showText');
      // }
    });

    const layout = this.cy.layout({name: 'preset'});
    layout.run();
    if (this.props.editingVocabulary.updated) {
      this.props.editingVocabulary.clearUpdate();
      this.cy.one('layoutstop', (event) => {
        console.log('layoutstp:');
        this.setCyMinMaxZoom();
      });
    }
  }

  /**
   * [onPanZoom description]
   */
  onPanZoom() {
    this.props.editingVocabulary.updateRelationWordMinZoom(this.cy.zoom());
    if (this.zoomTimeoutId > 0) {
      clearTimeout(this.zoomTimeoutId);
      this.zoomTimeoutId = -1;
    }
    this.zoomTimeoutId = setTimeout( () => {
      const cy = this.cy;
      cy.nodes().removeStyle('width height border-width font-size padding');
      cy.nodes().removeClass(
          [
            'bgBlack',
            'bgBrown',
            'bgRed',
            'bgOrange',
            'bgYellow',
            'bgLightGreen',
            'bgGreen',
            'bgLightBlue',
            'bgBlue',
            'bgDeepPurple',
            'bgPurple',
          ],
      );

      const termListForRelationWord =
         this.props.editingVocabulary.termListForRelationWord;
      const zoom = this.cy.zoom();
      termListForRelationWord.forEach((node, index) => {
        const ele = cy.$id(node.data.id);
        ele.removeClass('showText');
        ele.addClass(node.data.relationTermColor);
        ele.style({'width': Math.max(6/zoom, 0.01),
          'height': Math.max(6/zoom, 0.01),
          'border-width': 0});
      });

      // List of nodes in view
      const ext = cy.extent();
      const nodesInView = cy.nodes().filter((n) => {
        const bb = n.boundingBox();
        return bb.x1 > ext.x1 &&
                bb.x2 < ext.x2 &&
                bb.y1 > ext.y1 &&
                bb.y2 < ext.y2;
      });

      // get visible node
      const visibleNodesInView = nodesInView.filter((n) => {
        return n.style('visibility') === 'visible' &&
               !(n.hasClass('displayNone'));
      });

      // get element near center
      const cpX = ( ext.x1 + ext.w / 2 ) / zoom;
      const cpY = ( ext.y1 + ext.h / 2 ) / zoom;
      let sortArr=[];
      visibleNodesInView.map((n, index)=>{
        const bb = n.boundingBox();
        sortArr = [...sortArr, {
          'index': index,
          'distance': Math.abs( bb.x1 / zoom - cpX ) + Math.abs( bb.y1 / zoom - cpY )
        }]
      })

      sortArr.sort((a, b)=> { return a.distance - b.distance; });
      if( sortArr.length > 100 ) sortArr.splice( 100);

      // 100 visibleNodesInView
      let nodesInViewLimit100 = [];
      sortArr.forEach((data)=>{
        nodesInViewLimit100 =
          [...nodesInViewLimit100, visibleNodesInView[data.index]];
      })

      const nodeInViewStyle = {
        'width': 'label',
        'height': 'label',
        'font-size': Math.min(4800, Math.max(16/zoom, 0.01)),
        'border-width': Math.max(2.0/zoom, 0.01),
        'padding': Math.max(3.0/zoom, 0.01),
      };

      nodesInViewLimit100.forEach((node, index)=>{
        node.addClass('showText');
        node.style(nodeInViewStyle);
        this.setConfirmStyle(node, node.data().confirm);
      });
      // Special process for selected
      const currentTerm = this.props.editingVocabulary.currentNode.term;
      const currentNode = termListForRelationWord.find((node) => {
        return currentTerm === node.data.term;
      });

      if (currentNode) {
        const selectedele = cy.$id(currentNode.data.id);
        selectedele.addClass('showText');
        this.setConfirmStyle(selectedele, selectedele.data().confirm);
        selectedele.addClass('selected');
        selectedele.style({
          'width': 'label',
          'height': 'label',
          'font-size': Math.min(4800, Math.max(16/zoom, 0.01)),
          'border-width': Math.max(4.0/zoom, 0.01),
          'padding': Math.max(3.0/zoom, 0.01),
        });
      }
    }, 300);
  }

  /**
   * Set the background color style for nodeObject
   * @param {Object} eles    node object[IN/OUT]
   * @param {Boolean} confirm - confirmed information[IN]
   */
  setConfirmStyle(eles, confirm) {
    if (confirm) {
      if (confirm == 1) {
        const confirmColor = this.props.editingVocabulary.confirmColor;
        let bgStyle;
        switch (confirmColor) {
          case 'brown': bgStyle = 'bgBrown'; break;
          case 'red': bgStyle = 'bgRed'; break;
          case 'orange': bgStyle = 'bgOrange'; break;
          case 'yellow': bgStyle = 'bgYellow'; break;
          case 'lightGreen': bgStyle = 'bgLightGreen'; break;
          case 'green': bgStyle = 'bgGreen'; break;
          case 'lightBlue': bgStyle = 'bgLightBlue'; break;
          case 'blue': bgStyle = 'bgBlue'; break;
          case 'deepPurple': bgStyle = 'bgDeepPurple'; break;
          case 'purple': bgStyle = 'bgPurple'; break;
        }

        if (bgStyle) {
          eles.addClass(bgStyle);
        } else {
          eles.addClass('bgBlack');
        }
      } else {
        eles.addClass('bgBlack');
      }
    } else {
      eles.addClass('bgBlack');
    }
  }

  /**
   * Event registration
   */
  setUpListeners() {
    this.cy.on('click', 'node', (event) => {
      const target = event.target.data();
      this.props.editingVocabulary.setCurrentNodeByTerm(target.term);
    });

    this.cy.on('pan', (event) => {
      this.onPanZoom();
    });

    this.cy.on('zoom', (event) => {
      this.onPanZoom();
    });
  }

  /**
   * File selection for displaying homo topic
   * @param  {object} event - information of event
   */
  targetFileChange(event) {
    const editingVocabulary = this.props.editingVocabulary;
    editingVocabulary.selectHomotopicFile(event.target.value);
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const currentNode = this.props.editingVocabulary.currentNode;
    /* eslint-disable no-unused-vars */
    const color = currentNode.color1;
    /* eslint-enable no-unused-vars */

    const termListForRelationWord =
        this.props.editingVocabulary.termListForRelationWord;

    return (
      <div>
        <Grid
          container
          spacing={2}
          className={this.props.classes.visualizationVocabularyHead}
        >
          <Grid item xs={8}>
            <Box>
              <Search
                classes={this.props.classes}
                editingVocabulary={this.props.editingVocabulary}
              />
            </Box>
          </Grid>
          <Grid item xs={4} >
            <Box>
              <FormControl className={this.props.classes.fileSelecter}>
                <Select
                  labelId="homotopic-file-select-label"
                  id="homotopic-file-select"
                  onChange={(e) => this.targetFileChange(e)}
                  value={this.props.editingVocabulary.homotopicFile.id}
                >
                  <MenuItem value={1}>参照用語彙1</MenuItem>
                  <MenuItem value={2}>参照用語彙2</MenuItem>
                  <MenuItem value={3}>参照用語彙3</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>

        <CytoscapeComponent
          id="relation_term_graph_container"
          elements={CytoscapeComponent.normalizeElements(
              {
                nodes: termListForRelationWord,
              })}

          style={{
            width: '100%',
            height: '630px',
            backgroundColor: '#E3E3E3',
          }}

          stylesheet={[
            {
              selector: 'node',
              style: {
              },
            },
            {
              selector: '.showText',
              style: {
                'color': 'black',
                'text-background-shape': 'rectangle',
                'text-max-width': '200000px',
                'text-valign': 'center',
                'text-halign': 'center',
                'text-wrap': 'wrap',
                'content': 'data(term)',
                'shape': 'rectangle',
                'background-opacity': 0.6,
              },
            },
            {
              selector: '.selected',
              style: {
                'z-index': 100,
              },
            },
            {
              selector: '.displayNone',
              style: {
                'display': 'none',
              },
            },
            {
              selector: '.black',
              style: {
                // 'background-color': 'black',
                'border-color': 'black',
                // 'background-opacity': 0.6,
              },
            },
            {
              selector: '.brown',
              style: {
                // 'background-color': '#795548',
                'border-color': '#795548',
                // 'background-opacity': 0.6,
              },
            },
            {
              selector: '.red',
              style: {
                // 'background-color': '#f44336',
                'border-color': '#f44336',
                // 'background-opacity': 0.6,
              },
            },
            {
              selector: '.orange',
              style: {
                // 'background-color': '#ff9800',
                'border-color': '#ff9800',
                // 'background-opacity': 0.6,
              },
            },
            {
              selector: '.yellow',
              style: {
                // 'background-color': '#ffeb3b',
                'border-color': '#ffeb3b',
                // 'background-opacity': 0.6,
              },
            },
            {
              selector: '.lightGreen',
              style: {
                // 'background-color': '#8bc34a',
                'border-color': '#8bc34a',
                // 'background-opacity': 0.6,
              },
            },
            {
              selector: '.green',
              style: {
                // 'background-color': '#4caf50',
                'border-color': '#4caf50',
                // 'background-opacity': 0.6,
              },
            },
            {
              selector: '.lightBlue',
              style: {
                // 'background-color': '#03a9f4',
                'border-color': '#03a9f4',
                // 'background-opacity': 0.6,
              },
            },
            {
              selector: '.blue',
              style: {
                // 'background-color': '#2196f3',
                'border-color': '#2196f3',
                // 'background-opacity': 0.6,
              },
            },
            {
              selector: '.deepPurple',
              style: {
                // 'background-color': '#673ab7',
                'border-color': '#673ab7',
                // 'background-opacity': 0.6,
              },
            },
            {
              selector: '.purple',
              style: {
                // 'background-color': '#9c27b0',
                'border-color': '#9c27b0',
                // 'background-opacity': 0.6,
              },
            },
            {
              selector: '.bgBlack',
              style: {
                'background-color': 'white',
              },
            },
            {
              selector: '.bgBrown',
              style: {
                'background-color': brown[200],
              },
            },
            {
              selector: '.bgRed',
              style: {
                'background-color': red[200],
              },
            },
            {
              selector: '.bgOrange',
              style: {
                'background-color': orange[200],
              },
            },
            {
              selector: '.bgYellow',
              style: {
                'background-color': yellow[200],
              },
            },
            {
              selector: '.bgLightGreen',
              style: {
                'background-color': lightGreen[200],
              },
            },
            {
              selector: '.bgGreen',
              style: {
                'background-color': green[200],
              },
            },
            {
              selector: '.bgLightBlue',
              style: {
                'background-color': lightBlue[200],
              },
            },
            {
              selector: '.bgBlue',
              style: {
                'background-color': blue[200],
              },
            },
            {
              selector: '.bgDeepPurple',
              style: {
                'background-color': deepPurple[200],
              },
            },
            {
              selector: '.bgPurple',
              style: {
                'background-color': purple[200],
              },
            },
          ]}
          layout={{name: 'preset'}}
          cy={(cy) => {
            this.cy = cy;
          }}
          wheelSensitivity={0.5}
        />

      </div>
    );
  }
}

VisualizationPanelRelationWordTab.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
};
