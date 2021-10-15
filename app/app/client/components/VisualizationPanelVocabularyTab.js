/**
 * VisualizationPanelVocabularyTab.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';

import dagre from 'cytoscape-dagre';
import klay from 'cytoscape-klay';

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

import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import {observer} from 'mobx-react';

import Search from './Search';

Cytoscape.use(dagre);
Cytoscape.use(klay);

/**
 * Visualization screen panels vocabulary tab components
 * @extends React
 */
export default
@observer class VisualizationPanelVocabularyTab extends React.Component {
  /**
   * Constructor
   */
  constructor() {
    super();
    this.zoomTimeoutId = -1;
    this.updateElesTimeoutId = -1;
    // this.isUpdate = false;
    this.isReset = true;
  }

  /**
   * Post-mount processing
   * Graph information initialization
   */
  componentDidMount() {
    // console.log('didmount start');
    this.setUpListeners();
    this.updateElesClass();

    // Since the layout drawing of plug-in default is displayed momentarily, the layout drawing with the setting value is executed as the starting process.
    // this.initStyleForAllNodes();
    // this.layoutRun();

    const cy = this.cy;

    cy.minZoom(0.0025);
    cy.maxZoom(1.2);
    // console.log('didmount end');
  }

  /**
   * Update post-processing
   * Graph redraw process after update
   */
  componentDidUpdate() {
    this.updateElesClass();
    // console.log('didupdate');
  }

  /**
   * Update graph data
   */
  updateElesClass() {
    // console.log('updateElesClass start');
    if (this.updateElesTimeoutId > 0) {
      clearTimeout(this.updateElesTimeoutId);
      this.updateElesTimeoutId = -1;
    }

    // Suppress redundant update processing by consecutive occurrence of events.
    this.updateElesTimeoutId = setTimeout( () => {
      // console.log('updateElesClass inTimeout start');
      // console.log('[updateElesClass]');

      const cy = this.cy;

      // node Initialization
      this.initStyleForAllNodes();
      this.layoutRun();
      this.ajustSeparatingNode();
      this.adjustOverlappingNode();

      // Update layout
      const currentZoom = cy.zoom();
      const currentPan = cy.pan();
      // console.log('[currentZoom: ' + currentZoom +
      // '] [currentPan x: ' + currentPan.x + ', y: '+ currentPan.y + ']');


      if (this.isReset) {
        this.isReset = false;
        // At the first display, not the entire display, narrow down to a certain magnification.
        cy.zoom(0.8);
      } else {
        this.fitByPanZoom(currentPan, currentZoom);
      }

      this.onPanZoom();

      // this.isUpdate = true;
      // console.log('updateElesClass inTimeout end');
    }, 300);
  }

  /**
   * Pan, zoom reset notification by updating editing lexical data
   */
  doReset() {
    this.isReset = true;
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
          default: bgStyle = 'bgBlack'; break;
        }

        if (bgStyle) {
          eles.addClass(bgStyle);
        }
      }
    } else {
      eles.addClass('bgBlack');
    }
  }

  /**
   * [onPanZoom description]
   */
  onPanZoom() {
    if (this.zoomTimeoutId > 0) {
      clearTimeout(this.zoomTimeoutId);
      this.zoomTimeoutId = -1;
    }

    this.zoomTimeoutId = setTimeout( () => {
      // console.log('onPanZoom inTimeout start');
      // console.log('[onPanZoom]');
      const cy = this.cy;

      // List of nodes in view
      const ext = cy.extent();

      let nodesInView = cy.nodes().filter((n) => {
        const bb = n.boundingBox();
        // Show nodes if any are in the viewport range
        return bb.x1 > (ext.x1 - bb.w) &&
               bb.x2 < (ext.x2 + bb.w) &&
               bb.y1 > (ext.y1 - bb.h) &&
               bb.y2 < (ext.y2 + bb.h);
      });
      if (nodesInView.length == 0) {
        nodesInView = cy.nodes();
      }

      // get element near center
      const zoom = cy.zoom();
      const cpX = ( ext.x1 + ext.w / 2 ) / zoom;
      const cpY = ( ext.y1 + ext.h / 2 ) / zoom;
      let sortArr=[];
      nodesInView.map((n, index)=>{
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
          [...nodesInViewLimit100, nodesInView[data.index]];
      })

      this.initStyleByPanZoom();

      cy.batch(function() {
        nodesInViewLimit100.forEach((node)=>{
          node.addClass('showText');
        });
      });

      nodesInViewLimit100.forEach((node, index)=>{
        const eles = cy.$id(node.data().id);

        // Setting color information
        if (node.data().vocabularyColor) {
          eles.addClass(node.data().vocabularyColor);
        }

        // Setting of confirmation information
        this.setConfirmStyle(eles, node.data().confirm);
      });

      const currentNode = this.props.editingVocabulary.currentNode;
      if (currentNode.id) {
        const selectedele = cy.$id(currentNode.id);
        selectedele.addClass('selected');
        // cy.batch(function() {
        //   selectedele.addClass('showText').style('text-opacity', 1);
        // });
        selectedele.addClass('showText');
        // Setting of color information
        if (selectedele.data().vocabularyColor) {
          selectedele.addClass(selectedele.data().vocabularyColor);
        }

        // Setting of confirmation information
        this.setConfirmStyle(selectedele, selectedele.data().confirm);

        // Newly added terms may not appear in the view because their coordinate values remain at their initial values.
        // In that case, it can be forced into the view by showText.
        if (currentNode.broader_term) {
          const brdrTrmNode = cy.nodes().filter((n) => {
            return n.data().term == currentNode.broader_term;
          });
          if (brdrTrmNode.length > 0) {
            if (!brdrTrmNode.hasClass('showText')) {
              // console.log('addClass to ' + brdrTrmNode.data().term);
              // cy.batch(function() {
              //   brdrTrmNode.addClass('showText').style('text-opacity', 1);
              // });
              brdrTrmNode.addClass('showText');
              const eles = cy.$id(brdrTrmNode.data().id);
              // Setting of color information
              if (brdrTrmNode.data().vocabularyColor) {
                eles.addClass(brdrTrmNode.data().vocabularyColor);
              }

              // Setting of confirmation information
              this.setConfirmStyle(eles, brdrTrmNode.data().confirm);
            }
          }
        }
        if (currentNode.preferred_label) {
          const synonymNode = cy.nodes().filter((n) => {
            return n.data().preferred_label == currentNode.preferred_label &&
                   n.data().term != currentNode.term;
          });
          if (synonymNode.length > 0) {
            synonymNode.forEach((node) => {
              if (!node.hasClass('showText')) {
                // console.log('addClass to ' + node.data().term);
                // cy.batch(function() {
                //   node.addClass('showText').style('text-opacity', 1);
                // });
                node.addClass('showText');

                const eles = cy.$id(node.data().id);
                // Setting of color information
                if (node.data().vocabularyColor) {
                  eles.addClass(node.data().vocabularyColor);
                }

                // Setting of confirmation information
                this.setConfirmStyle(eles, node.data().confirm);
              }
            });
          }
        }
      }

      // updateElesClass update the layout again immediately after, as it is often unstable
      // if (this.isUpdate) {
      //   const currentZoom = cy.zoom();
      //   const currentPan = cy.pan();
      //
      //   this.layoutRun();
      //
      //   cy.zoom(currentZoom);
      //   cy.pan(currentPan);
      //
      //   this.ajustSeparatingNode();
      //   this.adjustOverlappingNode();
      //
      //   this.isUpdate = false;
      // }

      // cy.batch(function() {
      //   nodesInView.forEach((node) => {
      //     if (!node.hasClass('showText')) {
      //       // node.addClass('hiddenText');
      //       // node.removeClass('defaultNodeClass');
      //     }
      //   });
      // });
      // console.log('onPanZoom inTimeout end');
    }, 500);
  }

  /**
   * Correct overlapping nodes
   */
  adjustOverlappingNode() {
    // Position correction
    // Adjust node overlaps individually
    const nodes = this.cy.nodes();

    // Collects nodeLists located in the same row
    const sameLineList = [];
    nodes.forEach((node) => {
      // Extract the node that is co-located with the node
      const sameLine = nodes.filter((data) =>
        Math.trunc(data.position().y) == Math.trunc(node.position().y));

      let isNotFind = true;
      // The NodeList already added to sameLineList is duplicated, so do not add it
      sameLineList.forEach((list) => {
        const find = list.filter((data) =>
          data.data().term == node.data().term);
        if (find.length > 0) {
          isNotFind = false;
        }
      });
      if (isNotFind) {
        sameLineList.push(sameLine);
      }
    });

    // Correcting overlapping nodes
    sameLineList.forEach((list) => {
      let adjustFlg = false;
      do {
        adjustFlg = false;
        list.forEach((a) => {
          list.forEach((b) => {
            if (a.data().term != b.data().term) {
              const ax1 = a.boundingBox().x1;
              const ax2 = a.boundingBox().x2;
              const bx1 = b.boundingBox().x1;
              const bx2 = b.boundingBox().x2;

              // Adjusting b for nodes that have the following relationship
              // Adjusting pattern1
              //   | b |
              // | a |
              // ///////////
              // Adjusting pattern 2
              // |   b   |
              //   | a |
              if ((ax1 < bx1 && ax2 < bx2 && ax2 > (bx1 - 6)) ||
                  (ax1 > bx1 && ax2 < bx2)) {
                const adjust = ax2 - bx1;
                const newXpos = b.position().x + adjust + 12;
                // console.log('[adjustOverlappingNode] ' + b.data().term +
                //   '. x: ' + Math.trunc(b.position().x) +
                //   ' => ' + Math.trunc(newXpos));
                b.position('x', newXpos);
                adjustFlg = true;
              }
            }
          });
        });
      } while (adjustFlg);
    });
  }

  /**
   * Adjusting the distant nodes of narrower terms
   */
  ajustSeparatingNode() {
    // Correcting nodes too far
    const cy = this.cy;
    const nodes = cy.nodes();
    const edges = cy.edges();

    // Collected for each node with the same broader node
    const relatedList = [];
    nodes.forEach((node) => {
      // Get the narrower edge information
      const targetEdge = edges.filter((edge) =>
        edge.data().target == node.data().id);

      if (targetEdge.length > 0) {
        // Fetch edge with common broader Node
        const relatedEdges = edges.filter((edge) =>
          edge.data().source == targetEdge.data().source);

        // More than two edges with a common broader Node
        // Check nodes that need correction
        if (relatedEdges.length > 2) {
          const related = [];
          let isBottomLayer = true;
          // Adjust the narrowest node group
          relatedEdges.forEach((edge) => {
            const node = cy.$id(edge.data().target);
            related.push(node);
            if (node.connectedEdges().length > 1) {
              isBottomLayer = false;
            }
          });
          if (isBottomLayer) {
            relatedList.push(related);
          }
        }
      }
    });

    relatedList.forEach((list) => {
      list.sort((a, b) => {
        if (a.position().x < b.position().x) return -1;
        if (a.position().x > b.position().x) return 1;
        return 0;
      });

      list.forEach((a, index) => {
        if (index < (list.length - 1)) {
          const b = list[index + 1];
          if (Math.trunc(a.position().y) == Math.trunc(b.position().y)) {
            const ax2 = a.boundingBox().x2;
            const bx1 = b.boundingBox().x1;
            if ((bx1 - ax2) > 500) {
              const newXpos = a.position().x + (bx1 - ax2) - 30;
              // console.log('[ajustSeparatingNode] ' + a.data().term +
              //   '. x: ' + Math.trunc(a.position().x) +
              //   ' => ' + Math.trunc(newXpos));
              a.position('x', newXpos);
            }
          }
        }
      });
    });
  }

  /**
   * Execute layout update
   */
  layoutRun() {
    // console.log('[layoutRun]');

    /**
    // cytoscape-dagre
    const layout = this.cy.elements().layout({name: 'dagre'});
    // number of ranks to keep between the source and target of the edge
    layout.options.minLen = ( edge )=> {
      if (edge.data().type == 'broader_term') {
        return 1;
      } else {
        return 0;
      }
    };
    **/

    // /**
    // cytoscape-klay
    const layout = this.cy.elements().layout({name: 'klay'});
    // // A function that applies a transform to the final node position
    // layout.options.transform = ( node, pos ) => {
    //   let result = 0;
    //   for (let i=0; i< node.data().term.length; i++) {
    //     const chr = node.data().term.charCodeAt(i);
    //     if ((chr >= 0x00 && chr < 0x81) ||
    //         (chr === 0xf8f0) ||
    //         (chr >= 0xff61 && chr < 0xffa0) ||
    //         (chr >= 0xf8f1 && chr < 0xf8f4)) {
    //       // Add 1 for half-pitch characters
    //       result += 1;
    //     } else {
    //       // Add 2 for all other characters
    //       result += 2;
    //     }
    //   }
    //   if (result > 16) {
    //     // As klay's existing bug, the layout of a Node with a long string may overlap with an adjacent Node, so correct it
    //     pos.x = pos.x + (result * Math.pow((result - 20), 1/2));
    //   }
    //   return pos;
    // };
    // Overall direction of edges:
    // horizontal (right / left) or vertical (down / up)
    layout.options.klay.direction = 'DOWN';
    // The aimed aspect ratio of the drawing,
    // that is the quotient of width by height
    // default:1.6
    layout.options.klay.aspectRatio = 3.2;
    // Factor by which the usual spacing is
    // multiplied to determine the in-layer spacing between objects.
    // default: 1.0
    layout.options.klay.inLayerSpacingFactor = 3.0;
    // Whether the selected layouter should consider the full hierarchy
    layout.options.klay.layoutHierarchy = false;
    // Strategy for node layering.
    // default:NETWORK_SIMPLEX
    // param:NETWORK_SIMPLEX LONGEST_PATH INTERACTIVE
    layout.options.klay.nodeLayering = 'NETWORK_SIMPLEX';
    // Strategy for Node Placement
    // default:BRANDES_KOEPF
    // param:BRANDES_KOEPF LINEAR_SEGMENTS INTERACTIVE SIMPLE
    layout.options.klay.nodePlacement = 'BRANDES_KOEPF';
    // Seed used for pseudo-random number generators to control
    // the layout algorithm; 0 means a new seed is generated
    // default:1
    layout.options.klay.randomizationSeed = 1;
    // Whether each connected component should be processed separately
    // Whether to place nodes by complexity
    // default:true
    layout.options.klay.separateConnectedComponents = true;
    // Overall setting for the minimal
    // amount of space to be left between objects
    // default:20
    layout.options.klay.spacing = 20;
    // How much effort should be spent to produce a nice layout..
    // default:7
    layout.options.klay.thoroughness = 700;
    // **/

    // console.log('layout.run()');
    layout.run();
  }

  /**
   * Restore to pan, zoom before layoutRun
   * @param  {Object} pan  get cy.pan()
   * @param  {Object} zoom get cy.zoom()
   */
  fitByPanZoom(pan, zoom) {
    const cy = this.cy;
    cy.zoom(zoom);
    if (this.props.editingVocabulary.currentNode.id) {
      const selectedele = cy.$id(this.props.editingVocabulary.currentNode.id);
      selectedele.select();

      // Center selected eles
      cy.animate({
        center: {
          eles: selectedele,
        },
      }, {
        duration: 100,
      });
    } else {
      cy.pan(pan);
    }
  }

  /**
   * Event registration
   */
  setUpListeners() {
    this.cy.on('click', 'node', (event) => {
      const target = event.target.data();
      this.props.editingVocabulary.setCurrentNodeByTerm(target.term, target.id);
    });

    this.cy.on('pan', (event) => {
      this.onPanZoom();
    });

    this.cy.on('zoom', (event) => {
      this.onPanZoom();
    });
  }

  /**
   * Layout update process for vocabulary selection
   *
   * If a vocabulary is selected, center the selected vocabulary (pan) and update the Node syle
   * Update Node syle when vocabulary is broken
   */
  fitToCurrent() {
    const cy = this.cy;
    const currentZoom = cy.zoom();
    const currentPan = cy.pan();
    this.fitByPanZoom(currentPan, currentZoom);
    if (!this.props.editingVocabulary.currentNode.id) {
      this.onPanZoom();
    }
  }

  /**
   * File selection event
   * @param  {object} event - information of event
   */
  handleChange(event) {
    this.props.editingVocabulary.selectFile(event.target.value);
    if (event.target.value == 0) {
      this.props.editingVocabulary.setSelected(0, true);
      this.props.editingVocabulary.setSelected(1, false);
    } else {
      this.props.editingVocabulary.setSelected(0, true);
      this.props.editingVocabulary.setSelected(1, true);
    }

    this.cy.one('render', (event) => {
      setTimeout( () => {
        this.onPanZoom();
      }, 100);
    });
  };

  /**
   * Sytle initialization for node
   */
  initStyleForAllNodes() {
    const cy = this.cy;

    // Node initialization
    cy.batch(function() {
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
            'hiddenText',
            'defaultNodeClass',
          ],
      // ).addClass('defaultNodeClass')
      ).addClass('showText')
          // .style('text-opacity', 0)
          .unselect();

      // cy.nodes().addClass('defaultNodeClass');
      // cy.nodes().style('text-opacity', 0);

    // cy.nodes().unselect();
    });
  }

  /**
   * Sytle initialization for node
   */
  initStyleByPanZoom() {
    const cy = this.cy;

    // cy.startBatch();
    cy.batch(function() {
      cy.nodes().removeClass(
          [
            'defaultNodeClass',
            'selected',
            'showText',
            'hiddenText',
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
          ],
      ).removeStyle();
      // .addClass('defaultNodeClass');
      // .style('text-opacity', 0);
    });
    // cy.endBatch();
    // node initialization
    // cy.nodes().removeClass(
    //     [
    //       'defaultNodeClass',
    //       'selected',
    //       'showText',
    //       'hiddenText',
    //       'black',
    //       'brown',
    //       'red',
    //       'orange',
    //       'yellow',
    //       'lightGreen',
    //       'green',
    //       'lightBlue',
    //       'blue',
    //       'deepPurple',
    //       'purple',
    //       'bgBlack',
    //       'bgBrown',
    //       'bgRed',
    //       'bgOrange',
    //       'bgYellow',
    //       'bgLightGreen',
    //       'bgGreen',
    //       'bgLightBlue',
    //       'bgBlue',
    //       'bgDeepPurple',
    //       'bgPurple',
    //     ],
    // );
    // cy.nodes().removeStyle();
    // cy.nodes().addClass('defaultNodeClass');
    // cy.nodes().style('text-opacity', 0);
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const nodeList = this.props.editingVocabulary.termListForVocabulary;
    const edgesList = this.props.editingVocabulary.edgesList;
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
          <Grid item xs={4}>
            <Box>
              <FormControl className={this.props.classes.fileSelecter}>
                <Select
                  labelId="file-select-label"
                  id="file-select"
                  value={this.props.editingVocabulary.selectedFile.id}
                  onChange={(e) => this.handleChange(e)}
                >
                  <MenuItem value={0}>編集用語彙</MenuItem>
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

          cy={(cy) => {
            this.cy = cy;
          }}
          wheelSensitivity={0.5}
          elements={CytoscapeComponent.normalizeElements(
              {
                nodes: nodeList,
                edges: edgesList,
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
                'width': '6px',
                'height': '6px',
                // 'label': 'data(term)',
                // 'text-valign': 'center',
                // 'text-halign': 'center',
                // 'shape': 'rectangle',
                // 'width': 'label',
                // 'height': 'label',
                // 'text-background-opacity': 1,
                // 'text-background-color': '#E3E3E3',
                // 'text-background-color': 'white',
                // 'text-background-padding': '4px',
                // 'text-border-width': 1,
                // 'text-border-opacity': 1,
              },
            },
            {
              selector: '.showText',
              style: {
                'label': 'data(term)',
                'text-valign': 'center',
                'text-halign': 'center',
                'shape': 'rectangle',
                'width': 'label',
                'height': 'label',
                'text-background-opacity': 1,
                'text-background-color': 'white',
                'text-background-padding': '4px',
                'text-border-width': 1,
                'text-border-opacity': 1,
              },
            },
            {
              selector: '.hiddenText',
              style: {
                // 'color': 'black',
                // 'background-color': 'blue',
                // 'width': '6px',
                // 'height': '6px',
              },
            },
            {
              selector: '.defaultNodeClass',
              style: {
                // 'label': 'data(term)',
                // 'text-valign': 'center',
                // 'text-halign': 'center',
                // Preventing layout deviation by drawing node size equal to label (character) size in advance
                // Hide node by matching its background color to viewport
                'background-color': 'red',
                // 'shape': 'rectangle',
                // 'width': 'label',
                // 'height': 'label',
                // 'background-color': '#E3E3E3',
                // 'text-background-opacity': 1,
                // 'text-background-color': 'white',
                // 'text-background-padding': '4px',
                // 'text-border-width': 1,
                // 'text-border-opacity': 1,
              },
            },
            {
              selector: '.selected',
              style: {
                'z-index': 100,
                'text-border-width': 3,
              },
            },
            {
              selector: 'edge',
              style: {
                'width': 3,
                'curve-style': 'straight',
              },
            },
            {
              selector: 'edge[arrow]',
              style: {
                'source-arrow-shape': 'data(arrow)',
              },
            },
            {
              selector: '.broader_term',
              style: {
                'source-arrow-color': 'black',
                'line-color': 'black',
              },
            },
            {
              selector: '.synonym',
              style: {
                'line-color': 'grey',
                'line-style': 'dotted',
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
                'text-border-color': 'black',
              },
            },
            {
              selector: '.brown',
              style: {
                'text-border-color': '#795548',
              },
            },
            {
              selector: '.red',
              style: {
                'text-border-color': '#f44336',
              },
            },
            {
              selector: '.orange',
              style: {
                'text-border-color': '#ff9800',
              },
            },
            {
              selector: '.yellow',
              style: {
                'text-border-color': '#ffeb3b',
              },
            },
            {
              selector: '.lightGreen',
              style: {
                'text-border-color': '#8bc34a',
              },
            },
            {
              selector: '.green',
              style: {
                'text-border-color': '#4caf50',
              },
            },
            {
              selector: '.lightBlue',
              style: {
                'text-border-color': '#03a9f4',
              },
            },
            {
              selector: '.blue',
              style: {
                'text-border-color': '#2196f3',
              },
            },
            {
              selector: '.deepPurple',
              style: {
                'text-border-color': '#673ab7',
              },
            },
            {
              selector: '.purple',
              style: {
                'text-border-color': '#9c27b0',
              },
            },
            {
              selector: '.bgBlack',
              style: {
                'text-background-color': 'white',
              },
            },
            {
              selector: '.bgBrown',
              style: {
                'text-background-color': brown[200],
              },
            },
            {
              selector: '.bgRed',
              style: {
                'text-background-color': red[200],
              },
            },
            {
              selector: '.bgOrange',
              style: {
                'text-background-color': orange[200],
              },
            },
            {
              selector: '.bgYellow',
              style: {
                'text-background-color': yellow[200],
              },
            },
            {
              selector: '.bgLightGreen',
              style: {
                'text-background-color': lightGreen[200],
              },
            },
            {
              selector: '.bgGreen',
              style: {
                'text-background-color': green[200],
              },
            },
            {
              selector: '.bgLightBlue',
              style: {
                'text-background-color': lightBlue[200],
              },
            },
            {
              selector: '.bgBlue',
              style: {
                'text-background-color': blue[200],
              },
            },
            {
              selector: '.bgDeepPurple',
              style: {
                'text-background-color': deepPurple[200],
              },
            },
            {
              selector: '.bgPurple',
              style: {
                'text-background-color': purple[200],
              },
            },
          ]}
        />
      </div>
    );
  }
}

VisualizationPanelVocabularyTab.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
  selectFile: PropTypes.func,
};
