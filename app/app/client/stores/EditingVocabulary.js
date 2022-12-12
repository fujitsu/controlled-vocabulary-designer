/**
 * EditingVocabulary.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import {action, computed, makeObservable, observable} from 'mobx';
import axios from 'axios';

import _ from 'lodash'

import editingHistoryStore from './EditingHistory';
import History from './History';

import editingVocabularyMetaStore from './EditingVocabularyMeta';

/**
 * Vocabulary data management class
 */
class EditingVocabulary {
  // Editing vocabulary
  @observable editingVocabulary = [];
  // {id: 11, {id:11, term:aa, ...}}
  @observable editingVocWithId = new Map();
  // Reference vocabulary 1
  @observable referenceVocabulary1 = [];
  // Reference vocabulary 2
  @observable referenceVocabulary2 = [];
  // Reference vocabulary 3
  @observable referenceVocabulary3 = [];
  // {id: 11, {id:11, term:aa, ...}}
  @observable referenceVocWithId = [undefined, new Map(), new Map(), new Map()]; // padding th first element
  

  // map for term to id & language
  // key is "term", value is list of object whose properties are id and language
  // "AA", [{id:11, language:ja}, {id:22, language:en}]
  @observable term2id = [new Map(), new Map(), new Map(), new Map()];// edit, ref1, ref2, ref3
 
  constructor() {
    makeObservable(this);
  }

  // get object id by term and laguage
  getIdbyTermandLang(term, language, selectedFileId = 0){
    const iddatalist = this.term2id[selectedFileId].get(term);
    if(undefined === iddatalist){
      return undefined;
    }else{
      if(iddatalist[0].language=== language){
        return iddatalist[0].id;
      }else if(iddatalist.length ===2){
        return iddatalist[1].id;
      }else{
        return undefined;
      }
    }
  }
  // map for uri to ids which have same uri
  // i.e. ids of the sysnonym terms
  // key is "uri", value is set of id1, id2, ...
  // values are got and converted to the ordinary array by the following
  //   uri1 = "https://test/1"
  //   fuga = this.uri2synoid[0].get(uri1)
  //   idlist = [...fuga]
  // simple print method is 
  //   this.uri2synoid[0].forEach((value, key) => {console.log(key); console.log([...value]);})
  @observable uri2synoid = [new Map(), new Map(), new Map(), new Map()];// edit, ref1, ref2, ref3

  // map for broader_uri to ids which have same broader_uri
  // i.e. ids of the narrower terms that having the term whose uri is the uri as broader_uri
  // key is "uri", value is set of id1, id2, ...
  // values are got and converted to the ordinary array by the following
  //   uri1 = "https://test/1"
  //   fuga = this.uri2narrowid[0].get(uri1)
  //   idlist = [...fuga]
  // simple print method is 
  //   this.uri2narrowid[0].forEach((value, key) => {console.log(key); console.log([...value]);})
  @observable uri2narrowid = [new Map(), new Map(), new Map(), new Map()];// edit, ref1, ref2, ref3


  // Array for selected term on Visual vocabulary Tab
  @observable selectedIdList = [];

  /**
   * Set deselected term array
   */
  @action deselectTermList(){
    this.selectedIdList = [];
    this.cyDeselect();
  }
  /**
   * Set selected id array
   */
  @action setSelectedIdList( node ){
    let ret = false;
    if( !this.selectedIdList.includes( node.id)){
      this.selectedIdList.push(node.id);
      ret = true;
    }
    return ret;
  }

  /**
   * Get editing vocabulary data
   */
  @action getEditingVocabularyDataFromDB() {
    // console.log("getEditingVocabularyDataFromDB start.");
    axios
        .get('/api/v1/vocabulary/editing_vocabulary',
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
        )
        .then((response) => {
          // console.log("getEditingVocabularyDataFromDB response.");
          if (this.visualVocRef.current) {
            this.visualVocRef.current.situationArrReset(0);
          }
          this.initializeEditingVocabularyData(response.data.EditingVocabulary);
          this.calcEdgesList(0);
          if (0 == this.selectedFile.id) {
            this.currentNodeClear();
            this.tmpDataClear();
            this.deselectTermList();
            editingHistoryStore.initUndoStack();
          }
        }).catch((err) => {
          console.log('[Error] message : ' + err.message);
          let errMsg = '';
          let errCode = -1;
          // If there is a response
          if (err.response) {
            errCode = err.response.status;
            switch (errCode) {
              case 400:
              case 404:
                // For errors defined in the API
                if (err.response.data.message) {
                  errMsg = err.response.data.message;
                } else {
                  errMsg = '不明なエラー発生';
                }
                break;
              default:
                errMsg = '不明なエラー発生';
                break;
            }
          } else {
            errMsg = err.message;
          }
          this.openApiErrorDialog('編集用語彙データ取得エラー', errCode, errMsg);
        });
  }

  /**
   * get uri_prefix from meta store
   * @return {string} uri_prefix
   */
   getUriPrefix(){
    //uri_prefix
    return editingVocabularyMetaStore.editingVocabularyMeta.meta_uri;
  }

  /**
   * Create history information
   * @param  {object} data - information of vocabulary
   * @return {object} - information of history
   */
  makeVocabularyHistoryData(data) {
    const obj = {
      id: data.id,
      term: data.term,
      preferred_label: data.preferred_label,
      idofuri: data.idofuri,
      uri: data.uri,
      broader_uri : data.broader_uri,
      broader_term: data.broader_term,
      other_voc_syn_uri: data.other_voc_syn_uri,
      term_description: data.term_description,
      created_time: data.created_time,
      modified_time: data.modified_time,
    };
    return obj;
  }

  /**
   * Editing vocabulary data initialization
   * @param {array} dbData - list of editing vocabulary
   */
   @action initializeEditingVocabularyData(dbData) {
    this.uri2preflabel[0]['ja'] = {};
    this.uri2preflabel[0]['en'] = {};
    this.term2id[0].clear();
    this.uri2synoid[0].clear();
    this.uri2narrowid[0].clear();
    dbData.forEach( (data) => {
      // Make dictionary {uri: preferred_label} 
      if (data.preferred_label && data.uri && data.language) {
        if (data.language === 'ja') { // If the language is Japanese
          this.uri2preflabel[0]['ja'][data.uri] = data.preferred_label;
        } else { // If the language is English
          this.uri2preflabel[0]['en'][data.uri] = data.preferred_label;
        }
      }
      // Make term2id
      if(this.term2id[0].has(data.term)){
        const list1 = this.term2id[0].get(data.term);
        list1.push({id: data.id, language: data.language});
      }else{
        this.term2id[0].set(data.term, [{id: data.id, language: data.language}]);
      }      
      // Make uri2synoid
      if(this.uri2synoid[0].has(data.uri)){
        this.uri2synoid[0].get(data.uri).add(data.id);
      }else{
        this.uri2synoid[0].set(data.uri, new Set([data.id]));
      }
      // Make uri2narrowid
      if(data.broader_uri!== ''){
        // if the term have broader
        if(this.uri2narrowid[0].has(data.broader_uri)){
          this.uri2narrowid[0].get(data.broader_uri).add(data.id);
        }else{
          this.uri2narrowid[0].set(data.broader_uri, new Set([data.id]));
        }
      }
    }, this);

    const editingVocabulary = this.calcEditingVocValues(dbData, this.uri2preflabel[0]['ja'], this.uri2preflabel[0]['en']) ;

    this.editingVocabulary = editingVocabulary;
    editingVocabulary.forEach((data)=> this.editingVocWithId.set(data.id, data));
    this.initConfirmColor();
  }

  /**
   * Editing vocabulary data update
   * @param {array} dbData - list of editing vocabulary
   */
   @action updateEditingVocabularyData(dbData) {
    // make id_list with whome terms are updated
    let id_list=[];
    for( let item of dbData){
      id_list.push(item.id);
    };

    // filter unrelated terms
    let unChangeVocabulary = this.editingVocabulary.filter((item) => {return (!id_list.includes(item['id']))}) ;

    this.uri2preflabel[0]['ja'] = {};
    this.uri2preflabel[0]['en'] = {};
    dbData.forEach( (data) => {
      // Make dictionary {uri: preferred_label} 
      if (data.preferred_label && data.uri && data.language) {
        if (data.language === 'ja') { // If the language is Japanese
          this.uri2preflabel[0]['ja'][data.uri] = data.preferred_label;
        } else { // If the language is English
          this.uri2preflabel[0]['en'][data.uri] = data.preferred_label;
        }
      }
    }, this);
    unChangeVocabulary.forEach( (data) => {
      // Make dictionary {uri: preferred_label} 
      if (data.preferred_label && data.uri && data.language) {
        if (data.language === 'ja') { // If the language is Japanese
          this.uri2preflabel[0]['ja'][data.uri] = data.preferred_label;
        } else { // If the language is English
          this.uri2preflabel[0]['en'][data.uri] = data.preferred_label;
        }
      }
    }, this);

    dbData.forEach( (data) => {
      const prevObj = this.editingVocWithId.get(data.id);
      // update uri2synoid {uri: set of id} 
      //delete previous uri 2 id information from set
      this.uri2synoid[0].get(prevObj.uri).delete(prevObj.id);
      if(this.uri2synoid[0].get(prevObj.uri).size === 0){
        // if the sysnonym group with the uri is empty
        this.uri2synoid[0].delete(prevObj.uri);
      }
      // add the new uri 2 id
      if(this.uri2synoid[0].has(data.uri)){
        this.uri2synoid[0].get(data.uri).add(data.id);
      }else{
        this.uri2synoid[0].set(data.uri, new Set([data.id]));
      }
      // update uri2narrowid {uri: set of id} 
      //delete previous broader_uri 2 id information from set
      if(prevObj.broader_uri !==''){
        this.uri2narrowid[0].get(prevObj.broader_uri).delete(prevObj.id);
        if(this.uri2narrowid[0].get(prevObj.broader_uri).size === 0){
          // if the narrower group with the uri is empty
          this.uri2narrowid[0].delete(prevObj.broader_uri);
        }
      }
      // add the new broader uri 2 id
      if(data.broader_uri !==''){
        if(this.uri2narrowid[0].has(data.broader_uri)){
          this.uri2narrowid[0].get(data.broader_uri).add(data.id);
        }else{
          this.uri2narrowid[0].set(data.broader_uri, new Set([data.id]));
        }
      }
    }, this);

    // calculate values to update
    const updatedEditingVocabulary = this.calcEditingVocValues(dbData, this.uri2preflabel[0]['ja'], this.uri2preflabel[0]['en']) ;

    this.editingVocabulary = unChangeVocabulary.concat(updatedEditingVocabulary);
    updatedEditingVocabulary.forEach((data)=> this.editingVocWithId.set(data.id, data));
    this.initConfirmColor();
  }

  /**
   * Calculate Editing vocabulary data to update
   * @param {array} dbData - list of editing vocabulary
   * @param {dictinary} uri_preferred_label_ja
   * @param {dictinary} uri_preferred_label_en
   */
   @action calcEditingVocValues(dbData, uri_preferred_label_ja, uri_preferred_label_en) {
    // calculate values to update
    const editingVocabulary = [];
    if(undefined === dbData || dbData.length === 0){
      return [];
    }
    if(undefined === editingVocabularyMetaStore.editingVocabularyMeta){
      // vocabulary meta should be non-empty, even if editing vocabulary data is empty, 
      console.assert(false, "meta data is undefined.");
      return [];
    }
    const uri_prefix = this.getUriPrefix();

    dbData.forEach( (data) => {
      // Convert broader_uri into broader_term
      if (data.language === 'ja'){ // If the language is Japanese
        if (uri_preferred_label_ja[data.broader_uri] != undefined) {
          if(data.broader_uri.startsWith(uri_prefix) ) {
            data.broader_term = uri_preferred_label_ja[data.broader_uri];
          }else{
            console.assert(false, 'WARINING 111');
            console.log("uri_prefix=" + uri_prefix);
          }
        }else{
          data.broader_term = '';
        }
      }else { // If the language is English
        if (uri_preferred_label_en[data.broader_uri] != undefined) {
          if(data.broader_uri.startsWith(uri_prefix)) {
            data.broader_term = uri_preferred_label_en[data.broader_uri];
          }else{
            console.assert(false, 'WARINING 222');
            console.log("uri_prefix=" + uri_prefix);
          }
        }else{
          data.broader_term = '';
        }
      } 
      
      //uri_prefix
      data.idofuri = data.uri.replace(uri_prefix, ''); // delete the first matched prefix
      
      if (undefined == data.preferred_label) console.assert(false, "datapref");
      if (undefined == data.language) console.assert(false, "datalang");
      if (undefined == data.uri) console.assert(false, "datauri");
      if (undefined == data.other_voc_syn_uri) console.assert(false, "dataothervoc");
      if (undefined == data.term_description) console.assert(false, "datadesc");
      if (undefined == data.created_time) console.assert(false, "datacreatt");
      if (undefined == data.modified_time) console.assert(false, "datamodt");
      if (undefined == data.position_x) console.assert(false, "dataposx");
      if (undefined == data.position_y) console.assert(false, "dataposy");
      if (undefined == data.color1) console.assert(false, "dataco1");
      if (undefined == data.color2) console.assert(false, "dataco2");

      // array
      if (!(data.synonym_candidate) || !(data.synonym_candidate[0])) {
        data.synonym_candidate = [];
      }
      if (!(data.broader_term_candidate) || !(data.broader_term_candidate[0])) {
        data.broader_term_candidate = [];
      }

      editingVocabulary.push(data);
    });
    return editingVocabulary;
  }

  /**
   * Reference vocabulary data initialization
   * @param {array} dbData - list of reference vocabulary
   * @param {number} refid 1 or 2 or 3 to identify reference vocabulary
  * @return {array} - initialized list of reference vocabulary
   */
  setReferenceVocabularyData(dbData, refid) {
    const referenceVocabulary = [];
    this.uri2preflabel[refid]['ja'] = {};
    this.uri2preflabel[refid]['en'] = {};
    this.term2id[refid].clear();
    this.uri2synoid[refid].clear();
    this.uri2narrowid[refid].clear();
    dbData.forEach( (data) => {
      // Make dictionary {uri: preferred_label}
      if (data.preferred_label && data.uri) {
        if(data.language === 'ja'){
          this.uri2preflabel[refid]['ja'][data.uri] = data.preferred_label;
        }else{
          this.uri2preflabel[refid]['en'][data.uri] = data.preferred_label;
        }
      }
      // Make term2id
      if(this.term2id[refid].has(data.term)){
        const list1 = this.term2id[refid].get(data.term);
        list1.push({id: data.id, language: data.language});
      }else{
        this.term2id[refid].set(data.term, [{id: data.id, language: data.language}]);
      } 
      // Make uri2synoid
      if(this.uri2synoid[refid].has(data.uri)){
        this.uri2synoid[refid].get(data.uri).add(data.id);
      }else{
        this.uri2synoid[refid].set(data.uri, new Set([data.id]));
      }
      // Make uri2narrowid
      if(data.broader_uri!== ''){
        // if the term have broader
        if(this.uri2narrowid[refid].has(data.broader_uri)){
          this.uri2narrowid[refid].get(data.broader_uri).add(data.id);
        }else{
          this.uri2narrowid[refid].set(data.broader_uri, new Set([data.id]));
        }
      }
    }, this);

    dbData.forEach( (data) => {
      // Convert broader_uri into broader_term
      if (this.uri2preflabel[refid]['ja'][data.broader_uri] != undefined ||
          this.uri2preflabel[refid]['en'][data.broader_uri] != undefined ) {
        if((data.broader_uri.indexOf("http://") != -1) || (data.broader_uri.indexOf("https://") != -1)) {
          if(data.language === 'ja'){
            data.broader_term = this.uri2preflabel[refid]['ja'][data.broader_uri];
          }else{
            data.broader_term = this.uri2preflabel[refid]['en'][data.broader_uri];
          }
        }else{
          data.broader_term = '';
        }
      }

      data.idofuri = data.uri.substring(data.uri.lastIndexOf('/')+1);

      if (undefined == data.preferred_label) console.assert(false, "refdatapref");
      if (undefined == data.language) console.assert(false, "refdatalang");
      if (undefined == data.uri) console.assert(false, "refdatauri");
      if (undefined == data.other_voc_syn_uri) console.assert(false, "refdataothervoc");
      if (undefined == data.term_description) console.assert(false, "refdatadesc");
      if (undefined == data.created_time) console.assert(false, "refdatacreatt");
      if (undefined == data.modified_time) console.assert(false, "refdatamodt");
      if (undefined == data.position_x) console.assert(false, "refdataposx");
      if (undefined == data.position_y) console.assert(false, "refdataposy");

      referenceVocabulary.push(data);
    }, this);

    return referenceVocabulary;
  }

  /**
   * Get reference vocabulary data
   * @param {number} param 1 or 2 or 3 for refid
   */
  @action getReferenceVocabularyDataFromDB(param) {
    const url = '/api/v1/vocabulary/reference_vocabulary' + param;
    axios
        .get(url,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
        )
        .then((response) => {
          
          if (this.visualVocRef.current) {
            this.visualVocRef.current.situationArrReset( param);
          }
          switch (param) {
            case '1':
              this.referenceVocabulary1 =
                this.setReferenceVocabularyData(
                    response.data.ReferenceVocabulary, param
                );
                this.referenceVocabulary1.forEach((data)=> this.referenceVocWithId[1].set(data.id, data));
                this.calcEdgesList(1);
              if (1 == this.selectedFile.id) {
                this.currentNodeClear();
                this.tmpDataClear();
                this.deselectTermList();
                this.fitToVisualArea();
              }
              break;
            case '2':
              this.referenceVocabulary2 =
                this.setReferenceVocabularyData(
                    response.data.ReferenceVocabulary, param
                );
              this.referenceVocabulary2.forEach((data)=> this.referenceVocWithId[2].set(data.id, data));
              this.calcEdgesList(2);
              if (2 == this.selectedFile.id) {
                this.currentNodeClear();
                this.tmpDataClear();
                this.deselectTermList();
                this.fitToVisualArea();
              }
              break;
            case '3':
              this.referenceVocabulary3 =
                this.setReferenceVocabularyData(
                    response.data.ReferenceVocabulary, param
                );
              this.referenceVocabulary3.forEach((data)=> this.referenceVocWithId[3].set(data.id, data));
              this.calcEdgesList(3);
              if (3 == this.selectedFile.id) {
                this.currentNodeClear();
                this.tmpDataClear();
                this.deselectTermList();
                this.fitToVisualArea();
              }
              break;
            default:
              break;
          }

        }).catch((err) => {
          console.log(
              '[Error] get ReferenceVocabulary' +
              param +
              ' failed(' +
              err.message +
              ').',
          );
          let errMsg = '';
          let errCode = -1;
          // If there is a response
          if (err.response) {
            errCode = err.response.status;
            switch (errCode) {
              case 400:
              case 404:
                // For errors defined in the API
                if (err.response.data.message) {
                  errMsg = err.response.data.message;
                } else {
                  errMsg = '不明なエラー発生';
                }
                break;
              default:
                errMsg = '不明なエラー発生';
                break;
            }
          } else {
            errMsg = err.message;
          }
          this.openApiErrorDialog('参照用語彙データ取得エラー', errCode, errMsg);
        });
  }

  /**
   * TextField candidate term referrer display text
   * @param {string} term - target vocabulary
   * @param {string} type 'broader_term' or 'Synonym'
   * @return {string} - source information
   */
  @action getReferenceFromData(term, type) {
    let str = '';

    if ((0 == this.selectedFile.id) && (this.currentNode.id)) {
      switch (type) {
        case 'broader_term':
          if ( this.currentNode.broader_term_candidate.includes( term)) {
            str += 'AI ';
          }
          if (undefined !=
              this.referenceVocabulary1.find((node) =>
                node.term == term)) {
            str += '参照用語彙1 ';
          }
          if (undefined !=
              this.referenceVocabulary2.find((node) =>
                node.term == term)) {
            str += '参照用語彙2 ';
          }
          if (undefined !=
              this.referenceVocabulary3.find((node) =>
                node.term == term)) {
            str += '参照用語彙3 ';
          }
          break;
        case 'Synonym':
          if ( this.currentNode.synonym_candidate.includes( term)) {
            str += 'AI ';
          }
          if (undefined !=
              this.referenceVocabulary1.find((node) =>
                node.term == term)) {
            str += '参照用語彙1 ';
          }
          if (undefined !=
            this.referenceVocabulary2.find((node) =>
              node.term == term)) {
            str += '参照用語彙2 ';
          }
          if (undefined !=
              this.referenceVocabulary3.find((node) =>
                node.term == term)) {
            str += '参照用語彙3 ';
          }
          break;
        default:
          break;
      }
    }

    str += '';
    return str;
  }

  // Select file switch ////////////////////////////////////////////////////////////
  @observable selectedFile = {id: 0, name: '編集用語彙'};

  @observable isSelected = {relation: false, vocabulary: true};

  /**
   * Visualization screen Initial display status update
   * @param {num} target - 0: related term, 1: vocabulary
   * @param {bool} value - true: not displayed, false: displayed
   */
  @action setSelected(target, value) {
    if (target == 0) {
      this.isSelected.relation = value;
    } else {
      this.isSelected.vocabulary = value;
    }
  }

  /**
   * Get the first display status of the visualization screen
   * @param {num} target - 0: related term, 1: vocabulary
   * @return {bool} - true: not displayed, false: displayed
   */
  @action getSelected(target) {
    if (target == 0) {
      return this.isSelected.relation;
    } else {
      return this.isSelected.vocabulary;
    }
  }

  /**
   * Display vocabulary data selection
   * @param {number} id index
   */
  @action selectFile(id) {
    if (this.selectedFile.id == id) return;
    switch (id) {
      case 0:
        this.selectedFile = {id: 0, name: '編集用語彙'};
        break;
      case 1:
        this.selectedFile = {id: 1, name: '参照用語彙1'};
        break;
      case 2:
        this.selectedFile = {id: 2, name: '参照用語彙2'};
        break;
      case 3:
        this.selectedFile = {id: 3, name: '参照用語彙3'};
        break;
      default:
        break;
    }
    this.currentNodeClear();
    this.tmpDataClear();
    this.deselectTermList();
  }

  /**
   * Get displayed vocabulary data
   * @param {number} id index
   * @return {array} - vocabulary data
   */
  getTargetFileData(id) {
    switch (id) {
      case 0: return this.editingVocabulary;
      case 1: return this.referenceVocabulary1;
      case 2: return this.referenceVocabulary2;
      case 3: return this.referenceVocabulary3;
      default: return this.editingVocabulary;
    }
  }

  /**
   * Get displayed vocabulary data
   * @param {number} fileId index
   * @return {Map} - vocabulary data with id
   */
  getTargetWithId(fileId) {
    switch (fileId) {
      case 0: return this.editingVocWithId;
      case 1: return this.referenceVocWithId[1];
      case 2: return this.referenceVocWithId[2];
      case 3: return this.referenceVocWithId[3];
      default: return this.editingVocWithId;
    }
  }

  @observable edgesList = [[], [], [], []];

  @computed get edgesListId(){
    return this.edgesList[this.selectedFile.id];
  };
  /**
   * edgesList generation computed
   * @return {array} EdgesList for the visualization screen panel vocabulary tab
   */
   @action calcEdgesList(fileId = 0) {
    // const fileId = this.selectedFile.id;
    const termListForVocWithId = this.getTargetWithId(fileId);

    const broaderTermEdges = [];
    const synonymEdges = [];
    // calculate each synonym group
    this.uri2synoid[fileId].forEach((ids, uri)=>{
      // 
      let preid_ja;
      let preid_en;
      let broader_uri = '';
      
      ids.forEach((id1)=>{
        const data1 = termListForVocWithId.get(id1);
        if(data1.term === data1.preferred_label && !data1.hidden){
          // get data who is the preferred label
          if(data1.language === 'ja'){
            preid_ja = id1;
            broader_uri = data1.broader_uri;
          }else{
            preid_en = id1;
            broader_uri = data1.broader_uri;
          }
        }
      },this);

      // set target node id
      let targetid ={}; // sink of arrow for each language
      let broaderrootid; // root of arrow for broader
      if(undefined !== preid_ja && undefined !== preid_en){
        targetid['ja'] = preid_ja;
        targetid['en'] = preid_en;
        broaderrootid = preid_ja;
      }else if(undefined !== preid_ja && undefined === preid_en){
        targetid['ja'] = preid_ja;
        targetid['en'] = preid_ja;
        broaderrootid = preid_ja;
      }else if(undefined === preid_ja && undefined !== preid_en){
        targetid['ja'] = preid_en;
        targetid['en'] = preid_en;
        broaderrootid = preid_en;
      }

      // set synonym edges
      ids.forEach((id1)=>{
        const dataObj = termListForVocWithId.get(id1);
        if(dataObj.hidden || dataObj.external_voc){
          // the data is hidden or external_voc
          // nothing to do
        }else{
          if(id1 === broaderrootid){
            // id1-extvoc line
            if(dataObj.other_voc_syn_uri !== '' && fileId === 0){
              const extset = this.uri2synoid[fileId].get(dataObj.other_voc_syn_uri);
              const extid= [...extset][0];
              synonymEdges.push({
                data: {
                  type: 'synonym',
                  target: extid,
                  source: id1,
                  label: ''
                },
                classes: ['synonym'],
              }); 
            }
          }else if(id1 === targetid[dataObj.language]){
            // id1 - broaderroot line
            synonymEdges.push({
              data: {
                type: 'synonym',
                target: id1,
                source: broaderrootid,
                label: ''
              },
              classes: ['synonym'],
            }); 
          }else{
            // id1 - target[lang] line
            synonymEdges.push({
              data: {
                type: 'synonym',
                target: id1,
                source: targetid[dataObj.language],
                label: ''
              },
              classes: ['synonym'],
            }); 
          }
        }
      }, this);
      // set broader edges
      if(broader_uri !== ''){
        let preidbro_ja;
        let preidbro_en;
        let preidbro;
        // for synonym group
        this.uri2synoid[fileId].get(broader_uri).forEach((id2)=>{
          const data2 = termListForVocWithId.get(id2);
          if(data2.term === data2.preferred_label && !data2.hidden){
            // get data who is the preferred label
            if(data2.language === 'ja'){
              preidbro_ja = id2;
            }else{
              preidbro_en = id2;
            }
          }
        },this);
        if(undefined !== preidbro_ja){
          preidbro = preidbro_ja;
        }else{
          preidbro = preidbro_en;
        }
        broaderTermEdges.push({
          data: {
            type: 'broader_term',
            target: broaderrootid,
            source: preidbro,
            label: '',
            arrow: 'triangle',
          },
          classes: ['broader_term'],
        });
      }

    }, this);

    this.edgesList[fileId] = [...broaderTermEdges, ...synonymEdges];
  };

  /**
   * Get the vocabulary associated with currentNode registered in the editing and reference vocabulary (De-duplication, sorted)
   * @param {string} type 'broader_term' or 'Synonym'
   * @return {array} - list of related term
   */
  @action getCandidateTermList(type) {
    let list = [];
    if ( 0 !== this.selectedFile.id || this.currentNode.id === null) return list;

    const term = this.currentNode.term;
    switch (type) {
      case 'broader_term':
        if ( this.currentNode.broader_term_candidate) {
          this.currentNode.broader_term_candidate.forEach((term) => {
            if ( !list.includes(term)) list.push(term);
          });
        }
        this.referenceVocWithId.forEach((vocWithId, fileId) => {
          if( vocWithId === undefined) return;  // same processing as continue
          // Search for the same term in the reference vocabulary
          let target =  this.term2id[fileId].get(term);
          if( target === undefined || 1 > target.length) return; // same processing as continue
          
          const node = target.find((item)=>{item.language === this.currentNode.language});            
          if( node === undefined) return; // same processing as continue

          const eqTerm = vocWithId.get( node.id );        
          if( eqTerm === undefined) return; // same processing as continue
          
          if ( eqTerm.broader_term && !list.includes(eqTerm.broader_term) ) {
            list.push(eqTerm.broader_term);
          }
        });
        break;
      case 'Synonym':
        if (this.currentNode.synonym_candidate) {
          this.currentNode.synonym_candidate.forEach((term) => {
            if ( !list.includes(term)) list.push(term);
          });
        }
        if (this.currentNode.preferred_label) {
          this.referenceVocWithId.forEach((vocWithId, fileId) => {
            if( vocWithId === undefined) return;   // same processing as continue
            // Search for the same term in the reference vocabulary

            let target = this.term2id[fileId].get(term);
            if( target === undefined || 1 > target.length) return; 
            
            const node = target.find((item)=>{item.language === this.currentNode.language});            
            if( node === undefined) return; 

            const eqTerm = vocWithId.get( node.id );
            if ( eqTerm !== undefined) {
              // Extract terms from same heading
              const eqPreferredLabel = this.uri2synoid[fileId].get(eqTerm.uri);
              eqPreferredLabel.forEach((id) => {
                const node = vocWithId.get(id);
                // The term is not a preferred label and other terms are extracted as synonyms
                if ( node !== undefined && node.term && ( !list.includes(node.term))) {
                  if ( node.term != node.preferred_label &&
                      node.term != this.currentNode.term) {
                    list.push(node.term);
                  }
                }
              });
            }
          });
        }
        break;
      default:
        break;
    }
    list = list.filter((trm)=>{
      return this.editingVocabulary.find( (data) =>{ 
        return data.term === trm && data.language === this.tmpLanguage.value
      });
    })
    return list.sort((a, b) => {
      const lowerA = a.toString().toLowerCase();
      const lowerB = b.toString().toLowerCase();
      if (lowerA > lowerB) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  @observable currentNode = {
    id: null,
    idofuri: '',
    uri: '',
    term: '',
    language: '',
    preferred_label: '',
    hidden: false,
    broader_uri: '',
    other_voc_syn_uri: '',
    term_description: '',
    created_time: '',
    modified_time: '',
    position_x: '',
    position_y: '',
    locked: null,
    color1: '',
    color2: '',
    confirm: 0,
    external_voc: false,
    //
    broader_term: '',
    synonymList: [],
    synonymIdList: [],
  };

  @observable currentLangDiffNode = {
    id: null,
    idofuri: '',
    uri: '',
    term: '',
    language: '',
    preferred_label: '',
    hidden: false,
    broader_uri: '',
    other_voc_syn_uri: '',
    term_description: '',
    created_time: '',
    modified_time: '',
    position_x: '',
    position_y: '',
    locked: null,
    color1: '',
    color2: '',
    confirm: 0,
    external_voc: false,
    //
    broader_term: '',
    synonymList: [],
    synonymIdList: [],
  };

  /**
   * Selected node information initialization
   */
  currentNodeClear() {
    this.currentNode = {
      id: null,
      idofuri: '',
      uri: '',
      term: '',
      language: '',
      preferred_label: '',
      hidden: false,
      broader_uri: '',
      other_voc_syn_uri: '',
      term_description: '',
      created_time: '',
      modified_time: '',
      position_x: '',
      position_y: '',
      locked: null,
      color1: '',
      color2: '',
      confirm: 0,
      external_voc: false,
      //
      broader_term: '',
      synonymList: [],
      synonymIdList: [],
    };

    this.currentLangDiffNodeClear();
  }

  currentLangDiffNodeClear() {
    this.currentLangDiffNode = {
      id: null,
      idofuri: '',
      uri: '',
      term: '',
      language: '',
      preferred_label: '',
      hidden: false,
      broader_uri: '',
      other_voc_syn_uri: '',
      term_description: '',
      created_time: '',
      modified_time: '',
      position_x: '',
      position_y: '',
      locked: null,
      color1: '',
      color2: '',
      confirm: 0,
      external_voc: false,
      //
      broader_term: '',
      synonymList: [],
      synonymIdList: [],
    };
  }
  /**
   * Initialization of data being edited
   *   Never clear ⇒ this.tmpLanguage = {id: '', value: ''};
   */
  tmpDataClear() {
    this.tmpIdofUri = {id: '', list: []};
    // this.tmpUri = {id: '', list: []};
    this.tmpBroaderTerm = {id: '', list: {ja:[], en:[]}, broader_uri: ''};
    this.tmpSynonym = {id: '', list: {ja:[], en:[]}, idList: {ja:[], en:[]}};
    this.tmpPreferredLabel = {id: '', list: {ja:[], en:[]}};
    this.tmpOtherVocSynUri = {id: '', list: []};
    this.tmpTermDescription = {id: '', values: {ja:'', en:''}};
    this.tmpCreatedTime = {id: '', list: []};
    this.tmpModifiedTime = {id: '', list: []};
  }

  /**
   * Whether the selected term has been edited and is pending
   * @return {boolean} - true: contain changes, false: not contain changes
   */
  @computed get getNodesStateChanged() {
    
    let ret = {ja:false, en:false};
    let eachRet = {ja:false, en:false};
    if( !this.currentNode || !this.currentNode.id ){
      return ret;
    }

    // Id of URI
    eachRet = this.getIdofUriChanged();
    ret['ja'] = ret['ja']||eachRet['ja'];
    ret['en'] = ret['en']||eachRet['en'];

    // Preferred label
    eachRet = this.getPrfrdLblChanged();
    ret['ja'] = ret['ja']||eachRet['ja'];
    ret['en'] = ret['en']||eachRet['en'];

    // Broader term
    eachRet = this.getBrdrTermChanged();
    ret['ja'] = ret['ja']||eachRet['ja'];
    ret['en'] = ret['en']||eachRet['en'];

    // Broader term
    eachRet = this.getSynonymChanged();
    ret['ja'] = ret['ja']||eachRet['ja'];
    ret['en'] = ret['en']||eachRet['en'];

    // Term description
    eachRet = this.getTermDescriptionChanged();
    ret['ja'] = ret['ja']||eachRet['ja'];
    ret['en'] = ret['en']||eachRet['en'];

    return ret;
  }

  /**
   * Determine if Id of URI is changed
   * @return {boolean} - true: contain changes, false: not contain changes
   */
   getIdofUriChanged() {
    
    const ret = {ja:false, en: false};
    if (this.currentNode.idofuri) {
      if (this.tmpIdofUri.list.length == 1) {
        if (this.currentNode.idofuri === this.tmpIdofUri.list[0]) {
          return ret;
        } else {
          ret['ja'] = true;
          ret['en'] = true;
          return ret;
        }
      } else {
        // Modified if not one Id of URI being edited
        ret['ja'] = true;
        ret['en'] = true;
        return ret;
      }
    } else {
      if (this.tmpIdofUri.list.length == 0) {
        return ret;
      } else {
        // If it is not set, even one is changed if it is being edited
        ret['ja'] = true;
        ret['en'] = true;
        return ret;
      }
    }
  }

  /**
   * Determine if the heading has been changed
   * @return {boolean} - true: contain changes, false; not contain changes
   */
  getPrfrdLblChanged() {
    
    const ret = {ja:false, en: false};
    [ this.currentNode, this.currentLangDiffNode].forEach((nodeObj)=>{
      if( nodeObj.language==''){
      }else if( this.tmpPreferredLabel.list[ nodeObj.language ].length > 1 ){ // 2
        ret[ nodeObj.language ] = true;
      }else if( this.tmpPreferredLabel.list[ nodeObj.language ].length == 1 ){ // 1
        if( this.tmpPreferredLabel.list[ nodeObj.language ][0] != nodeObj.preferred_label ){
          ret[ nodeObj.language ] = true;
        }
      }else if( 1 > this.tmpPreferredLabel.list[ nodeObj.language ].length ){ // 0
        if( nodeObj.preferred_label != '' ){
          ret[ nodeObj.language ] = true;
        }
      }
    });
    return ret;
  }

  /**
   * Determine if the broader term is changed
   * @return {boolean} - true: contain changes, false: not contain changes
   */
  getBrdrTermChanged() {

    const ret = {ja:false, en: false};
    [ this.currentNode, this.currentLangDiffNode].forEach((nodeObj)=>{
      if( nodeObj.language==''){
      }else if( this.tmpBroaderTerm.list[ nodeObj.language ].length > 1 ){ // 2
        ret[ nodeObj.language ] = true;
      }else if( this.tmpBroaderTerm.list[ nodeObj.language ].length == 1 ){ // 1
        if( this.tmpBroaderTerm.list[ nodeObj.language ][0] != nodeObj.broader_term ){
          ret[ nodeObj.language ] = true;
        }
      }else if( 1 > this.tmpBroaderTerm.list[ nodeObj.language ].length ){ // 0
        if( nodeObj.broader_term != '' ){
          ret[ nodeObj.language ] = true;
        }
      }
    });
    return ret;
  }

  /**
   * Determine if synonyms are changed
   * @return {boolean} - true: contain changes, false: not contain changes
   */
  getSynonymChanged() {
    
    const ret = {ja:false, en: false};
    [ this.currentNode, this.currentLangDiffNode].forEach((nodeObj)=>{
      if( nodeObj.language==''){
      }else if (nodeObj.synonymList.length != this.tmpSynonym.list[nodeObj.language].length) {
        ret[ nodeObj.language ] = true;
      }else{
        this.tmpSynonym.list[nodeObj.language].forEach((languageCurrent) => {
          if ( !nodeObj.synonymList.includes(languageCurrent)) {
            ret[ nodeObj.language ] = true;
          }
        });
        nodeObj.synonymList.forEach((languageCurrent) => {
          if ( !this.tmpSynonym.list[nodeObj.language].includes(languageCurrent)) {
            ret[ nodeObj.language ] = true;
          }
        });
      }
    });
    return ret;
  }

  /**
   * Determine if the term description has been changed
   * @return {boolean} - true: contain changes, false; not contain changes
  */
  getTermDescriptionChanged() {
    const ret = {ja:false, en: false};
    if( this.currentNode.term_description !== this.tmpTermDescription.values[this.currentNode.language] ){
      ret.ja =  true;
    }
    if( this.currentLangDiffNode.term_description != this.tmpTermDescription.values[this.currentLangDiffNode.language] ){
      ret.en =  true;
    }
    return ret;
  }

  /**
   * Select vocabulary
   * @param {number} id id
   * @param {boolean} [isForce=false] - forced selection
   */
  @action setCurrentNodeById(id , isForce = false) {
    //DEBUG
    if(typeof id === "string"){
      id = Number(id);
      console.assert(false, "typeof id is string, wanted as number");
    }
    let target = {};
    if(this.selectedFile.id === 0){
      target = this.editingVocWithId.get(id);
    }else{
      target = this.referenceVocWithId[this.selectedFile.id].get(id);
    }

    if (undefined == target) {
      console.log('[setCurrentNodeById] Not Found term with id:' + id + '.');
      this.currentNodeClear();
      this.tmpDataClear();
      return;
    }

    // Deselect selected terms when they are reselected
    if (!isForce) {
      // if (target.term === this.currentNode.term) {
      if (target.id === this.currentNode.id) {
          this.currentNodeClear();
        this.tmpDataClear();
        // Updating NodeStyle in visualization screen vocabulary tab
        this.fitToCurrent();
        return;
      }
    }

    const handler = {};
    const current = new Proxy(target, handler);
    this.currentNode = current;

    const currentNodeLanguage = this.currentNode.language;
    const synonymIdListWithMe =[...this.uri2synoid[this.selectedFile.id].get(this.currentNode.uri)];
    const synonymIdList = synonymIdListWithMe.filter((id1)=> {return id1 !== this.currentNode.id});
    // const synonymIdList = synonymIdListWithMe;
    const synonymNode = [];
    if(this.selectedFile.id === 0){
      synonymIdList.forEach((id1)=>{
        const tmpObj = this.editingVocWithId.get(id1);
        if(tmpObj.language === currentNodeLanguage){
          synonymNode.push(tmpObj);
        }
      }, this);
    }else{
      synonymIdList.forEach((id1)=>{
        const tmpObj = this.referenceVocWithId[this.selectedFile.id].get(id1);
        if(tmpObj.language === currentNodeLanguage){
          synonymNode.push();
        }
      }, this);
    }

    this.currentNode.synonymList =  [];
    this.currentNode.synonymIdList =  [];
    synonymNode.forEach((synonym) => {
      if (synonym.id != this.currentNode.id) {
        this.currentNode.synonymList.push(synonym.term);
        this.currentNode.synonymIdList.push(synonym.id);
      }
    }, this);



    this.tmpDataClear();

    this.tmpIdofUri = {id: this.currentNode.id, list:[]};
    this.tmpIdofUri.list.push(this.currentNode.idofuri);

    this.tmpBroaderTerm = {id: this.currentNode.id, list:{ja:[], en:[]},  broader_uri: ''};
    if (this.currentNode.broader_uri) {
      if(this.uri2preflabel[0][this.currentNode.language][this.currentNode.broader_uri]){
        this.tmpBroaderTerm.list[this.currentNode.language].push(
          this.uri2preflabel[0][this.currentNode.language][this.currentNode.broader_uri]);  
      }
    }
    this.tmpBroaderTerm.broader_uri = this.currentNode.broader_uri;

    this.tmpPreferredLabel = {id: this.currentNode.id, list: {ja:[], en:[]}};
    if (this.currentNode.preferred_label) {
      this.tmpPreferredLabel.list[this.currentNode.language].push(this.currentNode.preferred_label);
    }

    this.tmpSynonym.list[this.currentNode.language] = [...this.currentNode.synonymList];//shallow copy
    this.tmpSynonym.idList[this.currentNode.language] = [...this.currentNode.synonymIdList];//shallow copy

    this.tmpTermDescription ={id: this.currentNode.id, values: {ja:'', en:''}};
    if (this.currentNode.term_description) {
      this.tmpTermDescription.values[this.currentNode.language] = this.currentNode.term_description;
    }

    this.tmpLanguage = {id: this.currentNode.id, value: this.currentNode.language};

    if (this.currentNode.created_time) {
      this.tmpCreatedTime = {id: this.currentNode.id, list: [this.currentNode.created_time]};
    }

    if (this.currentNode.modified_time) {
      this.tmpModifiedTime = {id: this.currentNode.id, list: [this.currentNode.modified_time]};
    }

    if (this.currentNode.other_voc_syn_uri) {
      this.tmpOtherVocSynUri = {id: this.currentNode.id, list: [this.currentNode.other_voc_syn_uri]};
    }

    this.setCurrentLangDiffNode();
  }

  /**
   * Ref for visualization screen vocabulary tab operations
   * @type {Object}
   */
  visualVocRef = React.createRef();

  /**
   * Center the selected vocabulary in the visualization screen vocabulary tab and update each NodeStyle
   */
  fitToCurrent() {
    if (this.visualVocRef.current) {
      this.visualVocRef.current.fitToCurrent();
    }
  }
  
  fitToVisualArea(){
    if (this.visualVocRef.current) {
      this.visualVocRef.current.fitToVisualArea();
    }
  }
  
  /**
   * Deselect all nodes in cytoscape in the visualization screen
   */
   cyDeselect() {
    if (this.visualVocRef.current) {
      this.visualVocRef.current.cyDeselect();
    }
  }  

  // Dialog control on API error ////////////////////////////
  @observable apiErrorDialog = {
    open: false,
    title: '',
    errCode: -1,
    errMsg: '',
  };

  /**
   * API error dialog display
   * @param  {string} title - error title
   * @param  {number} errCode - error code
   * @param  {string} errMsg - error message
   */
  @action openApiErrorDialog(title, errCode, errMsg) {
    this.apiErrorDialog.open = true;
    this.apiErrorDialog.title = title;
    this.apiErrorDialog.errCode = errCode;
    this.apiErrorDialog.errMsg = errMsg;
  }

  /**
   * API error dialog close
   */
  @action closeApiErrorDialog() {
    this.apiErrorDialog.open = false;
    this.apiErrorDialog.title = '';
    this.apiErrorDialog.errCode = -1;
    this.apiErrorDialog.errMsg = '';
  }

  setCurrentLangDiffNode(){
    const synonymIdList =[...this.uri2synoid[this.selectedFile.id].get(this.currentNode.uri)];
    const languageChangeNode = [];
    const currentNodeLanguage = this.currentNode.language;
    if(this.selectedFile.id === 0){
      synonymIdList.forEach((id1)=>{
        const tmpObj = this.editingVocWithId.get(id1);
        if(tmpObj.language !== currentNodeLanguage){
          languageChangeNode.push(tmpObj);
        }
      }, this);
    }else{
      synonymIdList.forEach((id1)=>{
        const tmpObj = this.referenceVocWithId[this.selectedFile.id].get(id1);
        if(tmpObj.language !== currentNodeLanguage){
          languageChangeNode.push(tmpObj);
        }
      }, this);
    } 
   
    if (languageChangeNode.length > 0){
      const otherlangsynonymList= [];
      const otherlangsynonymIdList= [];
      let preferredNode = null;
      languageChangeNode.forEach((synonym) => {
        otherlangsynonymList.push(synonym.term);
        otherlangsynonymIdList.push(synonym.id);
        if(synonym.term == synonym.preferred_label){
          preferredNode = synonym;
        }
      }, this);
      const languageChangeNodeData = preferredNode || languageChangeNode[0];
      this.currentLangDiffNode  = languageChangeNodeData;      

      const preferredlabel = [];
      const broaderterm = [];
      let broader_uri = '';
      let termdescription = '';
    
      this.currentLangDiffNode.synonymList = otherlangsynonymList;
      this.currentLangDiffNode.synonymIdList = otherlangsynonymIdList;

      this.tmpSynonym.list[this.currentLangDiffNode.language] = otherlangsynonymList;
      this.tmpSynonym.idList[this.currentLangDiffNode.language] = otherlangsynonymIdList;

      if (languageChangeNodeData.preferred_label.length > 0) {
        preferredlabel.push(languageChangeNodeData.preferred_label);
      }

      if (undefined !== this.uri2preflabel[0][languageChangeNodeData.language][languageChangeNodeData.broader_uri]) {
        broaderterm.push(this.uri2preflabel[0][languageChangeNodeData.language][languageChangeNodeData.broader_uri]);        
      }
      broader_uri = languageChangeNodeData.broader_uri;

      if (languageChangeNodeData.term_description.length > 0) {
        termdescription = languageChangeNodeData.term_description;
      }

      this.tmpPreferredLabel.list[languageChangeNodeData.language] = preferredlabel;

      this.tmpBroaderTerm.list[languageChangeNodeData.language] = broaderterm;
      this.tmpBroaderTerm.broader_uri = broader_uri;
      this.tmpTermDescription.values[languageChangeNodeData.language] = termdescription;
    }else{
      this.currentLangDiffNodeClear();
      this.currentLangDiffNode.language = this.currentNode.language=='ja'?'en':'ja';
    }
  }


  /**
   * Copy Vocabulary data
   * @param  {object} indata vocabulary data
   * @return {object} outdata copied object
   */
   copyData(indata) {
    const outdata = new Object;
    outdata.id = indata.id;
    outdata.term = indata.term;
    outdata.preferred_label = indata.preferred_label;
    outdata.language = indata.language;
    outdata.idofuri = indata.idofuri;
    outdata.uri = indata.uri;
    outdata.broader_uri = indata.broader_uri;
    outdata.broader_term = indata.broader_term;
    outdata.other_voc_syn_uri = indata.other_voc_syn_uri;
    outdata.term_description = indata.term_description;
    outdata.created_time = indata.created_time;
    outdata.modified_time = indata.modified_time;
    outdata.synonym_candidate = [...indata.synonym_candidate];//copy
    outdata.broader_term_candidate = [...indata.broader_term_candidate];//copy
    outdata.hidden = indata.hidden;
    outdata.position_x = indata.position_x;
    outdata.position_y = indata.position_y;
    outdata.color1 = indata.color1;
    outdata.color2 = indata.color2;
    outdata.confirm = indata.confirm;
    outdata.external_voc = indata.external_voc;
    return outdata;
  }


  /**
   * Changing the color of related terms and vocabulary
   * @param  {array}  tagetIds - target id array
   * @param  {string}  colorId - 'color1' or 'color2'
   * @param  {string}  tmpColor - color to change      
   * @param  {array}  tagetHistoryObjs - target history object array (hitorys undo only)
   * @param  {Boolean} isHistory - caller is history
   */
   @action updateColor( tagetIds, colorId, tmpColor = null, tagetHistoryObjs=[], isHistory = false) {

    const dataWithId = this.getTargetWithId(this.selectedFile.id);

    const updateTermList = [];
    const previousForHistory = [];
    const followingForHistory = [];

    if( isHistory === true && tmpColor === null){ // history undo
      tagetHistoryObjs.forEach((item)=>{
        const dataObj = dataWithId.get( Number(item.id));
        // update data
        const dbData = this.copyData(dataObj); // copy
        dbData[ colorId] = item.color;
        updateTermList.push( dbData);
      },this);
    }else{ // history redo and selected item
      tagetIds.forEach((id1)=>{
        const dataObj = dataWithId.get( Number(id1));
        const colorName = dataObj[colorId];
        // history
        previousForHistory.push({
          id: id1,
          color: colorName,
        });
        // update data
        const dbData = this.copyData(dataObj); // copy
        dbData.color1 = tmpColor;
        updateTermList.push( dbData);
        // history
        followingForHistory.push({
          id: id1,
          color: tmpColor,
        });
      },this);
    }  
    const history = new History( colorId, this.currentNode.id, this.currentLangDiffNode.id);
    history.previous = previousForHistory;
    history.following = followingForHistory;
    history.targetId = this.currentNode.id;

    this.updateRequest( updateTermList, isHistory?null:history);
  }

  /**
   * Returns a sorted list of vocabulary lists by sort specification
   * @return {array} - sort list
   */
  @computed get sortedNodeList() {
    const targetData = this.getTargetFileData(this.selectedFile.id);

    return targetData.slice().sort((a, b) => {
      const lowerA = a.term.toString().toLowerCase();
      const lowerB = b.term.toString().toLowerCase();
      if (lowerA > lowerB) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  // //////////////////////////////////////////////////////

  // node display MAX number
  DISP_NODE_MAX = 100;

  /**
   * Adjust coordinate values to display related terms
   * @param  {Number} position x or y position
   * @return {Number} - related term coordinate value
   */
  calcPosition(position) {
    // 0.01 resolution and 1000 resolution
    return Math.sign(position)*Math.
        pow(10, Math.log10(Math.abs(position))*3.0/4.0)*2000;
  }

  
  /**
   * Calculate the coordinates of the term from the coordinates of the visualization panel 
   * @param  {Number} position x or y position
   * @param  {bool}   isDrag true: Calculation for drag , false: other
   * @return {Number} - reverse value
   */
   calcReversePosition(position, isDrag=false) {
     if(isDrag){
       return Math.sign(position)*1.0/10000.0*Math.pow(Math.E, 4.0/3.0*Math.log(1.0/2.0*Math.abs(position)));
     }else{
       return position / 1000;
     }
  }

  /**
   * Whether the term contains a prefix indicating a blank
   * 
   * @return {bool} - true=is blank term / false=not blank term
   */
   @action isBlankTerm( term, language=this.tmpLanguage.value){
    const targetId = this.getIdbyTermandLang(term, language);
    const targetNode = targetId?this.editingVocWithId.get(targetId):false;
    return targetNode?targetNode.hidden:false;
  }

  /**
   * Visualization screen panel creating vocabulary list for vocabulary tab
   * @return {array} - vocabulary list
   */
  @computed get termListForVocabulary() {
    const targetData = this.getTargetFileData(this.selectedFile.id);

    const termListForVocabulary = [];
    targetData.forEach((data) => {
      if( !data.hidden ){
        // Editing vocabulary
        termListForVocabulary.push({
          data: {
            id: data.id,
            term: data.term,
            language: data.language,
            vocabularyColor: data.color1?data.color1:'',
            external_voc: data.external_voc,
            confirm: data.confirm?data.confirm:'',
          },
          position: {
            x: data.position_x?this.calcPosition(data.position_x):0,
            y: data.position_y?this.calcPosition(data.position_y):0,
          }
        });
      }
    });

    return termListForVocabulary;
  }

  /**
   * Determine if the selected vocabulary
   * @param  {object}  element - target vocabulary data
   * @return {Boolean} - true: Yes, false: No
   */
  isCurrentNode(element) {
    if (element.data.id === this.currentNode.id) return true;
    return false;
  }

  // Vocabulary data update //////////////////////////////////////////////////

  /**
   * Updating synonyms, preferred label, URI, and broader term
   * 
   * @param  {string} setTerm - term you want to set after update
   * @return {string} - error message
   */
  @action updateVocabulary( setTermId=null, debugind=0) {
    // this function update values according to tmpXXX observables. this does not update currentNode and correnLangDiffNode

    if (!this.currentNode.id) {
      return null;
    }
    const error =  this.errorCheck();
    if (error !== null) {
      return error;
    }
    let history = new History('vocabulary', this.currentNode.id, this.currentLangDiffNode.id);
    let previousForHistory = [];
    let followingForHistory = [];

    //uri_prefix
    const uri_prefix = this.getUriPrefix();
  
    const prevSynIdListJa =this.currentNode.language === 'ja'? this.currentNode.synonymIdList.concat(): this.currentLangDiffNode.synonymIdList.concat(); 
    const prevSynIdListEn =this.currentNode.language === 'en'? this.currentNode.synonymIdList.concat(): this.currentLangDiffNode.synonymIdList.concat(); 
    const followSynIdListJa = this.tmpSynonym.idList['ja'].concat();
    const followSynIdListEn = this.tmpSynonym.idList['en'].concat();
    const followSynIdListWithMe = [...followSynIdListJa, ...followSynIdListEn, this.currentNode.id];
    
    // calc modifiled time
    // Get current time
    const dateTmp = new Date();
    const dateNow = dateTmp.toISOString().replace(/\.\d+Z/,'Z'); // get UTC time without milliseconds, e.g. "2022-11-04T07:32:18Z"

    // find deleted terms and ids from sysnonyms
    let deletedIdJa = prevSynIdListJa.filter((term)=>{return !followSynIdListJa.includes(term)});
    let deletedIdEn = prevSynIdListEn.filter((term)=>{return !followSynIdListEn.includes(term)});
    
    const delObj = this.editingVocabulary.filter((obj)=>{
      return (deletedIdJa.includes(obj.id) || deletedIdEn.includes(obj.id))
    });
    const delObjList = [];
    delObj.forEach(obj => {
      // push it to history
      previousForHistory.push(this.makeVocabularyHistoryData(obj));
      const followObj = new Object;
      followObj.id = obj.id; // id as is 
      followObj.term = obj.term; // term as is 
      followObj.preferred_label = obj.term; // set term as preferredLabel
      followObj.language = obj.language; // language as is 
      followObj.idofuri = obj.term + '@' + obj.language + String(Date.now());// tentative treatment
      // we need to change it to UUID or something else
      followObj.uri = uri_prefix + followObj.idofuri; 
      followObj.broader_uri = obj.broader_uri;// broader_uri as is 
      followObj.broader_term = obj.broader_term;// broader_term as is  // optional
      followObj.other_voc_syn_uri = ''; // the other_voc_syn_uri should be exist in the remaining synonym group
      followObj.term_description = ''; // 
      followObj.created_time = obj.created_time; // created_time as is
      followObj.modified_time = dateNow; // modified_time is now
      followObj.synonym_candidate = obj.synonym_candidate; // synonym_candidate as is
      followObj.broader_term_candidate = obj.broader_term_candidate; // broader_term_candidate as is
      followObj.hidden = obj.hidden; // hidden as is
      followObj.position_x = obj.position_x; // position_x as is
      followObj.position_y = obj.position_y; // position_y as is
      followObj.color1 = obj.color1; // color1 as is
      followObj.color2 = obj.color2; // color2 as is
      followObj.confirm = obj.confirm; // confirm as is
      followObj.external_voc = obj.external_voc; // external_voc as is
      delObjList.push(followObj);
      // push it to history
      followingForHistory.push(this.makeVocabularyHistoryData(followObj));
    });
    
    // get new syngroup for all language
    const followSynGroup = this.editingVocabulary.filter((obj)=>{
      return (followSynIdListWithMe.includes(obj.id))
    });
    const followSynGroupObjList = [];
    const tmp1Pref = this.tmpPreferredLabel; // this rename is just to avoid variable name resolution problem
    const tmp1IdofUri = this.tmpIdofUri; // this rename is just to avoid variable name resolution problem
    const tmp1BroaderTerm = this.tmpBroaderTerm; // this rename is just to avoid variable name resolution problem
    const tmp1OtherVocSynUri = this.tmpOtherVocSynUri; // this rename is just to avoid variable name resolution problem
    const tmp1TermDescription =this.tmpTermDescription; // this rename is just to avoid variable name resolution problem
    followSynGroup.forEach(obj => {
      // push it to history
      previousForHistory.push(this.makeVocabularyHistoryData(obj));
      const followObj = new Object;
      followObj.id = obj.id; // id as is 
      followObj.term = obj.term;// term as is 
      if(tmp1Pref.list[obj.language].length !==0){
        followObj.preferred_label = tmp1Pref.list[obj.language][0];
      }else{
        followObj.preferred_label = '';
      }
      followObj.language = obj.language;// language as is 
      followObj.idofuri = tmp1IdofUri.list[0];
      followObj.uri = uri_prefix + tmp1IdofUri.list[0]; //tentative
      followObj.broader_uri = tmp1BroaderTerm.broader_uri; 
      if(tmp1BroaderTerm.list[obj.language].length!==0){
        followObj.broader_term = tmp1BroaderTerm.list[followObj.language][0]  // optional
      }else{
        followObj.broader_term = '';
      }
      if(tmp1OtherVocSynUri.list.length!==0){
        followObj.other_voc_syn_uri = tmp1OtherVocSynUri.list[0];
      }else{
        followObj.other_voc_syn_uri =''
      }
      if(tmp1TermDescription.values[followObj.language]!==''){
        followObj.term_description = tmp1TermDescription.values[followObj.language];
      }else{
        followObj.term_description =''
      }
      followObj.created_time = obj.created_time; // created_time as is
      followObj.modified_time = dateNow; // modified_time is now
      followObj.synonym_candidate = obj.synonym_candidate; // synonym_candidate as is
      followObj.broader_term_candidate = obj.broader_term_candidate; // broader_term_candidate as is
      followObj.hidden = obj.hidden; // hidden as is
      followObj.position_x = obj.position_x; // position_x as is
      followObj.position_y = obj.position_y; // position_y as is
      followObj.color1 = obj.color1; // color1 as is
      followObj.color2 = obj.color2; // color2 as is
      followObj.confirm = obj.confirm; // confirm as is
      followObj.external_voc = obj.external_voc; // external_voc as is
      // add
      followSynGroupObjList.push(followObj);
      // push it to history
      followingForHistory.push(this.makeVocabularyHistoryData(followObj));
    });

    // if the uri or idofuri has been changed or new terms are added to synonym
    // we need to update subordinate term's broader_uri
    const followSubGroupObjList = [];
    const synonymUriSet = new Set(); // set for 'previous' uris in the sysnonym group
    followSynGroup.forEach((obj)=>{
      synonymUriSet.add(obj.uri);
    });
    if(this.tmpIdofUri.list[0]!= this.currentNode.idofuri || synonymUriSet.size !== 1){
      // collect uris in the sysnonym group
      // get new subordinate terms for all language
      const followSubGroup = [];
      const followSubIdSet = new Set();
      synonymUriSet.forEach((uri1)=>{
        // uri -> narrow terms id
        const idset = this.uri2narrowid[0].get(uri1);
        if(undefined !== idset){
          idset.forEach((id1)=>{
            followSubIdSet.add(id1);
          });
        }
      }, this);
      // id -> data
      followSubIdSet.forEach((id1)=>{
        const foundObj = this.editingVocWithId.get(id1);
        followSubGroup.push(foundObj);
      }, this);

      const tmp2IdofUri = this.tmpIdofUri; // this rename is just to avoid variable name resolution problem 
      const tmp2Pref = this.tmpPreferredLabel; // this rename is just to avoid variable name resolution problem
      followSubGroup.forEach(obj => {
        // push it to history
        previousForHistory.push(this.makeVocabularyHistoryData(obj));
        const followObj = new Object;
        followObj.id = obj.id; // id as is 
        followObj.term = obj.term;// term as is 
        followObj.preferred_label = obj.preferred_label;// preferred_label as is 
        followObj.language = obj.language;// language as is 
        followObj.idofuri = obj.idofuri; // idofuri as is
        followObj.uri = obj.uri; // uri as is
        followObj.broader_uri = uri_prefix + tmp2IdofUri.list[0]; // tentative 
        if(tmp2Pref.list[obj.language].length !==0){ // optional
          followObj.broader_term = tmp2Pref.list[followObj.language][0];  
        }else{
          followObj.broader_term = '';
          console.assert(false, "something wrong 820");
        }
        followObj.other_voc_syn_uri = obj.other_voc_syn_uri; // other_voc_syn_uri as is
        followObj.term_description = obj.term_description; // term_description as is
        followObj.created_time = obj.created_time; // created_time as is
        followObj.modified_time = dateNow; // modified_time is now
        followObj.synonym_candidate = obj.synonym_candidate; // synonym_candidate as is
        followObj.broader_term_candidate = obj.broader_term_candidate; // broader_term_candidate as is
        followObj.hidden = obj.hidden; // hidden as is
        followObj.position_x = obj.position_x; // position_x as is
        followObj.position_y = obj.position_y; // position_y as is
        followObj.color1 = obj.color1; // color1 as is
        followObj.color2 = obj.color2; // color2 as is
        followObj.confirm = obj.confirm; // confirm as is
        followObj.external_voc = obj.external_voc; // external_voc as is
        // add
        followSubGroupObjList.push(followObj);
        // push it to history
        followingForHistory.push(this.makeVocabularyHistoryData(followObj));
      });
    }

    let updateTermList = [...delObjList, ...followSynGroupObjList, ...followSubGroupObjList];
    history.previous = previousForHistory;
    history.following = followingForHistory;
    history.action = "vocabulary";
    history.targetId = this.currentNode.id;

    const doEdgeUpdate = true;
    this.updateRequest(updateTermList, history, doEdgeUpdate);
    return null;
  }


  /**
   * Updating coordinate values etc. to DB 
   * @param  {object} nodes - cytoscape nodes
   * @return {string} - error message
   */
  @action updateVocabularies(cy, idList, isDrag=false) {

    // tentative treatment
    if(this.selectedFile.id !== 0){
      return;
      // this method can not treat reference voc
    }

    const dataWithId = this.getTargetWithId(this.selectedFile.id);

    // Get coordinate information from the visualization panel
    const updateTermList = [];
    const previousForHistory = [];
    const followingForHistory = [];
     
    idList.forEach((id1)=>{
      const node = cy.getElementById(String(id1));
      const posi = node.position();
      let position_x = null; // number
      let position_y = null; // number
      position_x = this.calcReversePosition( posi.x, isDrag);
      position_y = this.calcReversePosition( posi.y, isDrag);
      const dataObj = dataWithId.get(id1);
      // history
      previousForHistory.push({
        id: id1,
        position_x: dataObj.position_x,
        position_y: dataObj.position_y,
      });
      // update data
      const dbData = this.copyData(dataObj); // copy
      dbData.position_x = String(position_x);
      dbData.position_y = String(position_y);
      dbData.color1 = node.data().vocabularyColor;
      dbData.color2 = this.confirmColor;
      dbData.confirm = node.data().confirm ==''? 0:1;
      updateTermList.push( dbData);
      // history
      followingForHistory.push({
        id: id1,
        position_x: String(position_x),
        position_y: String(position_y),
      });
    },this);

    const history = new History('position', this.currentNode.id, this.currentLangDiffNode.id);
    history.previous = previousForHistory;
    history.following = followingForHistory;
    history.targetId = this.currentNode.id;

    if( updateTermList.length > 0){
      this.updateRequest(updateTermList, history);
    }
    
    return '';
  }

  /**
   * Execute vocabulary data update
   * @param  {array} updateList - updated vocabulary list
   * @param  {object} history - history data 
   * @param  {boolean} doEdgeUpdate - doEdgeUpdate 
   * 
   */
  updateRequest(updateList, history = null, doEdgeUpdate = false) {

    const updeteUrl = '/api/v1/vocabulary/editing_vocabulary/' + 'term';
    let requestBody = updateList;

    axios
        .post(updeteUrl,
            requestBody,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
        )
        .then((response) => {
          this.updateEditingVocabularyData(response.data);
          if(doEdgeUpdate){
            this.calcEdgesList();
          }
          const oldNodeId = this.currentNode.id;
          if (history) {
            editingHistoryStore.addHistory(history);
          }
          this.setCurrentNodeById( oldNodeId, true);
        }).catch((err) => {
          console.log('[Error] message : ' + err.message);
          let errMsg = '';
          let errCode = -1;
          // If there is a response
          if (err.response) {
            errCode = err.response.status;
            switch (errCode) {
              case 400:
              case 404:
                // For errors defined in the API
                if (err.response.data.message) {
                  errMsg = err.response.data.message;
                } else {
                  errMsg = '不明なエラー発生';
                }
                break;
              default:
                errMsg = '不明なエラー発生';
                break;
            }
          } else {
            errMsg = err.message;
          }
          this.openApiErrorDialog('語彙データ変更エラー', errCode, errMsg);
        });
  }

  /**
   * Determine if a term is specified as a broader term or preferred label
   * @param  {Object}  obj - vocabulary data
   * @param  {String}  term - target term
   * @return {Boolean} - true: specified, false: unspecified
   */
  isRelatedObj(obj, term) {
    if (obj.broader_term == term) {
      return true;
    }
    if (obj.preferred_label == term) {
      return true;
    }
    if (obj.term == term) {
      if (obj.broader_term) {
        return true;
      }
      if (obj.preferred_label) {
        return true;
      }
    }
    return false;
  }

  /**
   * Error determination processing of editing content
   * @return {string} - error type
   */
  errorCheck() {

    if( !this.currentNode.id) return null;

    // let errorKind = '';
    let ret={
      errorKind : '',
      term: this.currentNode.term,
      language: this.currentNode.language,
    }

    // number check
    // synonyms have no constraint
    //
    // preferred labels must be at most one for each language
    if (this.tmpPreferredLabel.list['ja'].length > 1) {
      console.log('[errorCheck] multiPreferredLabel.');
      ret.errorKind = 'multiPreferredLabel';      
      ret.language = 'ja';
      return ret;
    }
    if (this.tmpPreferredLabel.list['en'].length > 1) {
      console.log('[errorCheck] multiPreferredLabel.');
      ret.errorKind = 'multiPreferredLabel';      
      ret.language = 'en';
      return ret;
    }
    // at least one preferred label are set at some language
    if (this.tmpPreferredLabel.list['ja'].length == 0 && this.tmpPreferredLabel.list['en'].length == 0) {
      console.log('[errorCheck] blankPreferredLabel.');
      ret.errorKind = 'blankPreferredLabel';      
      ret.language = '';
      return ret;
    }
    // idofuri must be one for both language
    if (this.tmpIdofUri.list.length > 1) {
      console.log('[errorCheck] multiIdofUri.');
      ret.errorKind = 'multiIdofUri';
      return ret;
    }
    if (this.tmpIdofUri.list.length == 0) {
      console.log('[errorCheck] needToIdofUri.');
      ret.errorKind = 'needToIdofUri';
      return ret;
    }
    if (this.tmpIdofUri.list ==  '') {
      console.log('[errorCheck] needToIdofUri.');
      ret.errorKind = 'needToIdofUri';
      return ret;
    }
    
    // broader must be at most one for each language
    if (this.tmpBroaderTerm.list['ja'].length > 1) {
      console.log('[errorCheck] multiBroaderTerm.');
      ret.errorKind = 'multiBroaderTerm';
      ret.language = 'ja';
      return ret;
    }
    if (this.tmpBroaderTerm.list['en'].length > 1) {
      console.log('[errorCheck] multiBroaderTerm.');
      ret.errorKind = 'multiBroaderTerm';
      ret.language = 'en';
      return ret;
    }

    // preferred label must exist in the synonyms or is the term
    if(this.tmpPreferredLabel.list[this.currentNode.language].length !==0){
      if (!this.isValidPreferredLabel(this.currentNode, this.tmpPreferredLabel.list[this.currentNode.language][0], this.currentNode.language)) {
        console.log('[errorCheck] invalidPreferredLabel.');
        ret.errorKind = 'invalidPreferredLabel';
        ret.term = this.currentNode.term;
        ret.language = this.currentNode.language;
        return ret;
      }
    }
    if(this.tmpPreferredLabel.list[this.currentLangDiffNode.language].length !==0){  
      if (!this.isValidPreferredLabel(this.currentLangDiffNode, this.tmpPreferredLabel.list[this.currentLangDiffNode.language][0], this.currentLangDiffNode.language)) {
        console.log('[errorCheck] invalidPreferredLabel.');
        ret.errorKind = 'invalidPreferredLabel';
        if(this.currentLangDiffNode.term !== '' & !this.currentLangDiffNode.hidden){
          ret.term = this.currentLangDiffNode.term;
        }else{
          ret.term = '';
        }
        ret.language = this.currentLangDiffNode.language;
        return ret;
      }
    }

    // Id of URI must be unique except synonym's idofuri
    const idofuri = this.tmpIdofUri.list[0];
    const synonymIdList = this.tmpSynonym.idList;
    if(!this.isUniqueIdofUri(this.currentNode, this.tmpLanguage.value, idofuri, synonymIdList)){
      console.log('[errorCheck] nonuniqueIdofUri.');
      ret.errorKind = 'nonuniqueIdofUri';
      return ret;
    };

    // synonyms must not be the subordinate terms
    if (this.tmpSynonym.list[this.currentNode.language].length > 0) {
      if (this.isNarrowerTerm(this.currentNode.term, this.currentNode.language, this.tmpSynonym.list[this.currentNode.language])) {
        console.log('[errorCheck] narrowerSynonym.');
        ret.errorKind = 'narrowerSynonym';
        ret.term = this.currentNode.term;
        ret.language = this.currentNode.language;
        return ret;
      };
    }
    // synonyms must not be the subordinate terms
    if (this.tmpSynonym.list[this.currentLangDiffNode.language].length > 0) {
      if (this.isNarrowerTerm(this.currentLangDiffNode.term, this.currentLangDiffNode.language, this.tmpSynonym.list[this.currentLangDiffNode.language])) {
        console.log('[errorCheck] narrowerSynonym.');
        ret.errorKind = 'narrowerSynonym';
        ret.term = this.currentLangDiffNode.term;
        ret.language = this.currentLangDiffNode.language;
        return ret;
      };
    }

 
    //  broader term does not exist in the synonym nor is not the term 
    if ((this.tmpBroaderTerm.list['ja'].length == 1)) {
      const term = this.currentNode.language === 'ja'? this.currentNode.term:this.currentLangDiffNode.term;
      const nextBroaderTerm = this.tmpBroaderTerm.list[this.currentNode.language][0];
      if (this.isBroaderInSynonym(term, 'ja', nextBroaderTerm)) {
        console.log('[errorCheck] broaderInSynonym.');
        ret.errorKind = 'broaderInSynonym';
        ret.term = term;
        ret.language = 'ja';
        return ret;
      }
    }
    if ((this.tmpBroaderTerm.list['en'].length == 1)) {
      const term = this.currentNode.language === 'en'? this.currentNode.term:this.currentLangDiffNode.term;
      const nextBroaderTerm = this.tmpBroaderTerm.list[this.currentNode.language][0];
      if (this.isBroaderInSynonym(term, 'en', nextBroaderTerm)) {
        console.log('[errorCheck] broaderInSynonym.');
        ret.errorKind = 'broaderInSynonym';
        if(this.currentLangDiffNode.term !== '' & !this.currentLangDiffNode.hidden){
          ret.term = this.currentLangDiffNode.term;
        }else{
          ret.term = '';
        }
        ret.language = 'en';
        return ret;
      }
    }

  
    // the broader term should not exist in the narrower terms
    // this check will be detected by the loop check of the broader and narrow relation

    // broader and narrower relation must not be a loop 
    if (this.tmpBroaderTerm.broader_uri !== '') {
      if (this.isCyclicBroaders(this.currentNode, String(this.tmpBroaderTerm.list[this.tmpLanguage.value]), this.tmpBroaderTerm.broader_uri)) {
      console.log('[errorCheck] cycleBroaderTerm.');
      ret.errorKind = 'cycleBroaderTerm';
      ret.term = this.currentNode.term;
      ret.language = this.currentNode.language;
      return ret;
      }
    }

    return ret.errorKind==''?null:ret;
  }

  @observable equalUriPreferredLabel = '';
  @observable cycleBroaderTerm = [];

  // // URI //////////////////////
  @computed get tmpUri(){
    const obj = {};
    obj.id = this.tmpIdofUri.id;
    const uri_prefix = this.getUriPrefix();
    obj.list = [uri_prefix + this.tmpIdofUri.list[0]];
    return obj;
  }

  /**
   * Create URI list for screen display
   * @return {Array} - URI list
   */
  @computed get currentUri() {
    if (!(this.currentNode.id)) {
      return [];
    }
    let filterList = [];
    if (this.tmpUri.id == this.currentNode.id) {
      if ( this.tmpUri.list.length > 0 ) {
        filterList = this.tmpUri.list;
      }
    } else {
      if ( this.currentNode.uri != '' ) {
        filterList = [this.currentNode.uri];
      }
    }
    return filterList;
  }

  /**
   * Determine if the Id of URI is unique except synonym's idofuri
   * @param  {Object}  currentNode - check target node
   * @param  {String}  language - 
   * @param  {String}  idofuri - Id of URI string
   * @param  {Object}  synonymIdList - {ja: [synonym], en: [synonym]} 
   * @return {Boolean} - true: unique, false: non-unique
   */
   isUniqueIdofUri(currentNode, language, idofuri, synonymIdList) {// id, lang
    if (!idofuri) {
      return false;
    }

    const uri_prefix = this.getUriPrefix();
    // candidate uri
    const candUri = uri_prefix + idofuri;
    const synonymIdListAllLangWithMe = [currentNode.id, ...synonymIdList['ja'], ...synonymIdList['en']];
    const safeUri = new Set();
    // initial state A1 have no synonym, B1, B2, B3 are synonym, which have same uri_b.
    // current term A1, added synonym B1, B2, but B3 is not added as synonym of A1.
    // safeUri should be uri of A1. not uri_b.
    const uriList = [];
    const uriSet = new Set();
    synonymIdListAllLangWithMe.forEach((id1)=>{
      const foundObj = this.editingVocWithId.get(id1);
      uriList.push(foundObj.uri);
      uriSet.add(foundObj.uri);
    }, this);
    // delete uri_b from goal in the case of the above situation.
    uriSet.forEach((uri2)=>{
      const numOfSameUri = uriList.filter((uri3)=> uri3 === uri2).length;
      // find B1, B2 from the viewpoint of count
      if(numOfSameUri === this.uri2synoid[0].get(uri2).size){
        safeUri.add(uri2);
      }
    }, this);

    synonymIdListAllLangWithMe.forEach((id1)=>{
      const foundObj = this.editingVocWithId.get(id1);
      safeUri.add(foundObj.uri);
    }, this);
    
    // if the candidate uri is contained in the safeuri 
    if(safeUri.has(candUri)){
      // it is ok
      return true;
    }else{
      if(this.uri2synoid[0].has(candUri)){
        // other term have the candidate uri
        const idList = [...this.uri2synoid[0].get(candUri)];
        this.equalUriPreferredLabel = '';
        if( idList.length > 0){
          idList.some((id)=>{
            const _item = this.editingVocWithId.get(id);
            if( _item.hidden===false && _item.language=== language){
              this.equalUriPreferredLabel = _item.term;
              return true; // same role as break
            }else if( _item.hidden===false && this.equalUriPreferredLabel===''){
              this.equalUriPreferredLabel = _item.term;
            }
          })
        }
        return false;
      }else{
        return true;
      }
    }
  }



  // ID of URI //////////////////////
  /**
   * Create ID of URI list for screen display
   * @return {Array} - ID of URI list
   */
   @observable tmpIdofUri = {
    id: '',
    list: [],
  };

  /**
   * ID of URI update event
   * @param  {string} newValue ID of URI
   */
   @action updataIdofUri(newValue) {
    const array = [];

    // // Add IdofURI received from component to list
    // if (newValue !== '') {
    //   array.push(newValue);
    // }
    if (this.currentNode.term) {
      newValue.forEach((idofuri1) => {
        array.push(idofuri1);
      });
    } else {
      if (this.tmpPreferredLabel.list[this.tmpLanguage.value].length > 0) {
        // Do not add terms that are not selected and have no title to the broader term
        newValue.forEach((idofuri1) => {
          array.push(idofuri1);
        });
      }
    } 

    this.tmpIdofUri.id = this.currentNode.id;
    this.tmpIdofUri.list = array;
  }

  /**
   * Delete and update the end of the uriofid list being edited
   */
   @action popIdofUri() {
    const newArray = [];
    this.tmpIdofUri.list.forEach((data) => {
      newArray.push(data);
    });
    newArray.pop();
    this.updataIdofUri(newArray);
  }


  // Broader Term //////////////////////
  @observable tmpBroaderTerm = {
    id: '',
    list: {ja:[], en:[]},
    broader_uri: '',
  };

  /**
   * Broader term update event
   * @param  {string} newValue - list of broader term whose length 0 or 1 
   * @param  {string} language - language for the terms 
   * @param  {string} newValueUri - broader uri
   */
  @action updateBroaderTerm(newValue, language, newValueUri='') {
    // newValue must be one string or empty
    if(newValue.length===0){
      // clear tmpBroaderTerm
      this.tmpBroaderTerm.id = this.currentNode.id; 
      this.tmpBroaderTerm.list['ja'] = [];
      this.tmpBroaderTerm.list['en'] = [];
      this.tmpBroaderTerm.broader_uri = '';
      return;
    };

    if(newValueUri === ''){
      //DEBUG
      console.assert(false, "something is wrong 9");
      // find newValue-term's uri
      const targetId = this.getIdbyTermandLang(newValue[0], language);
      const find = this.editingVocWithId.get( targetId)
      if(find !== undefined){newValueUri = find.uri};
    }

    const otherLanguage = language === 'ja' ? 'en': 'ja';
    const otherLangTerm = this.uri2preflabel[0][otherLanguage][newValueUri];

    this.tmpBroaderTerm.id = this.currentNode.id; 
    this.tmpBroaderTerm.list[language] = newValue;
    if(otherLangTerm !== undefined){
      this.tmpBroaderTerm.list[otherLanguage] = [otherLangTerm];
    }else{
      this.tmpBroaderTerm.list[otherLanguage] = [];
    }
    this.tmpBroaderTerm.broader_uri = newValueUri;
  }

  /**
   * Delete and update the end of the list of top words being edited
   */
  @action popBroaderTerm() {
    const newArray = [];
    this.tmpBroaderTerm.list[this.tmpLanguage.value].forEach((data) => {
      newArray.push(data);
    });
    newArray.pop();
    this.updateBroaderTerm(newArray);
  }

  /**
   * Determine if broader term does not exist in the synonym or is not the term
   * @param  {object}  currentNode - check target node
   * @param  {String}  broaderTerm - broader term
   * @return {Boolean} - true: valid, false: invalid
   */
  @action isBroaderInSynonym(term, language, broaderTerm) {
    const synonymSet = new Set([...this.tmpSynonym.list[language]]);
    if(term !== ''){
      synonymSet.add(term);
    }
    if(synonymSet.has(broaderTerm)){
      return true; 
    }else{
      return false;
    }
  }

  /**
 * Determine if a broader term is looping
 * @param  {object}  currentNode - check target node
 * @param  {String}  broaderTerm - broader term
 * @return {Boolean} - true: loop (invalid), false: not a loop
 */
  @action isCyclicBroaders(currentNode, broaderTerm, broader_uri) {
    if(broader_uri ===''){
      this.cycleBroaderTerm = [];
      return false;
    }
 
    const displayLanguage = this.tmpLanguage.value;
    const otherLanguage = displayLanguage === 'ja'? 'en' : 'ja';

    const cycleBroaderTerm = []; // list of preflabels.
    const goalUri = new Set();
    
    let foundBrodId = [...this.uri2synoid[0].get(broader_uri)][0];
    const foundBroadObj = this.editingVocWithId.get(foundBrodId);
    
    // initialization
    let pref1 = '';
    if(this.tmpPreferredLabel.list[displayLanguage].length !== 0){
      pref1 = this.tmpPreferredLabel.list[displayLanguage][0];
    }else{
      pref1 = this.tmpPreferredLabel.list[otherLanguage][0];
    }
    cycleBroaderTerm.push(pref1);  
    // goal uris
    // current uri is changed from the text field form. But no term have the changed uri as broader_uri at this time
    // const uri_prefix = this.getUriPrefix();
    // const uri1 = uri_prefix + this.tmpIdofUri.list[0];
    // goalUri.add(uri1);
    // collect uri from the tmpSynonym
    const synonymIdWithMe = [currentNode.id, ...this.tmpSynonym.idList['ja'], ...this.tmpSynonym.idList['en']]; 
    // initial state A1 have no synonym, B1, B2, B3 are synonym, which have same uri_b.
    // current term A1, added synonym B1, B2, but B3 is not added as synonym of A1.
    // goalUri should be uri of A1.
    const myuri = currentNode.uri;
    const uriList = [];
    const uriSet = new Set();
    synonymIdWithMe.forEach((id1)=>{
      const foundObj = this.editingVocWithId.get(id1);
      uriList.push(foundObj.uri);
      uriSet.add(foundObj.uri);
    }, this);
    // delete uri_b from goal in the case of the above situation.
    uriSet.forEach((uri2)=>{
      if(uri2 == myuri){
        goalUri.add(uri2);
      }else{
        const numOfSameUri = uriList.filter((uri3)=> uri3 === uri2).length;
        // find B1, B2 from the viewpoint of count
        if(numOfSameUri === this.uri2synoid[0].get(uri2).size){
          goalUri.add(uri2);
        }
      }
    }, this);

    // loop
    let continueFlag = true;
    let isLoop = false;
    // let nextBroaderUri = this.tmpBroaderTerm.broader_uri;
    let nextBroaderUri = foundBroadObj.uri;
    do{
      // get id from uri2synoid. get the first id from the synonym list 
      // this slightly mysterious syntax is from
      // https://stackoverflow.com/questions/32539354/how-to-get-the-first-element-of-set-in-es6-ecmascript-2015
      const [id2] = this.uri2synoid[0].get(nextBroaderUri);
      // get data from id, and get broader_uri from the data
      const foundObj = this.editingVocWithId.get(id2);
      // push preferred label
      let pref2;
      if(undefined !== this.uri2preflabel[0][displayLanguage][foundObj.uri]){
        pref2 = this.uri2preflabel[0][displayLanguage][foundObj.uri];
      }else{
        pref2 = this.uri2preflabel[0][otherLanguage][foundObj.uri];
      }
      cycleBroaderTerm.push(pref2);

      if(foundObj.broader_uri !==''){
        // it have broader
        if(goalUri.has(foundObj.broader_uri)){
          // it is loop
          isLoop = true;
          continueFlag = false;
        }else{
          // next broader
          nextBroaderUri = foundObj.broader_uri;
        }
      }else{
        // it is the root
        isLoop = false;
        continueFlag = false;
      }
    } while (continueFlag);

    this.cycleBroaderTerm = cycleBroaderTerm;
    return isLoop;
  }


  /**
   * Determine whether URIs between broader terms are common
   * @param  {object}  currentNode - check target node
   * @param  {String}  broaderTerm - broader term
   * @return {Boolean} - true: valid, false: invalid(synonym)
   */
  @action isValidSynonymBrdrTrm(currentNode, broaderTerm){
    
    let ret = true;
    const tmpBroaderTerm_j = currentNode.language=='ja'?broaderTerm:this.tmpBroaderTerm.list['ja'][0];
    const tmpBroaderTerm_e = currentNode.language=='en'?broaderTerm:this.tmpBroaderTerm.list['en'][0];

    const findJaId = this.getIdbyTermandLang(tmpBroaderTerm_j, 'ja');
    const find_j = this.editingVocWithId.get(findJaId);
    const findEnId = this.getIdbyTermandLang(tmpBroaderTerm_e, 'en');
    const find_e = this.editingVocWithId.get(findEnId);
    if( (findJaId !== undefined) && (findEnId !== undefined) && find_j.uri != find_e.uri){
      ret = false;
    }
    return ret;
  }

  // Synonym //////////////////////
  @observable tmpSynonym = {
    id: '',
    list: {ja:[], en:[]},
    idList: {ja:[], en:[]},
  };

  /**
   * Synonym update event
   * @param  {string} newValues - synonym
   */
  @action updateSynonym(newValues) {

    const displayLanguage = this.tmpLanguage.value;
    const otherLanguage = this.tmpLanguage.value=='ja'?'en':'ja';

    let isAdded = false;
    let isDeleted = false;
    if(newValues.length > this.tmpSynonym.list[displayLanguage].length){
      // term is added
      isAdded = true;
    }else if(newValues.length < this.tmpSynonym.list[displayLanguage].length){
      // term is deleted
      isDeleted = true;
    }

    if(isAdded){
      let id_disp = []; // this includes newly added term id
      let id_other = [];
      let ids_at_input = []; // ids at input for all language
      let addedId;

      // determine which term is added
      newValues.forEach((term)=>{
        const id1 = this.getIdbyTermandLang(term, displayLanguage);
        if(!this.tmpSynonym.idList[displayLanguage].includes(id1)){
          // this is the added term
          addedId = id1;
        }
      }, this);
      id_disp = this.tmpSynonym.idList[displayLanguage].concat();//copy
      id_other = this.tmpSynonym.idList[otherLanguage].concat(); // copy
      // withme
      if(this.currentNode.language === displayLanguage){
        id_disp.push(this.currentNode.id);
      }else{
        id_other.push(this.currentNode.id);
      }
      if(this.currentLangDiffNode.id !== null &
         this.currentLangDiffNode.language === displayLanguage){
          id_disp.push(this.currentLangDiffNode.id);
      }else if(this.currentLangDiffNode.id !== null &
          this.currentLangDiffNode.language === otherLanguage){
            id_other.push(this.currentLangDiffNode.id);
      }
      ids_at_input = [...id_disp, ...id_other];

      // collect synonyms for the added term if it is a new group
      const prevUriSet = new Set();
      ids_at_input.forEach((id2)=>{
        const dataObj = this.editingVocWithId.get(id2);
        prevUriSet.add(dataObj.uri);
      }, this);

      const addedData = this.editingVocWithId.get(addedId);
      if(!prevUriSet.has(addedData.uri)){
        // this is the new group
        const addedSynoId = this.uri2synoid[0].get(addedData.uri);
        // add new ids and terms
        addedSynoId.forEach((id3)=>{
          const dataObj = this.editingVocWithId.get(id3);
          if(!this.tmpSynonym.idList[dataObj.language].includes(id3)){
            this.tmpSynonym.idList[dataObj.language].push(id3);
            this.tmpSynonym.list[dataObj.language].push(dataObj.term);
          }
        }, this);

        // add pref for each language
        if(this.uri2preflabel[0]['ja'][addedData.uri] !== undefined){
          this.tmpPreferredLabel.list['ja'].push(this.uri2preflabel[0]['ja'][addedData.uri]);
        }
        if(this.uri2preflabel[0]['en'][addedData.uri] !== undefined){
          this.tmpPreferredLabel.list['en'].push(this.uri2preflabel[0]['en'][addedData.uri]);
        }

        // add broader for each language
        if(addedData.broader_uri !==''){
          if(this.uri2preflabel[0]['ja'][addedData.broader_uri] !== undefined){
            this.tmpBroaderTerm.list['ja'].push(this.uri2preflabel[0]['ja'][addedData.broader_uri])
          }
          if(this.uri2preflabel[0]['en'][addedData.broader_uri] !== undefined){
            this.tmpBroaderTerm.list['en'].push(this.uri2preflabel[0]['en'][addedData.broader_uri])
          }
          this.tmpBroaderTerm.broader_uri = addedData.broader_uri;
          // the broader_uri of tmpBroaderTerm must be unique (it is not be multiple), even if the term and uri is differernt
          // it will be resoleved at updateBroaderTerm
        }

        // add idofuri
        this.tmpIdofUri.list.push(addedData.idofuri);

        // add termdescription for each language
        addedSynoId.forEach((id4)=>{
          const dataObj = this.editingVocWithId.get(id4);
          if(this.tmpTermDescription.values[dataObj.language] === '' &&
            dataObj.term_description !== ''){
              this.tmpTermDescription.values[dataObj.language] = dataObj.term_description;
          }
        }, this);

        //add other vocs
        if(this.tmpOtherVocSynUri.list.length === 0 && addedData.other_voc_syn_uri !== '' ){
          this.tmpOtherVocSynUri.list.push(addedData.other_voc_syn_uri);
        }

      }else{
        this.tmpSynonym.idList[addedData.language].push(addedData.id);
        this.tmpSynonym.list[addedData.language].push(addedData.term);
      }
    }

    if(isDeleted){
      let deletedTerm;
      let deletedId;
      // determine which term is deleted
      this.tmpSynonym.idList[displayLanguage].forEach((id1)=>{
        const termData = this.editingVocWithId.get(id1);
        if(!newValues.includes(termData.term)){
          // this is the deleted term
          deletedTerm = termData.term;
          deletedId = id1;
        }
      }, this);
      // update tmpXXX variable
      let idlist = this.tmpSynonym.idList[displayLanguage].concat();
      idlist = idlist.filter((id2)=>{return id2 != deletedId});
      this.tmpSynonym.idList[displayLanguage] = idlist;
      let termlist = this.tmpSynonym.list[displayLanguage].concat();
      termlist = termlist.filter((term2)=>{return term2 != deletedTerm});
      this.tmpSynonym.list[displayLanguage] = termlist;
    }
    return;
  }
  /**
   * Delete and update the end of the synonym list you are editing
   */
  @action popSynonym() {
    const newArray = [];
    this.tmpSynonym.list[this.tmpLanguage.value].forEach((data) => {
      newArray.push(data);
    });
    newArray.pop();
    this.updateSynonym(newArray);
  }

  /**
   * synonyms must not be the subordinate terms
   * @param  {String}  term check target term
   * @param  {String}  language  
   * @param  {Array}  list synonymList
   * @return {Boolean}     true: narrower, false: not narrower
   */
   @action isNarrowerTerm(term, language, list) {
    
    const labelSet = new Set();
    list.forEach((synonym) => {
      labelSet.add(synonym);
    });

    this.tmpPreferredLabel.list[language].forEach((label) => {
      labelSet.add(label);
    });

    labelSet.add(term);

    const subTerm = new Set(this.calcSubordinateTerm(language));

    const intersection = new Set([...labelSet].filter((label) => (subTerm.has(label))));

    if (intersection.size !== 0) {
      return true;
    } else {
      return false;
    }
  }

  // preferred_label //////////////////////
  @observable tmpPreferredLabel = {
    id: '',
    list: {ja:[], en:[]},
  };
  // uri to preferred  
  // dictinary for uri to preferred_label
  // @observable uri2preflabel = {
  //   ja:{},
  //   en:{}
  // };
  // uri to preferred  
  // dictinary for uri to preferred_label. edit, ref1, ref2, ref3
  @observable uri2preflabel = [
    {
      ja:{},
      en:{}
    },
    {
      ja:{},
      en:{}  
    },
    {
      ja:{},
      en:{}  
    },
    {
      ja:{},
      en:{}  
    }
  ];


  /**
   * Preferred label update event
   * @param  {array} newValue - preferred label (string)
   * 
   */
  @action updataPreferredLabel(newValue) {

    const array = [];

    // Add preferred label received from component to the list
    newValue.forEach((term) => {
      array.push(term);
    });

    this.tmpPreferredLabel.id = this.currentNode.id;  // Setting 'this.currentNode' on purpose
    this.tmpPreferredLabel.list[this.tmpLanguage.value] = array.filter((val, i, self)=>{ return i === self.indexOf(val)});

    if( this.tmpPreferredLabel.list['ja'].length == 1){ // Japanese PreferredLabel takes precedence
      const foundId = this.getIdbyTermandLang(this.tmpPreferredLabel.list['ja'][0], 'ja');
      const foundObj = this.editingVocWithId.get(foundId);
      this.tmpIdofUri.list = [foundObj.idofuri];
      this.tmpIdofUri.id = this.currentNode.id;
    }else if(this.tmpPreferredLabel.list['ja'].length == 0 && this.tmpPreferredLabel.list['en'].length == 1){
      const foundId = this.getIdbyTermandLang(this.tmpPreferredLabel.list['en'][0], 'en');
      const foundObj = this.editingVocWithId.get(foundId);
      this.tmpIdofUri.list = [foundObj.idofuri];
      this.tmpIdofUri.id = this.currentNode.id;
    }
  }

  /**
   * Delete and update the end of the preferred label list being edited
   */
  @action popPreferredLabel() {
    const newArray = [];
    this.tmpPreferredLabel.list[this.tmpLanguage.value].forEach((data) => {
      newArray.push(data);
    });
    newArray.pop();
    this.updataPreferredLabel(newArray);
  }

  /**
   * Determine if a preferred label exist in the synonyms or is the term
   * @param  {object}  currentNode - check target node
   * @param  {string}  newValue - term set for the preferred label
   * @param  {string}  language - language
   * @return {Boolean} - true: valid, false: inappropriate
   */
  isValidPreferredLabel(currentNode, newValue, language) {
    if (currentNode.id !== null & !currentNode.hidden) {
      if (newValue === currentNode.term) {
        return true;
      }
    }
    // const find = this.tmpSynonym.list[language].some((synonym) => synonym === newValue);
    if (this.tmpSynonym.list[language].includes(newValue)){
      return true;
    } 

    return false;
  }

  // subordinateTerm //////////////////////
  /**
   * Create narrower term list for screen display
   * collect all subordinate terms under tmpSynonym for the display language
   * @return {Array} list of terms
   */
   @computed get tmpSubordinateTerm() {
    // for all terms in tmpPreferredLabel
    // they may have different uri
    // we collect terms whose broader_uri is one of the uris 
    const subordinateTermSet = new Set();

    const displayLanguage = this.tmpLanguage.value;
    const keyIdSet = new Set(this.tmpSynonym.idList[displayLanguage].concat()); // shallowcopy
    if(displayLanguage === this.currentNode.language){
      keyIdSet.add(this.currentNode.id);
    }else{
      if(null !== this.currentLangDiffNode.id){
        keyIdSet.add(this.currentLangDiffNode.id);
      }
    }
    if(this.selectedFile.id === 0){
      keyIdSet.forEach((id1)=>{
        // id to data
        const foundObj = this.editingVocWithId.get(id1);
        // uri 2 narrower
        const foundIdSet = this.uri2narrowid[0].get(foundObj.uri);
        if(undefined !== foundIdSet){
          // narrower terms are found
          foundIdSet.forEach((id2)=>{
            const foundObj1 = this.editingVocWithId.get(id2);
            if(foundObj1.language === displayLanguage){
              subordinateTermSet.add(foundObj1.preferred_label);
            }
          },this);
        }
      });  
    }else{
      const refid = this.selectedFile.id;
      keyIdSet.forEach((id1)=>{
        // id to data
        const foundObj = this.referenceVocWithId[refid].get(id1);
        // uri 2 narrower
        const foundIdSet = this.uri2narrowid[refid].get(foundObj.uri);
        if(undefined !== foundIdSet){
          // narrower terms are found
          foundIdSet.forEach((id2)=>{
            const foundObj1 = this.referenceVocWithId[refid].get(id2);
            if(foundObj1.language === displayLanguage){
              subordinateTermSet.add(foundObj1.preferred_label);
            }
          },this);  
        }
      }, this);
    }
    return [...subordinateTermSet];
  }
  /**
   * Create narrower term list for screen display
   * collect all subordinate terms under tmpSynonym for the display language
   * @param {String} language
   * @return {Array} list of terms
   */
  calcSubordinateTerm(language) {
    // for all terms in tmpPreferredLabel
    // they may have different uri
    // we collect terms whose broader_uri is one of the uris 
    const subordinateTermSet = new Set();

    const keyIdSet = new Set(this.tmpSynonym.idList[language].concat()); // shallowcopy
    if(language === this.currentNode.language){
      keyIdSet.add(this.currentNode.id);
    }else{
      if(null !== this.currentLangDiffNode.id){
        // the id is null if the currentNode have no other language synonym
        keyIdSet.add(this.currentLangDiffNode.id);
      }
    }
    if(this.selectedFile.id === 0){
      keyIdSet.forEach((id1)=>{
        // id to data
        const foundObj = this.editingVocWithId.get(id1);
        // uri 2 narrower
        const foundIdSet = this.uri2narrowid[0].get(foundObj.uri);
        if(undefined !== foundIdSet){
          // narrower terms are found
          foundIdSet.forEach((id2)=>{
            const foundObj1 = this.editingVocWithId.get(id2);
            if(foundObj1.language === language){
              subordinateTermSet.add(foundObj1.preferred_label);
            }
          },this);
        }
      });  
    }else{
      const refid = this.selectedFile.id;
      keyIdSet.forEach((id1)=>{
        // id to data
        const foundObj = this.referenceVocWithId[refid].get(id1);
        // uri 2 narrower
        const foundIdSet = this.uri2narrowid[refid].get(foundObj.uri);
        if(undefined !== foundIdSet){
          // narrower terms are found
          foundIdSet.forEach((id2)=>{
            const foundObj1 = this.referenceVocWithId[refid].get(id2);
            if(foundObj1.language === language){
              subordinateTermSet.add(foundObj1.preferred_label);
            }
          },this);  
        }
      }, this);
    }
    return [...subordinateTermSet];
  }
  

  // Term Description //////////////////////
  @observable tmpTermDescription = {
    id: '',
    values:{ ja:'', en:''},
  };

  /**
   * Term Description update event
   * @param  {string} newValue Term Description
   */
  @action updataTermDescription(newValue) {
    const array = [];

    const currentNode = this.tmpLanguage.value == this.currentNode.language ? this.currentNode: this.currentLangDiffNode;
 
    this.tmpTermDescription.id = currentNode.id;
    this.tmpTermDescription.values[currentNode.language] = newValue;
  }

  // Language //////////////////////
  @observable tmpLanguage = {
    id: '',
    value: 'ja',
  };

  // Created Time //////////////////////
  @observable tmpCreatedTime = {
    id: '',
    list: [],
  };

  // Modified Time //////////////////////
  @observable tmpModifiedTime = {
    id: '',
    list: [],
  };


  // Other Voc Syn Uri //////////////////////
  @observable tmpOtherVocSynUri = {
    id: '',
    list: [],
  };

  // confirm //////////////////////
  // Confirmed color information
  // The confirmed color information is stored in color2 in each term data of the editing vocabulary data,
  // but since it becomes the same information, it is managed by confirmColor in app
  @observable confirmColor = 'green';

  /**
   * Get confirmed color information from editing vocabulary data
   * Use only when editing vocabulary is retrieved from DB
   */
  initConfirmColor() {
    const confirmList =
      this.editingVocabulary.filter((data) => data.confirm == 1);

    if (confirmList.length > 0) {
      // console.log('confirm term is ' + confirmList.length);
      const confirmColor = confirmList[0].color2;
      // console.log('confirm color is ' + confirmColor);
      confirmList.forEach((data) => {
        if (data.color2 !== confirmColor) {
          console.log('discord confirm color. term: ' +
            data.term + ', color: ' + data.color2);
        }
      });
      this.confirmColor = confirmColor;
    } else {
      // If there is no confirmation information, the color information held temporarily is taken over
    }
  }

  /**
   * Confirmed color change request
   * Update color information for all confirmed terms and reflect it in the DB
   * @param  {String} color - confirmed color
   * @param  {Boolean} [isHistoryOp=false] - modified by undo/redo ?
   */
  seletConfirmColor(color = this.confirmColor, isHistoryOp = false) {
    console.log('[updateConfirmColor] change to ' + color);
    if (!color) return;
    // const confirmList = this.editingVocabulary;
    const confirmList = this.editingVocabulary.filter((data) =>
      data.confirm == 1);

    // const updateCurrent = this.currentNode;
    confirmList.forEach((data) => {
      data.color2 = color;
    });

    if (confirmList.length == 0) {
      console.log('confirm color can not changed. editingVocabulary is empty.');
      this.confirmColor = color;
      return;
    }

    const history = new History('confirmColorChanged');
    history.previous = this.confirmColor;
    history.following = color;

    const url = '/api/v1/vocabulary/editing_vocabulary/' + 'term';
    axios
        .post(url,
            confirmList,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
        )
        .then((response) => {
          console.log('request url:' + url + ' come response.');
          this.updateEditingVocabularyData(response.data);

          if (!(isHistoryOp)) {
            editingHistoryStore.addHistory(history);
          }
        }).catch((err) => {
          console.log('[Error] message : ' + err.message);
          let errMsg = '';
          let errCode = -1;
          // If there is a response
          if (err.response) {
            errCode = err.response.status;
            switch (errCode) {
              case 400:
              case 404:
                // For errors defined in the API
                if (err.response.data.message) {
                  errMsg = err.response.data.message;
                } else {
                  errMsg = '不明なエラー発生';
                }
                break;
              default:
                errMsg = '不明なエラー発生';
                break;
            }
          } else {
            errMsg = err.message;
          }
          this.openApiErrorDialog('色情報変更エラー', errCode, errMsg);
        });
  }

  /**
   * Confirm change request
   * Switching term setting ON/OFF
   * @param  {number} id - confirmed term's id
   * @param  {Boolean} isConfirm - confirm ON/OFF
   * @param  {Boolean} [isHistory=false] - modified by undo/redo ?
   */
  toggleConfirmById(id, isConfirm, isHistoryOp = false) {
    const currentNode = this.editingVocWithId.get(id);    
    if (currentNode === undefined) {
      console.log('term with id=' + id + ' is not found from editingVocabulary.');
      return;
    }
    let targetList = [];
    const synoidWithMe = [...this.uri2synoid[0].get(currentNode.uri)];
    synoidWithMe.forEach((id1)=>{
      const foundObj = this.editingVocWithId.get(id1);
      const dataObj = this.copyData(foundObj);
      if (isConfirm) {
          dataObj.confirm = 1;
          dataObj.color2 = this.confirmColor;
        } else {
          dataObj.confirm = 0;
          dataObj.color2 = this.confirmColor;
        }
      targetList.push(dataObj);
    }, this);

    const history = new History(
        'confirmChanged',
        currentNode.id,
        null,
        !isConfirm,
        isConfirm,
    );

    const url = '/api/v1/vocabulary/editing_vocabulary/' + 'term';
    axios
        .post(url,
            targetList,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
        )
        .then((response) => {
          this.updateEditingVocabularyData(response.data);
          // console.log('request url:' + url + ' come response.');
          // Reselect to reset tmp information
          this.setCurrentNodeById(currentNode.id, true);
          if (!(isHistoryOp)) {
            editingHistoryStore.addHistory(history);
          }
        }).catch((err) => {
          console.log('[Error] message : ' + err.message);
          let errMsg = '';
          let errCode = -1;
          // If there is a response
          if (err.response) {
            errCode = err.response.status;
            switch (errCode) {
              case 400:
              case 404:
                // For errors defined in the API
                if (err.response.data.message) {
                  errMsg = err.response.data.message;
                } else {
                  errMsg = '不明なエラー発生';
                }
                break;
              default:
                errMsg = '不明なエラー発生';
                break;
            }
          } else {
            errMsg = err.message;
          }
          this.openApiErrorDialog('色情報変更エラー', errCode, errMsg);
        });
  }
}

const editingVocabularyStore = new EditingVocabulary();
export default editingVocabularyStore;
