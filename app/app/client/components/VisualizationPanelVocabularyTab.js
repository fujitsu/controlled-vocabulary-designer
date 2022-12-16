/**
 * VisualizationPanelVocabularyTab.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';

import dagre from 'cytoscape-dagre';

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

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Popover from "@material-ui/core/Popover";
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import {observer} from 'mobx-react';

import ColorChartCheckBoxes from './ColorChartCheckBoxes';
import EditPanelVocabularyTab from './EditPanelVocabularyTab';
import DialogSettingSynonym from './DialogSettingSynonym';
import DialogOkCancel from './DialogOkCancel';
import DialogUpdateVocabularyError from './DialogUpdateVocabularyError';
import Search from './Search';
import html2canvas from "html2canvas";

Cytoscape.use(edgehandles);
Cytoscape.use(dagre);


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
    this.situationArr = [];
    this.message = '';
    this.source = null;
    this.target = null;

    this.state = { 
      anchorEl: false,            // Edit Panel togle
      anchorElColor: false,       // border color setting popover togle
      transformTogle: false,      // transform coordinate togle
      dlgTmpDelOpen: false,       // dialog for tmpData Delete confirm
      dlgSynonymOpen: false,      // dialog for Synonym term
      dlgBroaderOpen: false,      // dialog for Broader term confirm
      handleDisableButton: 0,     // disp buttons of dialog for Broader term error 
      dlgDeselectTermOpen: false, // dialog for deselect term confirm
      dlgLangDiffOpen: false,     // dialog for language diff error message
      dlgErrOpen: false,          // dialog for Error
      popBorderColorOpen: false,  // popover for border color setting
      reason: null,               // Reason for Error 
    };

    this.ehTop = null;      // edgehandles top   object
    this.ehLeft = null;     // edgehandles left  object
    this.ehRight = null;    // edgehandles tight object
    this.hitHandle = -1;    // handle Position [-1='not hit' / 1='top' / other='left or right' ]
  }

  /**
   * Post-mount processing
   * Graph information initialization
   */
  componentDidMount() {
    this.setUpListeners();
    this.updateElesClass();
    this.initEdgeHandles();
  }

  /**
   * Update post-processing
   * Graph redraw process after update
   */
  componentDidUpdate(prevProps, prevState) {
    
    this.setPanZoom();
    if (prevProps.editingVocabulary.editingVocabulary !== this.props.editingVocabulary.editingVocabulary) {
      this.updateElesClass();
    }else{     
      this.onPanZoom();
    }
    if( prevProps.fileLoadCount !== this.props.fileLoadCount ){
      this.situationArr.map((obj)=>{
        if(undefined !== obj){
          obj.bgImage = undefined;
        }
      })
      this.captureZoomImage(true);
    }else if( prevProps.fileId !== this.props.fileId){
      this.captureZoomImage();
    }
    this.dispCheckEdgeHandle();
  }

  /**
   * Scale drawing updates
   */
  moveZoomImageFrame( situationObj){
    const frame = document.getElementById("zoomFrame");
    if( situationObj === undefined || situationObj.iniPan === undefined || !frame){
      return;
    }
    const cZoom = this.cy.zoom();
    const cPan = this.cy.pan();
    const zoom = situationObj.iniZoom / cZoom;
    let left = (situationObj.iniPan.x - cPan.x*zoom) * 0.2;   // frame width 20%
    let top  = (situationObj.iniPan.y - cPan.y*zoom) * 0.2;

    frame.style.width= String( zoom * 100) + "%";
    frame.style.height= String( zoom * 100) + "%";
    frame.style.left= String( left) + "px";
    frame.style.top= String( top) + "px";
  }  

  /**
   * Scale drawing initialize
   * @param {Boolean} reset - true: must reset initialize viewport
   */
  captureZoomImage(reset=false){
    const fileId = this.props.editingVocabulary.selectedFile.id;
    const wrap = document.getElementById("zoomImgWrap");
    if(!wrap) return;

    if( !reset && undefined !== this.situationArr[ fileId] && undefined !== this.situationArr[ fileId].bgImage){
      wrap.style.backgroundImage = this.situationArr[ fileId].bgImage;
      this.moveZoomImageFrame( this.situationArr[ fileId]);
    }else{

      setTimeout( () => {
        html2canvas(document.getElementById("relation_term_graph_container")).then((canvas) => {
          const contentDataURL =  canvas.toDataURL("image/png");
          const bgImg = "url('" +contentDataURL + "')";
          wrap.style.backgroundImage = bgImg;
          if(  undefined !== this.situationArr[ fileId]){
            this.situationArr[ fileId].bgImage = bgImg;
          }
        });
        if( reset && undefined !== this.situationArr[ fileId]){
          const zoom = this.cy.zoom();
          const pan = this.cy.pan();
          this.situationArr[ fileId].iniPan={x: pan.x, y: pan.y};
          this.situationArr[ fileId].iniZoom = zoom;
        }
  
        this.moveZoomImageFrame( this.situationArr[ fileId]);
      }, 1000, this, fileId);
    }

  }

  /**
   * Set initial values for zoom and pan
   */
  async setIniPanZoom(){
    const cy = this.cy;

    await cy.fit(cy.nodes ,50);
    let currentZoom = await cy.zoom();
    currentZoom =  await currentZoom>2.0?2.0:currentZoom;
    await cy.zoom(currentZoom);
    await cy.center();
    const iniPan = await cy.pan();

    const fileId = this.props.editingVocabulary.selectedFile.id;
    this.situationArr[ fileId] = {
      pan: {x: iniPan.x, y: iniPan.y}, 
      zoom: currentZoom,
      iniPan: {x: iniPan.x, y: iniPan.y},
      iniZoom: currentZoom,
      bgImage: undefined,
    }
  }

  /**
   * Update graph data
   */
  updateElesClass() {

    // Suppress redundant update processing by consecutive occurrence of events.
    // node Initialization
    this.initStyleForAllNodes();
    const layout = this.cy.layout({name: 'preset'});
    layout.run();

    this.onPanZoom();
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
          case 'white': bgStyle = 'bgWhite'; break;
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
          default: bgStyle = 'bgGreen'; break;
        }

        if (bgStyle) {
          eles.addClass(bgStyle);
        }
      }
    } else {
      eles.addClass('bgWhite');
    }
  }

  /**
   * pan & zoom setting
   * 
   */
  setPanZoom() {
    const cy = this.cy;
    
    // provisional processing
    cy.minZoom(0.002);
    cy.maxZoom(1.2);

    const fileId = this.props.editingVocabulary.selectedFile.id;
    if( undefined == this.situationArr[ fileId]){
      this.setIniPanZoom();
    }else{
      cy.viewport({zoom: this.situationArr[ fileId].zoom, pan: this.situationArr[ fileId].pan});
    }
  }

  /**
   * [onPanZoom description]
   */
  onPanZoom() {
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

      // excluding edgehandle 
      if( n.hasClass('eh-handle')){ 
        return;
      }
      const bb = n.boundingBox();
      sortArr = [...sortArr, {
        'index': index,
        'distance': Math.abs( bb.x1 / zoom - cpX ) + Math.abs( bb.y1 / zoom - cpY )
      }]
    })

    const dispNodeMax = this.props.editingVocabulary.DISP_NODE_MAX;
    sortArr.sort((a, b)=> { return a.distance - b.distance; });
    if( sortArr.length > dispNodeMax ) sortArr.splice( dispNodeMax);

    // 100 visibleNodesInView
    let nodesInViewLimit100 = [];
    sortArr.forEach((data)=>{
      nodesInViewLimit100 =
        [...nodesInViewLimit100, nodesInView[data.index]];
    })

    this.initStyleByPanZoom();

    // term point size adjustment
    nodesInView.style({
      "width": 5.0/zoom,
      "height": 5.0/zoom,
    });

    // edges line width adjustment
    const edges = cy.edges();
    edges.style({
      "width": 5.0/zoom,
    });
    
    const nodeInViewStyle = {
      'width':(node) => { return (this.bytes(node.data('term')) * 7)/zoom },   
      'height': 20.0/zoom,
      'font-size': 16/zoom,
      'border-width': 2.0/zoom,
      'padding': 10.0/zoom,
    };
    nodesInViewLimit100.forEach((node, index)=>{
      const eles = cy.$id(node.data().id);
      
      // Adjust term size ↓ but Causes of color settings not working 
      node.style(nodeInViewStyle);

      node.addClass('showText');
      // Setting color information
      if (node.data().vocabularyColor) {
        eles.addClass(node.data().vocabularyColor);
      }

      // Setting of confirmation information
      this.setConfirmStyle(eles, node.data().confirm);
    });
    const selectTermList = this.props.editingVocabulary.selectedIdList;
    selectTermList.forEach((id, index)=>{
      this.changeSelectedTermColor(id);
    });
    const currentNode = this.props.editingVocabulary.currentNode;
    if (currentNode.id) {
      const selectedele = cy.$id(currentNode.id);
      selectedele.addClass('selected');
      selectedele.addClass('showText');
      // Setting of color information
      if (selectedele.data() !== undefined && selectedele.data().vocabularyColor) {
        selectedele.addClass(selectedele.data().vocabularyColor);
      }

      // Setting of confirmation information
      if (selectedele.data() !== undefined && selectedele.data().confirm) {    
        this.setConfirmStyle(selectedele, selectedele.data().confirm);
      }
    }

    // Hide inactive handles 
    this.hideHandlePostion();
  }
  bytes( str) {
    return encodeURIComponent(str).replace(/%../g,"x").length;
  }
  changeSelectedTermColor(id, isAddTerm=true){

    const cy = this.cy;    
    const zoom = cy.zoom();
    const bdrWidth = (isAddTerm?4.0:2.0)/zoom;
    const nodeSelectedStyle = {        
      'width':(node) => { return (this.bytes(node.data('term')) * 7)/zoom },
      'height': 20.0/zoom,
      'border-width': bdrWidth,
      'font-size': 16/zoom,
      'padding': 10.0/zoom,
      'shape': 'rectangle',      
    };
    const eles = cy.$id(id);
    eles.style(nodeSelectedStyle);
    eles.addClass('showText');
    // Setting color information
    const elsData = eles.data();
    if (undefined !== elsData) {
      if (undefined !== elsData.vocabularyColor) {
        eles.addClass(elsData.vocabularyColor);
      }
      // Setting of confirmation information
      this.setConfirmStyle(eles, elsData.confirm);
    }
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
   * init EdgeHandles
   */
  initEdgeHandles(){
    if( this.props.editingVocabulary.selectedFile.id !== 0){
      return;
    }    
    if( this.ehTop && this.ehLeft && this.ehRight){
      return;
    }
    const cy = this.cy;
    // the default values of each option are outlined below:
    let defaults ={
      preview: false, // whether to show added edges preview before releasing selection
      handleNodes: 'node.showText', // selector/filter function for whether edges can be made from a given node
      snap: false, // when enabled, the edge can be drawn by just moving close to a target node
      noEdgeEventsInDraw: false, // set events:no to edges during draws, prevents mouseouts on compounds
      handlePosition:  'middle top',// sets the position of the handle in the format of 'X-AXIS Y-AXIS' such as 'left top', 'middle top'
      edgeType: function (sourceNode, targetNode) {
        return 'flat';
      },
    };

    defaults.handlePosition = 'middle top';
    this.ehTop = cy.edgehandles( defaults);

    defaults.handlePosition = 'left middle';
    this.ehLeft = cy.edgehandles( defaults);
    
    defaults.handlePosition = 'right middle ';
    this.ehRight = cy.edgehandles( defaults);
    
    this.setUpListenersEdgeHandles();
  }

  /**
   * Deselect all nodes in cytoscape
   *
   * Called from EdithingVocablary.js 
   */
  cyDeselect(){
    this.cy.nodes().unselect();
  }

  /**
   * Event registration
   */
  setUpListeners() {
    this.cy.on('dragfreeon', 'node', (event) => {
      const idSet = new Set();
      if(event.target.id()){
        idSet.add(Number(event.target.id()));
      }
      this.props.editingVocabulary.selectedIdListGUIStr.forEach((id1)=>{
        idSet.add(Number(id1));
      }, this);
      this.updateVocabularies([...idSet], true);
    });
    
    this.cy.on('select', 'node', (event) => {
      // add selected list
      this.props.editingVocabulary.selectedIdListGUIStr.push(event.target.id());
    });
    this.cy.on('unselect', 'node', (event) => {
      // remove from selected list
      this.props.editingVocabulary.selectedIdListGUIStr = this.props.editingVocabulary.selectedIdListGUIStr.filter((id)=>{return id !== event.target.id()});
    });

    this.cy.on('tap',  (event) => {
      if( event.target === this.cy ){
        this.props.editingVocabulary.currentNodeClear();
        this.props.editingVocabulary.tmpDataClear();
        this.props.editingVocabulary.deselectTermList();
      }
    });

    this.cy.on('click', 'node', (event) => {
      
      // excluding edgehandle 
      if( event.target.hasClass('eh-handle')){ 
        return;
      }
      const target = event.target.data();
      const findObj = this.props.editingVocabulary.editingVocWithId.get(Number(target.id));
      console.log('--[ event - data(cy) - data(react) ]-- term:'+target.term+' zoom:'+this.cy.zoom(),event, target, findObj);

      // other vocabulary node
      if(target.external_voc){ 
        return;
      }

      let isAddTerm=false;
      const withKey = event.originalEvent.ctrlKey|| event.originalEvent.shiftKey;
      if( !withKey){
        if( this.props.editingVocabulary.selectedIdList.length > 1){
          this.props.editingVocabulary.deselectTermList();
          isAddTerm = this.props.editingVocabulary.setSelectedIdList(target);
          this.props.editingVocabulary.setCurrentNodeById(Number(target.id), true);
        }else{
          this.props.editingVocabulary.deselectTermList();
          if(this.props.editingVocabulary.currentNode.id !=  target.id){
            isAddTerm = this.props.editingVocabulary.setSelectedIdList(target);
          }
          this.props.editingVocabulary.setCurrentNodeById(Number(target.id));
        }
      }else{
        isAddTerm = this.props.editingVocabulary.setSelectedIdList(target);
        if(isAddTerm && this.props.editingVocabulary.selectedIdList.length == 1){
          this.props.editingVocabulary.setCurrentNodeById(Number(target.id));
        }else if(!isAddTerm && this.props.editingVocabulary.selectedIdList.length > 0){
          this.props.editingVocabulary.setCurrentNodeById(Number(this.props.editingVocabulary.selectedIdList[0]), true);
        }else if(!isAddTerm && this.props.editingVocabulary.selectedIdList.length == 0){
          this.props.editingVocabulary.setCurrentNodeById(Number(target.id));
        }
      }
      this.changeSelectedTermColor(target.id, isAddTerm);
    });

    this.cy.on('pan', (event) => {
      const fileId = this.props.editingVocabulary.selectedFile.id;
      if(undefined === this.situationArr[ fileId]){
        this.situationArr[ fileId] = {
          pan: undefined,
          zoom: undefined,
          iniPan: undefined,
          iniZoom: undefined,
          bgImage: undefined,
        }
      }
      const pan = this.cy.pan();
      const p ={
        x: pan.x, 
        y: pan.y
      };
      this.situationArr[ fileId].pan= p;
      this.onPanZoom();
    });

    this.cy.on('zoom', (event) => {
      const fileId = this.props.editingVocabulary.selectedFile.id;
      if(undefined === this.situationArr[ fileId]){
        this.situationArr[ fileId] = {
          pan:undefined, 
          zoom:undefined,
          iniPan: undefined,
          iniZoom: undefined,
          bgImage: undefined,
        }
      }
      const zoom = Number( this.cy.zoom());
      this.situationArr[ fileId].zoom = zoom;
      this.onPanZoom();
      event.preventDefault();
    });

    this.cy.on('layoutstop', (event) => {
      this.captureZoomImage();      // zoom scale background image capture
    }); 
    this.cy.on('resize', (event) => {
      //this.captureZoomImage( true); // zoom scale background image capture
      this.captureZoomImage( ); // zoom scale background image capture
    }); 
    this.cy.on('viewport', (event) => { 
      this.moveZoomImageFrame( this.situationArr[ this.props.editingVocabulary.selectedFile.id]);
    });
  }

  /**
   * Event registration edgeHandles
   */
  setUpListenersEdgeHandles() {
    this.cy.removeListener('ehcomplete');
    this.cy.on('ehcomplete', (event, sourceNode, targetNode, addedEdge) => {
      
      // You need to remove addedgede as Cytoscape will draw a line.
      addedEdge.remove();

      // other vocabulary node
      if(targetNode.data().external_voc){ 
        event.stopPropagation()
        return false;
      }

      this.source = sourceNode.data();
      this.target = targetNode.data();

      if( this.hitHandle == 1){
        let _disableButton = this.state.handleDisableButton;
        this.message = '「'+sourceNode.data().term +'」　の上位語に 「'+targetNode.data().term +'」 を設定します。\nよろしいですか？';
        _disableButton = 0;// OK & CANCEL buttons
        this.setState({handleDisableButton: _disableButton,dlgBroaderOpen: true});   
      } else{        
        this.setState({dlgSynonymOpen: true});   
      }
    });

    this.cy.removeListener('ehstop');
    this.cy.on('ehstop', (event, sourceNode) => {
      this.hideHandlePostion();
    });

    this.cy.removeListener('ehstart');
    this.cy.on('ehstart', (event, sourceNode) => {

      if( this.ehTop.handleNode!== undefined && !this.ehTop.handleNode.active()){
        this.ehTop.disable();
        this.ehTop.handleNode.style('opacity','0');
      }
      if( this.ehLeft.handleNode!== undefined && !this.ehLeft.handleNode.active()){
        this.ehLeft.disable();
        this.ehLeft.handleNode.style('opacity','0');
      }
      if( this.ehRight.handleNode!== undefined && !this.ehRight.handleNode.active()){
        this.ehRight.disable();
        this.ehRight.handleNode.style('opacity','0');
      }

      let cnt=0;
      const intervalId = setInterval(()=>{
        
        if(++cnt > 5) clearInterval(intervalId);
        const cy = this.cy;
        let ghostedges = cy.elements('.eh-ghost-edge');
        const val = 5.0/cy.zoom();
        if( ghostedges.length > 0){
          
          if( this.ehTop.handleNode!== undefined && this.ehTop.handleNode.active()){
            this.hitHandle = 1;
            ghostedges.style({
              'width': val,
              'line-color': 'yellow',
              'line-style': 'solid',
              'target-arrow-shape': 'vee',
              'target-arrow-color': 'yellow',
              'curve-style': 'straight',
            });
          }else{
            this.hitHandle = 0;
            ghostedges.style({
              'width': val,
              'line-color': 'blue',
              'line-style': 'solid',
              'target-arrow-shape': 'none',
              'target-arrow-color': '',
              'curve-style': 'straight',
            });
          }
          clearInterval(intervalId);
        }
      },50);
    });

    this.cy.removeListener('ehshow');
    this.cy.on('ehshow', (event, sourceNode) => {

      // other vocabulary node
      const dt = sourceNode.data();
      if(dt.external_voc){ 
        this.hideHandlePostion();
        return;
      }

      const cy = this.cy;
      
      let handles = cy.elements('.eh-handle');
      const val = 15.0/cy.zoom();
        
      if( handles.length > 0){
        handles.style({
          'background-color': 'royalblue',
          'width': val,
          'height': val,
          'opacity': 1,
        });
      }
      
      if( this.ehTop.handleNode !== undefined && this.ehTop.handleNode.length > 0){
        this.ehTop.handleNode.style({
          'background-color': 'lightsteelblue',
          'shape': 'triangle',
          'width': val * 1.5,
          'height': val * 1.5,
        });
      }        
    });
  }

  /**
   * Hide inactive handles 
   * 
   * ・ It is necessary to hide the debris of the handle point when zooming and panning.
   * ・ The timing that can be displayed could only be found in "ehshow event" 
   * ・ If "display: element" is set in "ehshow event", an infinite loop will occur.
   *    -Switching between display and non-display with "opacity: 0/1" 
   */ 
  hideHandlePostion(){

    if( this.ehTop){
      if( this.ehTop.handleNode !== undefined) this.ehTop.handleNode.style('opacity','0');
      this.ehTop.enable();
    }
    if( this.ehLeft){
      if( this.ehLeft.handleNode !== undefined) this.ehLeft.handleNode.style('opacity','0');
      this.ehLeft.enable();
    }
    if( this.ehRight){
      if( this.ehRight.handleNode !== undefined) this.ehRight.handleNode.style('opacity','0');
      this.ehRight.enable();
    }
  }

  /**
   * Check if edge handles display 
   */
  dispCheckEdgeHandle(){

    if( this.props.editingVocabulary.selectedFile.id === 0){  
            
      this.initEdgeHandles();      
    }else{
      if(this.ehTop){
        this.ehTop.destroy();
        this.ehTop = null;
      } 
      if(this.ehLeft){
        this.ehLeft.destroy();
        this.ehLeft = null;
      } 
      if(this.ehRight){
        this.ehRight.destroy();
        this.ehRight = null;
      } 


      
    }
  }

  /**
   * Set BroaderTerm 
   * 
   */
  setBroaderTerm(){

    const source = this.source;

    this.props.editingVocabulary.deselectTermList();
    this.props.editingVocabulary.setSelectedIdList(source);
    this.props.editingVocabulary.setCurrentNodeById(Number(source.id), true);
    const targetObj = this.props.editingVocabulary.editingVocWithId.get(Number(this.target.id));

    this.props.editingVocabulary.updateBroaderTerm( [ targetObj.term ], targetObj.language, targetObj.uri);

    const ret = this.props.editingVocabulary.updateVocabulary(null, 111);
    if (ret !== null) {
      this.setState({dlgErrOpen: true, reason : ret});  
    }
  }

  /**
  * Initialization of array storing zoom and pan for each file 
  *
  * Called from EdithingVocablary.js 
  */
  situationArrReset( num=-1){
    if( num === -1){
      this.situationArr = [];
    }else{
      this.situationArr[ num] = undefined;
    }
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
   * Fit the panel to display all cytoscape nodes
   * Called from EdithingVocablary.js 
   */
  fitToVisualArea() {
    const cy = this.cy;
    cy.fit(cy.nodes,50 );
  }

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
            'bgWhite',
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
      ).addClass('showText')
          .unselect();
    });
  }

  /**
   * Sytle initialization for node
   */
  initStyleByPanZoom() {
    const cy = this.cy;

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
            'bgWhite',
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
    });
  }

  /**
   * save root position for coordinate transform 
   */
  getSaveRoot(){
    const cy = this.cy;

    const nodes = cy.nodes();
    const edges = cy.edges();

    nodes.lock();

    edges.forEach((edge) => {

      const snd = cy.$id(edge.data().source);
      const tnd = cy.$id(edge.data().target);

      snd.unlock();
      tnd.unlock();      
    });

    // get roots
    const sources = edges.sources();
    const targets = edges.targets();

    const roots = sources.filter((source,i)=>{
      const hits = targets.filter((target) =>{
        return source.data().term == target.data().term;
      });
      return hits.length?false:true;
    });

    // save roots data [ id & all connected elements & position ]
    let saveRoots = [];
    roots.forEach((node,i) => {
      const id =node.data().id;
      const suc =node.successors();
      const posi = node.position();
      
      saveRoots = [...saveRoots, {id:id,successors :suc ,pos:{x:posi.x, y:posi.y}} ];
    });

    return saveRoots;
  }

  /**
   * coordinate transform
   */
  async coordinateTransform(){
    const cy = this.cy;
  
    const saveRoots = await this.getSaveRoot();

    if( !saveRoots || 1 > saveRoots.length){
      return;
    }

    // [ dagre ] layout options
    const defaults={      
      name: "dagre",
      fit:false,
      nodeDimensionsIncludeLabels:true,
      rankDir: "TB",
      ranker: "longest-path", 

      stop: (function (e) {
        // const cy = e.cy;
        saveRoots.forEach((nd,i) => {
          
          const fromPosi = nd.pos;

          const toNode = cy.$id(nd.id)
          const toPosi = toNode.position();
          
          const diffX = fromPosi.x-toPosi.x;
          const diffY = fromPosi.y-toPosi.y;

          toNode.position({x:toPosi.x + diffX, y:toPosi.y - diffY});

          nd.successors.forEach((suc,j) => {
            
            if(suc.group() =="nodes"){
              const posi = suc.position();
              suc.position({x:posi.x + diffX, y:posi.y - diffY});
            }
          });
        });
      }),
    }

    // get all ids
    const idList = [];//number
    cy.nodes().forEach((node1)=>{
      if(undefined !== node1.data().term){ // there may exist several unknown nodes
        idList.push(Number(node1.id()));
      }
    }, this);

    // Extend the minimum length of edge 
    // const zoom = cy.zoom();
    // if( zoom > 0.007){
    //   const thisLen = parseInt(1 / zoom);
    //   defaults.minLen = thisLen;
    // }
    
    await cy.elements().layout( defaults).run();
    
    await this.updateVocabularies(idList);
    
    await cy.nodes().unlock();

    await this.fitToVisualArea();
  }
  
  /**
   * Update coordinate transform
   * @param {List} idList ids (list of numbers) to be update
   * @param {bool} isDrag is this operation occur from drag of terms
   */
  async updateVocabularies(idList,  isDrag=false) {
    const saveCurrentNodeId = await this.props.editingVocabulary.currentNode.id;
    
    const ret = await this.props.editingVocabulary.updateVocabularies( this.cy, idList, isDrag);

    if( saveCurrentNodeId && saveCurrentNodeId !== this.props.editingVocabulary.currentNode.id){
      await this.props.editingVocabulary.setCurrentNodeById(saveCurrentNodeId);
    }
  }
  
  /**
   * deselection term
   */
   async deselectionConfirm(){

      const selectedIdList = this.props.editingVocabulary.selectedIdList;

      for (let num in selectedIdList) {
        const id = selectedIdList[num];
        await this.changeSelectedTermColor(id, false);
      }
      // currentNode clear
      await this.props.editingVocabulary.deselectTermList();       
      await this.props.editingVocabulary.currentNodeClear();
      await this.props.editingVocabulary.tmpDataClear();
  }
  /**
   * When setting a synonym, select a Preferred term and then close the dialog 
   */
  handleClose( ret){
    this.setState({dlgSynonymOpen: false});
    
    if(ret ==='cancel'){
      // dialog return cancel click
      this.props.editingVocabulary.currentNodeClear();
      this.props.editingVocabulary.tmpDataClear();
      this.props.editingVocabulary.deselectTermList();

    }else if(ret !== null){
      // updateVocabulary() return error reason
      this.setState({dlgErrOpen: true, reason : ret});  
    }
  }

  /**
   * Close the confirmation dialog and set the Broader term
   */
  handleBroaderClose(){
    this.message = '';

    this.setState({dlgBroaderOpen: false});
    if( this.state.handleDisableButton !== 1){
      this.setBroaderTerm(); 
    }
    this.setState({handleDisableButton: 0});// OK & CANCEL buttons
  }

  /**
   * Close the confirmation dialog and do not set the Broader term
   */
  handleBroaderCancelClose(){
    this.message = '';
    this.setState({ 
      handleDisableButton: 0,   // OK & CANCEL buttons
      dlgBroaderOpen: false
    });
  }

  /**
   * close error dialog 
   */
  handleErrClose(){
    this.setState({dlgErrOpen: false, reason: null});   
  }

  /**
   * All selection cancellation dialog open 
   */
  handleDeselectTermOpen(){
    this.message = "用語の選択を解除します。\nよろしいですか？";
    this.setState({dlgDeselectTermOpen: true});  
  }

  /**
   * All selection cancellation dialog close
   */
  handleDeselectTermClose(){
    this.message = '';
    this.setState({dlgDeselectTermOpen: false});
    
    this.deselectionConfirm();
  }

  /**
   * Border Color change dialog open 
   */
   handleBorderColorPopOpen(e){
    this.setState({anchorElColor: this.state.anchorElColor ? null : e.currentTarget});
  }

  /**
   * Border Color change dialog close
   */
  handleBorderColorPopClose(){
    this.setState({anchorElColor: false});
  }

  /**
   * All selection cancellation dialog Cancel
   */
  handleDeselectTermCancelClose(){
    this.message = '';
    this.setState({dlgDeselectTermOpen: false});
  }



  /**
   * All language diff  error dialog close
   */
   handleLangDiffClose(){
    this.message = '';
    this.setState({dlgLangDiffOpen: false});
  }

  /**
   * Edit popover open
   */
  handleEditPopoverOpen(e){
    this.setState({anchorEl: this.state.anchorEl ? null : e.currentTarget});
  }

  /**
   * Edit popover Close
   */
  handleEditPopoverClose(saved=false){

    const ret = this.props.editingVocabulary.getNodesStateChanged;
    if( !saved && ( ret['ja'] || ret['en'] ) ){
      this.message='編集中のデータを破棄して用語選択を実行します。\n\nよろしいですか？';
      this.setState({ dlgTmpDelOpen: true});
    }else{
      this.setState({ anchorEl: null});
    }
  }

  /**
   * Edit data delete popover ok Close
   */
  handleTmpDelClose(){
    this.message = '';    
    this.props.editingVocabulary.tmpDataClear();
    this.setState({ anchorEl: null, dlgTmpDelOpen: false});
  }
  
  /**
   * Edit data delete popover Cancel
   */
   handleTmpDelCancelClose(){
    this.message = '';
    this.setState({ dlgTmpDelOpen: false});
  }  


  /**
   * Confirm switch
   * @param  {Boolean} isConfirm - confirm acceptance
   */
   toggleConfirm(isConfirm) {
    // console.log('[toggleConfirm] change to ' + isConfirm);
    const currentNode = this.props.editingVocabulary.currentNode;

    this.props.editingVocabulary.toggleConfirmById(currentNode.id, isConfirm);
    if (!isConfirm) {
      // In the case of a term without a preferred label, supplement the preferred label column when the term is unfixed.
      if (!currentNode.preferred_label) {
        this.props.editingVocabulary.
            tmpPreferredLabel.list[this.props.editingVocabulary.tmpLanguage.value].push(currentNode.term);
      }
    }
  }

  /**
   * render
   * @return {element}
   */
  render() {
    const editingVocabulary = this.props.editingVocabulary;

    const nodeList = editingVocabulary.termListForVocabulary;
    const edgesList = editingVocabulary.edgesListId;
    const disabledDeselectConfirm = editingVocabulary.selectedIdList.length > 0 ? false : true;
    const disabledBorderConfirm = editingVocabulary.selectedFile.id !== 0 ? true : disabledDeselectConfirm;
    const transformTogle = this.state.transformTogle;
    const anchorEl = this.state.anchorEl;
    const open = Boolean(anchorEl);
    const id = open ? "popover" : undefined;
    const anchorElColor = this.state.anchorElColor;
    const openColor = Boolean(anchorElColor);
    const idColor = openColor ? "popover-color" : undefined;
    const editButtondisabled = editingVocabulary.currentNode.term ? true : false;
    const editButtonsDisableSwitchByFile  = editingVocabulary.selectedFile.id !== 0 ? true : false;

    // for Confirm Button
    let fileId = editingVocabulary.selectedFile.id;
    // Change border color disabled
    let disabledColor = true;
    if ( fileId == 0 && editingVocabulary.currentNode.id) {
      // Allow each component to operate during editing vocabulary selection and term selection
      disabledColor = false;
    }

    // Firm button disabled condition
    const disabledConfirm = disabledColor;

    const confirmed = editingVocabulary.currentNode.confirm;
    let isConfirm = false;
    if (confirmed && confirmed == 1) {
      isConfirm = true;
    }

    // Disabled determination of TextField area
    // Undetermined while selecting a term when editing vocabulary pulldown is selected:enabled
    // No term selected when selecting vocabulary pull-down for editing:enabled
    const disabledTextField =
     ( !isConfirm && editingVocabulary.currentNode.id) ||
       ( !editingVocabulary.currentNode.id) ? false : true;

    // Fix button text
    let confirmButtonText = '確定';
    if (disabledTextField) {
      confirmButtonText = '確定解除';
    }

    return (
      <div>
        <Grid
          container
          spacing={2}
          justifyContent={'space-between'}
          className={this.props.classes.visualizationVocabularyHead}
        >
          <Grid item>
            <Box>
              <Button
                className={this.props.classes.buttons}
                ml={3}
                variant="contained"
                color="primary"
                size={'small'}
                disabled={transformTogle}
                onClick={()=>this.coordinateTransform()}
              >
              {transformTogle ? "座標変換済み" : "座標変換"}
              </Button>
              <Button
                className={this.props.classes.buttons}
                ml={3}
                variant="contained"
                color="primary"
                size={'small'}
                disabled={disabledDeselectConfirm}
                onClick={()=>this.handleDeselectTermOpen()}
              >
                選択全解除
              </Button>
              <Button
                className={this.props.classes.buttons}
                ml={3}
                variant="contained"
                color="primary"
                size={'small'}
                disabled={disabledBorderConfirm}
                onClick={(e)=>this.handleBorderColorPopOpen(e)}
              >
                枠線色変更
              </Button>
              <Popover 

                id={idColor}
                open={openColor}
                anchorEl={anchorElColor}
                onClose={()=>this.handleBorderColorPopClose()}
                style={{
                  backgroundColor: "#66666680",
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <ColorChartCheckBoxes
                  editingVocabulary={this.props.editingVocabulary}
                  colorId="color1"
                  disabled={disabledColor}
                  close={()=>this.handleBorderColorPopClose()}
                />
              </Popover>
              <Button
                className={this.props.classes.buttonsGrp}
                ml={3}
                variant="contained"
                color="primary"
                size={'small'}
                disabled={disabledConfirm}
                onClick={()=>this.toggleConfirm(!isConfirm)}
              >
                {confirmButtonText}
              
              </Button>       
            </Box>
          </Grid>
          <Grid item>
            <Grid container spacing={0}>
              <Grid item>
                <Search
                  classes={this.props.classes}
                  editingVocabulary={this.props.editingVocabulary}
                />
              </Grid>
              <Grid item>
                <Button
                  className={this.props.classes.buttons}
                  style={{
                    marginLeft: "10px",
                  }}
                  ml={3}
                  variant="contained"
                  color="primary"
                  size={'small'}
                  disabled={ !editButtondisabled || editButtonsDisableSwitchByFile}
                  onClick={(e)=>this.handleEditPopoverOpen(e)}
                >
                  編集
                </Button>
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  anchorReference="anchorPosition"
                  anchorPosition={{ top: 1000, left: 1200 }}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left"
                  }}
                  transformOrigin={{
                    vertical: "bottom",
                    horizontal: "left"
                  }}
                  classes={{
                    root: this.props.classes.popoverPanelRoot,
                    paper: this.props.classes.popoverPanelpaper,
                  }}
                >
                  <Typography className={this.props.classes.popoverTitle}>
                    編集
                    {this.handleEditPopoverClose ? (
                      <IconButton
                        aria-label="close"
                        className={this.props.classes.popoverTitleCloseButton}
                        onClick={() => this.handleEditPopoverClose()}
                      >
                        <CloseIcon />
                      </IconButton>
                    ) : null}
                  </Typography>
                  <EditPanelVocabularyTab
                    classes={this.props.classes}
                    editingVocabulary={this.props.editingVocabulary}
                    close={this.handleEditPopoverClose.bind(this)}
                  />
                </Popover>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <DialogSettingSynonym
          onClose={this.handleClose.bind(this)}  
          open={this.state.dlgSynonymOpen}
          editingVocabulary={this.props.editingVocabulary}
          classes={this.props.classes}
          source={this.source}
          target={this.target}
        />
        <DialogOkCancel
          onOkClose={() => this.handleTmpDelClose()}
          onCancel={() =>this.handleTmpDelCancelClose()}  
          open={this.state.dlgTmpDelOpen}
          classes={this.props.classes}
          message={this.message}
        />
        <DialogOkCancel
          onOkClose={() => this.handleBroaderClose()}
          onCancel={() =>this.handleBroaderCancelClose()}  
          buttonsDisable={ this.state.handleDisableButton}
          open={this.state.dlgBroaderOpen}
          classes={this.props.classes}
          message={this.message}
        />
        <DialogOkCancel
          onOkClose={() => this.handleDeselectTermClose()}
          onCancel={() =>this.handleDeselectTermCancelClose()}  
          open={this.state.dlgDeselectTermOpen}
          classes={this.props.classes}
          message={this.message}
        />
        <DialogOkCancel
          onOkClose={() => this.handleLangDiffClose()}
          onCancel={() =>this.handleLangDiffClose()}  
          buttonsDisable={ 1}
          open={this.state.dlgLangDiffOpen}
          classes={this.props.classes}
          message={this.message}
        />

        <DialogUpdateVocabularyError
          onClose={() => this.handleErrClose()}
          open={this.state.dlgErrOpen}
          classes={this.props.classes}
          editingVocabulary={this.props.editingVocabulary}
          isFromEditPanel={false}
          reason={this.state.reason}
        />
        {/* Scale drawing */}
        <Box        
          id="zoomImgWrap"
          className={this.props.classes.zoomImgWrap}
          onClick={() =>{
            this.captureZoomImage(true);
          }}
          >
          <div 
            id="zoomFrame"
            className={this.props.classes.zoomFrame}
          ></div>
        </Box>

        <CytoscapeComponent
          id="relation_term_graph_container"

          layout={{name: 'preset'}}
          cy={(cy) => {
            this.cy = cy;
          }}
          wheelSensitivity={0.1}
          elements={CytoscapeComponent.normalizeElements(
              {
                nodes: nodeList,
                edges: edgesList,
              })}

          style={{
            width: '100vw',
            height: '96vh',
            backgroundColor: '#E3E3E3',
          }}
          stylesheet={[
            {
              selector: 'node',
              style: {
              },
            },
            {
              selector: '.showText[term]',
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
                'border-width': 3,
              },
            },
            {
              selector: 'edge',
              style: {
                'width': 5,
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
              selector: '.eh-handle',
              style: {
                width: 20,
                height: 20,
                shape: 'rectangle',
                'background-color': 'royalblue',
              }
            },
            
            {
              selector: '.eh-ghost-edge',
              style: {
                width: 15,
                'line-color': 'yellow',
                'line-style': 'solid',
                'target-arrow-shape': 'vee',
                'target-arrow-color': 'yellow',
                'curve-style': 'straight',
              }
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
                'border-color': 'black',
              },
            },
            {
              selector: '.brown',
              style: {
                'border-color': '#795548',
              },
            },
            {
              selector: '.red',
              style: {
                'border-color': '#f44336',
              },
            },
            {
              selector: '.orange',
              style: {
                'border-color': '#ff9800',
              },
            },
            {
              selector: '.yellow',
              style: {
                'border-color': '#ffeb3b',
              },
            },
            {
              selector: '.lightGreen',
              style: {
                'border-color': '#8bc34a',
              },
            },
            {
              selector: '.green',
              style: {
                'border-color': '#4caf50',
              },
            },
            {
              selector: '.lightBlue',
              style: {
                'border-color': '#03a9f4',
              },
            },
            {
              selector: '.blue',
              style: {
                'border-color': '#2196f3',
              },
            },
            {
              selector: '.deepPurple',
              style: {
                'border-color': '#673ab7',
              },
            },
            {
              selector: '.purple',
              style: {
                'border-color': '#9c27b0',
              },
            },
            {
              selector: '.bgWhite',
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
        />
      </div>
    );
  }
}

VisualizationPanelVocabularyTab.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
  fileLoadCount: PropTypes.number,
  fileId: PropTypes.number,
};
