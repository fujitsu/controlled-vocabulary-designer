/**
 * EditingVocabulary.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import {action, computed, observable} from 'mobx';
import axios from 'axios';

import _ from 'lodash'

import editingHistoryStore from './EditingHistory';
import History from './History';

import editingVocabularyMetaStore from './EditingVocabularyMeta';

// console.log(editingVocabularyMetaStore);

/**
 * Vocabulary data management class
 */
class EditingVocabulary {
  // Editing vocabulary
  @observable editingVocabulary = [];
  // Reference vocabulary 1
  @observable referenceVocabulary1 = [];
  // Reference vocabulary 2
  @observable referenceVocabulary2 = [];
  // Reference vocabulary 3
  @observable referenceVocabulary3 = [];

  // Array for selected term on Visual vocabulary Tab
  @observable selectedTermList = [];

  /**
   * Set deselected term array
   */
  @action deselectTermList(){
    this.selectedTermList = [];
    this.cyDeselect();
  }
  /**
   * Set selected term array
   */
  @action setSelectedTermList( term){
    let ret = false;
    let selectedTermList = this.selectedTermList;      
    const termListForVocabulary = this.termListForVocabulary;
    const selectedID = Number(this.getNodeIdByTerm( termListForVocabulary , term));
    const tmpSelectedTermList = selectedTermList.filter((item)=>{
      return item.id != selectedID;
    })

    if(tmpSelectedTermList.length == selectedTermList.length){
      selectedTermList=[ ...selectedTermList, {
        'id': selectedID, 
        'term': term,
      }];
      ret = true;
    }else{
      selectedTermList=tmpSelectedTermList;
    }    
    this.selectedTermList = selectedTermList;
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
          if (0 == this.selectedFile.id) {
            this.currentNodeClear();
            this.tmpDataClear();
            this.deselectTermList();
            editingHistoryStore.initUndoStack();
          }
          this.resetLayoutForVocTab();
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
  initializeEditingVocabularyData(dbData) {
    this.uri2preflabel['ja'] = {};
    this.uri2preflabel['en'] = {};
    dbData.forEach( (data) => {
      // Make dictionary {uri: preferred_label} 
      if (data.preferred_label && data.uri && data.language) {
        if (data.language === 'ja') { // If the language is Japanese
          this.uri2preflabel['ja'][data.uri] = data.preferred_label;
        } else { // If the language is English
          this.uri2preflabel['en'][data.uri] = data.preferred_label;
        }
      }
    });
    const editingVocabulary = this.calcEditingVocValues(dbData, this.uri2preflabel['ja'], this.uri2preflabel['en']) ;

    this.editingVocabulary = editingVocabulary;
    this.initConfirmColor();
  }

  /**
   * Editing vocabulary data update
   * @param {array} dbData - list of editing vocabulary
   */
  updateEditingVocabularyData(dbData) {
    // make id_list with whome terms are updated
    let id_list=[];
    for( let item of dbData){
      id_list.push(item.id);
    };

    // filter unrelated terms
    let unChangeVocabulary = this.editingVocabulary.filter((item) => {return (!id_list.includes(item['id']))}) ;

    this.uri2preflabel['ja'] = {};
    this.uri2preflabel['en'] = {};
    dbData.forEach( (data) => {
      // Make dictionary {uri: preferred_label} 
      if (data.preferred_label && data.uri && data.language) {
        if (data.language === 'ja') { // If the language is Japanese
          this.uri2preflabel['ja'][data.uri] = data.preferred_label;
        } else { // If the language is English
          this.uri2preflabel['en'][data.uri] = data.preferred_label;
        }
      }
    });
    unChangeVocabulary.forEach( (data) => {
      // Make dictionary {uri: preferred_label} 
      if (data.preferred_label && data.uri && data.language) {
        if (data.language === 'ja') { // If the language is Japanese
          // uri_preferred_label_ja[data.uri] = data.preferred_label;
          this.uri2preflabel['ja'][data.uri] = data.preferred_label;
        } else { // If the language is English
          // uri_preferred_label_en[data.uri] = data.preferred_label;
          this.uri2preflabel['en'][data.uri] = data.preferred_label;
        }
      }
    });

    // calculate values to update
    const updatedEditingVocabulary = this.calcEditingVocValues(dbData, this.uri2preflabel['ja'], this.uri2preflabel['en']) ;

    this.editingVocabulary = unChangeVocabulary.concat(updatedEditingVocabulary);
    this.initConfirmColor();
  }

  /**
   * Calculate Editing vocabulary data to update
   * @param {array} dbData - list of editing vocabulary
   * @param {dictinary} uri_preferred_label_ja
   * @param {dictinary} uri_preferred_label_en
   */
  calcEditingVocValues(dbData, uri_preferred_label_ja, uri_preferred_label_en) {
    // calculate values to update
    const editingVocabulary = [];

    dbData.forEach( (data) => {
      // Convert broader_uri into broader_term
      if (data.language === 'ja'){ // If the language is Japanese
        if (uri_preferred_label_ja[data.broader_uri] != undefined) {
          if((data.broader_uri.indexOf("http://") != -1) || (data.broader_uri.indexOf("https://") != -1)) {
            data.broader_term = uri_preferred_label_ja[data.broader_uri];
          }else{
            console.assert(false, 'WARINING 111');
          }
        }else{
          data.broader_term = '';
        }
      }else { // If the language is English
        if (uri_preferred_label_en[data.broader_uri] != undefined) {
          if((data.broader_uri.indexOf("http://") != -1) || (data.broader_uri.indexOf("https://") != -1)) {
            data.broader_term = uri_preferred_label_en[data.broader_uri];
          }else{
            console.assert(false, 'WARINING 222');
          }
        }else{
          data.broader_term = '';
        }
      } 
      
      data.idofuri = data.uri.substring(data.uri.lastIndexOf('/')+1);

      // // If the parameter is not string (Set the empty string character)
      // if (!data.preferred_label) data.preferred_label = '';
      // if (!data.language) data.language = '';
      // if (!data.uri) data.idofuri = '';
      // if (!data.uri) data.uri = '';
      // if (!data.broader_term) data.broader_term = '';
      // if (!data.other_voc_syn_uri) data.other_voc_syn_uri = '';
      // if (!data.term_description) data.term_description = '';
      // if (!data.created_time) data.created_time = '';
      // if (!data.modified_time) data.modified_time = '';
      // if (!data.position_x) data.position_x = '';
      // if (!data.position_y) data.position_y = '';
      // if (!data.color1) data.color1 = '';
      // if (!data.color2) data.color2 = '';
      // If the parameter is not string (Set the empty string character)
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
   * @return {array} - initialized list of reference vocabulary
   */
  setReferenceVocabularyData(dbData) {
    const referenceVocabulary = [];
    const uri_preferred_label = {};
    dbData.forEach( (data) => {
      // Make dictionary {uri: preferred_label}
      if (data.preferred_label && data.uri) {
          uri_preferred_label[data.uri] = data.preferred_label;
        }
    });

    dbData.forEach( (data) => {
      // Convert broader_uri into broader_term
      if (uri_preferred_label[data.broader_uri] != undefined) {
        if((data.broader_uri.indexOf("http://") != -1) || (data.broader_uri.indexOf("https://") != -1)) {
          data.broader_term = uri_preferred_label[data.broader_uri];
        }
      } else if (data.broader_uri != null) {
        if ((data.broader_uri.indexOf("http://") != -1) || (data.broader_uri.indexOf("https://") != -1)) {
          data.broader_term = '';
        }
      }

      data.idofuri = data.uri.substring(data.uri.lastIndexOf('/')+1);

      // If the parameter is not string (Sets the empty string character)
      // if (!data.preferred_label) data.preferred_label = '';
      // if (!data.language) data.language = '';
      // if (!data.uri) data.idofuri = '';
      // if (!data.uri) data.uri = '';
      // if (!data.broader_term) data.broader_term = '';
      // if (!data.other_voc_syn_uri) data.other_voc_syn_uri = '';
      // if (!data.term_description) data.term_description = '';
      // if (!data.created_time) data.created_time = '';
      // if (!data.modified_time) data.modified_time = '';
      if (undefined == data.preferred_label) console.assert(false, "refdatapref");
      if (undefined == data.language) console.assert(false, "refdatalang");
      if (undefined == data.uri) console.assert(false, "refdatauri");
      if (undefined == data.other_voc_syn_uri) console.assert(false, "refdataothervoc");
      if (undefined == data.term_description) console.assert(false, "refdatadesc");
      if (undefined == data.created_time) console.assert(false, "refdatacreatt");
      if (undefined == data.modified_time) console.assert(false, "refdatamodt");
      if (undefined == data.position_x) console.assert(false, "refdataposx");
      if (undefined == data.position_y) console.assert(false, "refdataposy");
      if (undefined == data.color1) console.assert(false, "refdataco1");
      if (undefined == data.color2) console.assert(false, "refdataco2");

      referenceVocabulary.push(data);
    });

    return referenceVocabulary;
  }

  /**
   * Get reference vocabulary data
   * @param {number} param 1 or 2 or 3
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
                    response.data.ReferenceVocabulary,
                );
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
                    response.data.ReferenceVocabulary,
                );
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
                    response.data.ReferenceVocabulary,
                );
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
          if (undefined !=
              this.currentNode.broader_term_candidate.find((broaderTerm) =>
                broaderTerm == term)) {
            str += 'AI ';
          }
          if (undefined !=
              this.referenceVocabulary1.find((node) =>
                node.broader_term == term)) {
            str += '参照用語彙1 ';
          }
          if (undefined !=
              this.referenceVocabulary2.find((node) =>
                node.broader_term == term)) {
            str += '参照用語彙2 ';
          }
          if (undefined !=
              this.referenceVocabulary3.find((node) =>
                node.broader_term == term)) {
            str += '参照用語彙3 ';
          }
          break;
        case 'Synonym':
          if (undefined !=
              this.currentNode.synonym_candidate.find((synonym) =>
                synonym == term)) {
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
    this.resetLayoutForVocTab();
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
   * Is there a broadterm in the diff language
   * @param {object} node node
   * @return {bool} exist=targetNode / nothing=false
   */
  isExistDiffBroaderTerm( node){
    const termListForVocabulary = this.termListForVocabulary;
    let broaderTermObj= termListForVocabulary.find((item) => {
      return item.data.uri == node.data.uri &&
      item.data.language != node.data.language
    })
    if( !broaderTermObj) return false;

    broaderTermObj= termListForVocabulary.find((item) => {
      return item.data.term == broaderTermObj.broader_term
    })
    return broaderTermObj?broaderTermObj:false;
  }

  /**
   * Is there a preferredterm in the diff language
   * @param {object} node node
   * @return {bool} exist=targetNode / nothing=false
   */
  isExistDiffPreferredTerm( node){
    const termListForVocabulary = this.termListForVocabulary;
    let ret=false;
    termListForVocabulary.forEach((item) => {
      if( item.data.uri == node.data.uri && 
          item.data.term == item.data.preferred_label &&
          item.data.language != node.data.language){
            ret =true;
      }
    })
    return ret;
  }

  /**
   * edgesList generation computed
   * @return {array} EdgesList for the visualization screen panel vocabulary tab
   */
  @computed get edgesList() {
    const termListForVocabulary = this.termListForVocabulary;

    const broaderTermEdges = [];
    const synonymEdges = [];

    termListForVocabulary.forEach((node) => {
      // Broader term edge data
      if (node.broader_term) {
        // Is there a broadterm in the diff language
        const find = this.isExistDiffBroaderTerm(node);
        const drawEdge = node.data.language=='ja'?true: !find;
        if (!node.data.preferred_label) {
          // A vocabulary without a preferred label is an independent vocabulay without synonyms and so is mapped as a broader term
          const sourceId =
            this.getNodeIdByTerm(termListForVocabulary, node.broader_term);
          if ( '' != sourceId && drawEdge ) {
            broaderTermEdges.push({
              data: {
                type: 'broader_term',
                target: node.data.id,
                source: sourceId,
                label: '',
                arrow: 'triangle',
              },
              classes: ['broader_term'],
            });
          }
        } else {
          // Create edge data for preferred term with broader term
          if (node.data.term == node.data.preferred_label) {
            const sourceId =
              this.getNodeIdByTerm(termListForVocabulary, node.broader_term);
            if ( '' != sourceId && drawEdge ) {
              broaderTermEdges.push({
                data: {
                  type: 'broader_term',
                  target: node.data.id,
                  source: sourceId,
                  label: '',
                  arrow: 'triangle',
                },
                classes: ['broader_term'],
              });
            }
          }
        }
      }

      // Synonym edge data
      if (node.data.preferred_label) {
        // Extract vocabulary with same preferred term (= Synonym)
        const synonymList =
            termListForVocabulary.filter( (data) =>
              data.data.uri == node.data.uri );
        if (undefined != synonymList) {
          synonymList.forEach( (synonym) => {
            if (synonym.data.id != node.data.id) {
              // Add to EdgesList if not already registered
              const find =
                synonymEdges.find( (edge) =>
                  this.isSynonymExist(
                      edge, synonym.data.id, node.data.id) == true);
              if (undefined == find) {
                // Do not create edges for non-preferred terms (synonymous)
                
                let langDiffPreferredNode = node.data.language=='ja'?false:this.isExistDiffPreferredTerm(node);
                if (node.data.term === node.data.preferred_label && !langDiffPreferredNode) {
                  synonymEdges.push({
                    data: {
                      type: 'synonym',
                      target: synonym.data.id,
                      source: node.data.id, label: '',
                    },
                    classes: ['synonym'],
                  });
                }
              }
            }
          });
        }
      }
    });

    return [...broaderTermEdges, ...synonymEdges];
  }

  /**
   * Duplicate checking of synonym edge
   * @param  {object}  edge - edge object
   * @param  {string}  target - vocabulary
   * @param  {string}  source - vocabulary
   * @return {Boolean} - true: contain duplicates, false: not contain duplicates
   */
  isSynonymExist(edge, target, source) {
    if ((edge.data.target == source)&&(edge.data.source == target)) return true;
    if ((edge.data.target == target)&&(edge.data.source == source)) return true;
    return false;
  };

  /**
   * Get the ID associated with the term
   * @param  {array} targetList - list of vocabulary data
   * @param  {string} term - vocabulary
   * @return {number} - id
   */
  getNodeIdByTerm(targetList, term) {
    let id = '';
    targetList.forEach((node) => {
      if (node.data.term == term) id = node.data.id;
    });
    return id;
    // return Number(id); // is this?????
  }

  /**
   * Get the vocabulary associated with currentNode registered in the editing and reference vocabulary (De-duplication, sorted)
   * @param {string} type 'broader_term' or 'Synonym'
   * @return {array} - list of related term
   */
  @action getCandidateTermList(type) {
    let list = [];
    if ((0 == this.selectedFile.id) && (this.currentNode.id)) {
      const referenceVocabularyList = [
        this.referenceVocabulary1,
        this.referenceVocabulary2,
        this.referenceVocabulary3,
      ];
      switch (type) {
        case 'broader_term':
          if (this.currentNode.broader_term_candidate) {
            this.currentNode.broader_term_candidate.forEach((term) => {
              if (list.indexOf(term) == -1) list.push(term);
            });
          }

          referenceVocabularyList.forEach((referenceVocabulary) => {
            // Search for the same term in the reference vocabulary
            const eqTerm =
                referenceVocabulary.find((refNode) =>
                  refNode.term == this.currentNode.term );
            if (eqTerm) {
              if (eqTerm.broader_term &&
                  (list.indexOf(eqTerm.broader_term) == -1)) {
                list.push(eqTerm.broader_term);
              }
            }
          });
          break;
        case 'Synonym':
          if (this.currentNode.synonym_candidate) {
            this.currentNode.synonym_candidate.forEach((term) => {
              if (list.indexOf(term) == -1) list.push(term);
            });
          }

          if (this.currentNode.preferred_label) {
            referenceVocabularyList.forEach((referenceVocabulary) => {
              // Search for the same term in the reference vocabulary
              const eqTerm = referenceVocabulary.find((refNode) =>
                refNode.term == this.currentNode.term );
              if (eqTerm) {
                // Extract terms from same heading
                const eqPreferredLabel = referenceVocabulary.filter((refNode) =>
                  refNode.preferred_label == eqTerm.preferred_label );
                eqPreferredLabel.forEach((node) => {
                  // The term is not a preferred label and other terms are extracted as synonyms
                  if (node.term && (list.indexOf(node.term) == -1)) {
                    if (node.term != node.preferred_label &&
                        node.term != this.currentNode.term) {
                      list.push(node.term);
                    }
                  }
                });
              }
            });
          }
          break;
        case 'preferred_label':
          referenceVocabularyList.forEach((referenceVocabulary) => {
            referenceVocabulary.forEach((refNode) => {
              // Search for the same term in the reference vocabulary
              const eqTerm = referenceVocabulary.find((refNode) =>
                refNode.term == this.currentNode.term );
              if (eqTerm) {
                // Extract terms from same preferred label
                const eqPreferredLabel = referenceVocabulary.filter((refNode) =>
                  refNode.preferred_label == eqTerm.preferred_label );
                eqPreferredLabel.forEach((node) => {
                  // Extract synonyms where term is not a preferred label (including oneself)
                  if (list.indexOf(node.term) == -1) {
                    if (node.term != node.preferred_label) {
                      list.push(node.term);
                    }
                  }
                });
              }
            });
          });
          break;
         case '':
          break;
        default:
          referenceVocabularyList.forEach((referenceVocabulary) => {
            referenceVocabulary.forEach((node) => {
              if (list.indexOf(node.term) == -1) list.push(node.term);
            });
          });
          break;
      }
    }
    list = list.filter((term)=>{
      return this.editingVocabulary.find( (data) => data.term === term)?true:false;
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
      //
      broader_term: '',
      synonymList: [],
      synonymIdList: [],
    };
  }
  /**
   * Initialization of data being edited
   *   Never clear ⇒ this.tmpLanguage = {id: '', list: ''};
   */
  tmpDataClear() {
    this.tmpIdofUri = {id: '', list: []};
    this.tmpUri = {id: '', list: []};
    this.tmpBroaderTerm = {id: '', list: {ja:[], en:[]}, broader_uri: ''};
    this.tmpSynonym = {id: '', list: {ja:[], en:[]}, idList: {ja:[], en:[]}};
    this.tmpPreferredLabel = {id: '', list: {ja:[], en:[]}};
    this.tmpOtherVocSynUri = {id: '', list: []};
    this.tmpTermDescription = {id: '', list: {ja:[], en:[]}};
    this.tmpCreatedTime = {id: '', list: []};
    this.tmpModifiedTime = {id: '', list: []};
    this.tmpBorderColor =
        {id: this.currentNode.id, color: this.currentNode.color1};
  }

  /**
   * Whether the selected term has been edited and is pending
   * @return {boolean} - true: contain changes, false: not contain changes
   */
  @computed get isCurrentNodeChanged() {

    if( !this.currentNode || !this.currentNode.id ){
      return false;
    }

    // Id of URI
    if (this.isIdofUriChanged()) {
      return true;
    }

    // URI ---> Not currently editable, no confirmation of changes
    // if (this.isUriChanged()) {
    //   return true;
    // }

    // Preferred label
    if (this.isPrfrdLblChanged()) {
      return true;
    }

    // Broader term
    if (this.isBrdrTermChanged()) {
      return true;
    }

    // Broader term
    if (this.isSynonymChanged()) {
      return true;
    }

    // Term description
    if (this.isTermDescriptionChanged()) {
      return true;
    }

    // Created time ---> Not currently editable, no confirmation of changes
    // if (this.isCreatedTimeChanged()) {
    //   return true;
    // }

    // Modified time ---> Not currently editable, no confirmation of changes
    // if (this.isModifiedTimeChanged()) {
    //   return true;
    // }

    // Other Voc Syn Uri ---> Not currently editable, no confirmation of changes
    // if (this.isOtherVocSynUriChanged()) {
    //   return true;
    // }

    return false;
  }

  /**
   * Determine if Id of URI is changed
   * @return {boolean} - true: contain changes, false: not contain changes
   */
   isIdofUriChanged() {
    if (this.currentNode.idofuri) {
      if (this.tmpIdofUri.list.length == 1) {
        if (this.currentNode.idofuri === this.tmpIdofUri.list[0]) {
          return false;
        } else {
          return true;
        }
      } else {
        // Modified if not one Id of URI being edited
        return true;
      }
    } else {
      if (this.tmpIdofUri.list.length == 0) {
        return false;
      } else {
        // If it is not set, even one is changed if it is being edited
        return true;
      }
    }
  }
  /**
   * Determine if URI is changed
   * @return {boolean} - true: contain changes, false: not contain changes
   */
  isUriChanged() {
    if (this.currentNode.uri) {
      if (this.tmpUri.list.length == 1) {
        if (this.currentNode.uri === this.tmpUri.list[0]) {
          return false;
        } else {
          return true;
        }
      } else {
        // Modified if not one URI being edited
        return true;
      }
    } else {
      if (this.tmpUri.list.length == 0) {
        return false;
      } else {
        // If it is not set, even one is changed if it is being edited
        return true;
      }
    }
  }

  /**
   * Determine if the heading has been changed
   * @return {boolean} - true: contain changes, false; not contain changes
   */
  isPrfrdLblChanged() {
    
    let ret = false;    
    [ this.currentNode, this.currentLangDiffNode].forEach((nodeObj)=>{
      if( nodeObj.language==''){
      }else if( this.tmpPreferredLabel.list[ nodeObj.language ].length > 1 ){ // 2
        ret =  true;
      }else if( this.tmpPreferredLabel.list[ nodeObj.language ].length == 1 ){ // 1
        if( this.tmpPreferredLabel.list[ nodeObj.language ][0] != nodeObj.preferred_label ){ ret =  true;}
      }else if( 1 > this.tmpPreferredLabel.list[ nodeObj.language ].length ){ // 0
        if( nodeObj.preferred_label != '' ){ ret =  true;}
      }
    });
    return ret;
  }

  /**
   * Determine if the broader term is changed
   * @return {boolean} - true: contain changes, false: not contain changes
   */
  isBrdrTermChanged() {
    let ret = false;    
    [ this.currentNode, this.currentLangDiffNode].forEach((nodeObj)=>{
      if( nodeObj.language==''){
      }else if( this.tmpBroaderTerm.list[ nodeObj.language ].length > 1 ){ // 2
        ret =  true;
      }else if( this.tmpBroaderTerm.list[ nodeObj.language ].length == 1 ){ // 1
        if( this.tmpBroaderTerm.list[ nodeObj.language ][0] != nodeObj.broader_term ){ ret =  true;}
      }else if( 1 > this.tmpBroaderTerm.list[ nodeObj.language ].length ){ // 0
        if( nodeObj.broader_term != '' ){ ret =  true;}
      }
    });
    return ret;
  }

  /**
   * Determine if synonyms are changed
   * @return {boolean} - true: contain changes, false: not contain changes
   */
  isSynonymChanged() {
    
    let ret = false;
    [ this.currentNode, this.currentLangDiffNode].forEach((nodeObj)=>{
      if( nodeObj.language==''){
      }else if (nodeObj.synonymList.length != this.tmpSynonym.list[nodeObj.language].length) {
        ret =  true;
      }else{          
        this.tmpSynonym.list[nodeObj.language].forEach((languageCurrent) => {
          const find = nodeObj.synonymList.find((tmp) => tmp == languageCurrent);
          if (!find) {
            ret =  true;
          }
        });
        nodeObj.synonymList.forEach((languageCurrent) => {
          const find = this.tmpSynonym.list[nodeObj.language].find((tmp) => tmp == languageCurrent);
          if (!find) {
            ret =  true;
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

   isTermDescriptionChanged() {
     
    let ret = false;    
    [ this.currentNode, this.currentLangDiffNode].forEach((nodeObj)=>{
      if( nodeObj.language==''){
      }else if( this.tmpTermDescription.list[ nodeObj.language ].length > 1 ){ // 2
        ret =  true;
      }else if( this.tmpTermDescription.list[ nodeObj.language ].length == 1 ){ // 1
        if( this.tmpTermDescription.list[ nodeObj.language ][0] != nodeObj.term_description ){ ret =  true;}
      }else if( 1 > this.tmpTermDescription.list[ nodeObj.language ].length ){ // 0
        if( nodeObj.term_description != '' ){ ret =  true;}
      }
    });
    return ret;
  }


/**
 * Determine if the created time has been changed
 * @return {boolean} - true: contain changes, false; not contain changes
 */
 isCreatedTimeChanged() {
  if (this.currentNode.created_time) {
    if (this.tmpCreatedTime.list.length == 1) {
      if (this.currentNode.created_time === this.tmpCreatedTime.list[0]) {
        return false;
      } else {
        return true;
      }
    } else {
      // Modified if not one is being edited
      return true;
    }
  } else {
    if (this.tmpCreatedTime.list.length == 0) {
      return false;
    } else {
      // If it is not set, even one is changed if it is being edited
      return true;
    }
  }
}

/**
 * Determine if the modified time has been changed
 * @return {boolean} - true: contain changes, false; not contain changes
 */
 isModifiedTimeChanged() {
  if (this.currentNode.modified_time) {
    if (this.tmpModifiedTime.list.length == 1) {
      const tmpModifiedTime = this.tmpModifiedTime.list[0];
      if (this.currentNode.modified_time === tmpModifiedTime) {
        return false;
      } else {
        return true;
      }
    } else {
      // Modified if not one is being edited
      return true;
    }
  } else {
    if (this.tmpModifiedTime.list.length == 0) {
      return false;
    } else {
      // If it is not set, even one is changed if it is being edited
      return true;
    }
  }
}

/**
 * Determine if the other voc syn uri has been changed
 * @return {boolean} - true: contain changes, false; not contain changes
 */
isOtherVocSynUriChanged() {
  if (this.currentNode.other_voc_syn_uri) {
    if (this.tmpOtherVocSynUri.list.length == 1) {
      if (this.currentNode.other_voc_syn_uri === this.tmpOtherVocSynUri.list[0]) {
        return false;
      } else {
        return true;
      }
    } else {
      // Modified if not one is being edited
      return true;
    }
  } else {
    if (this.tmpOtherVocSynUri.list.length == 0) {
      return false;
    } else {
      // If it is not set, even one is changed if it is being edited
      return true;
    }
  }
}

  /**
   * Select vocabulary
   * @param {number} id id
   * @param {array} [synonymList=null] - configuration synonym list
   * @param {boolean} [isForce=false] - forced selection
   */
  @action setCurrentNodeById(
    id , isForce = false) {
    let target = {};
    target = this.getTargetFileData(this.selectedFile.id).find((obj) => {
      return (obj.id == id);
    });

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

    const synonymNode =
        this.getTargetFileData(this.selectedFile.id).filter((node) =>
          node.language === this.currentNode.language &&
          node.uri === this.currentNode.uri
        );
    this.currentNode.synonymList =  [];
    this.currentNode.synonymIdList =  [];
    synonymNode.forEach((synonym) => {
      //if (synonym.term != this.currentNode.term) {
      if (synonym.id != this.currentNode.id) {
        this.currentNode.synonymList.push(synonym.term);
        this.currentNode.synonymIdList.push(synonym.id);
      }
    });

    this.tmpDataClear();

    this.tmpIdofUri = {id: this.currentNode.id, list:[]};
    this.tmpIdofUri.list.push(this.currentNode.idofuri);

    this.tmpUri = {id: this.currentNode.id, list:[]};
    this.tmpUri.list.push(this.currentNode.uri);
    
    this.tmpBroaderTerm = {id: this.currentNode.id, list:{ja:[], en:[]},  broader_uri: ''};
    if (this.currentNode.broader_uri) {
      if(this.uri2preflabel[this.currentNode.language][this.currentNode.broader_uri]){
        this.tmpBroaderTerm.list[this.currentNode.language].push(
          this.uri2preflabel[this.currentNode.language][this.currentNode.broader_uri]);  
      }
    }
    this.tmpBroaderTerm.broader_uri = this.currentNode.broader_uri;

    let preferredLabel;
    if (this.currentNode.preferred_label) {
      preferredLabel = this.currentNode.preferred_label;
    } else {
      // If a preferred label is not defined, display the term in the preferred label column
      // Do not add for determined terms
      if (this.currentNode.confirm == 0) {
        preferredLabel = this.currentNode.term;
      }
    }
    this.tmpPreferredLabel = {id: this.currentNode.id, list: {ja:[], en:[]}};
    if (preferredLabel) {
      this.tmpPreferredLabel.list[this.currentNode.language].push(preferredLabel);
    }

    this.tmpSynonym.list[this.currentNode.language] = this.currentNode.synonymList;
    this.tmpSynonym.idList[this.currentNode.language] = this.currentNode.synonymIdList;

    this.tmpTermDescription ={id: this.currentNode.id, list:{ja:[], en:[]}};
    if (this.currentNode.term_description) {
      this.tmpTermDescription.list[this.currentNode.language].push(this.currentNode.term_description);
    }

    this.tmpLanguage = {id: this.currentNode.id, list: this.currentNode.language};

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

    // Center the selected vocabulary in the visualization screen vocabulary tab and update each NodeStyle
    this.fitToCurrent();
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
   * Flag to move to the middle 
  * @param {boolean} flg true: move / false: not move
  * @return {boolean} Original setting value
  */
  centerMoveDisabled(flg = true) {
    let ret = true;
    if (this.visualVocRef.current) {
      ret = this.visualVocRef.current.centerMoveDisabled( flg);
    }
    return ret;
  }


  /**
   * Deselect all nodes in cytoscape in the visualization screen
   */
   cyDeselect() {
    if (this.visualVocRef.current) {
      this.visualVocRef.current.cyDeselect();
    }
  }  
  /**
   * Reset the layout of the visualization screen vocabulary tabs
   * (Update layout without taking over current pan, zoom)
   */
  resetLayoutForVocTab() {
    if (this.visualVocRef.current) {
      this.visualVocRef.current.doReset();
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
    let languageChangeNode = [];
    // select terms with otherlang and with same uri 
    this.getTargetFileData(this.selectedFile.id).forEach((data) => {
      if(data.uri == this.currentNode.uri &&
        data.language != this.currentNode.language ) {
        languageChangeNode.push(data);
      }
    }); 

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
      });
      const languageChangeNodeData = preferredNode || languageChangeNode[0];
      this.currentLangDiffNode  = languageChangeNodeData;

      const preferredlabel = [];
      const broaderterm = [];
      let broader_uri = '';
      const termdescription = [];
      const language = [];
    
      this.currentLangDiffNode.synonymList = otherlangsynonymList;
      this.currentLangDiffNode.synonymIdList = otherlangsynonymIdList;

      this.tmpSynonym.list[this.currentLangDiffNode.language] = otherlangsynonymList;
      this.tmpSynonym.idList[this.currentLangDiffNode.language] = otherlangsynonymIdList;

      if (languageChangeNodeData.preferred_label.length > 0) {
        preferredlabel.push(languageChangeNodeData.preferred_label);
      }

      if (undefined !== this.uri2preflabel[languageChangeNodeData.language][languageChangeNodeData.broader_uri]) {
        broaderterm.push(this.uri2preflabel[languageChangeNodeData.language][languageChangeNodeData.broader_uri]);        
      }
      broader_uri = languageChangeNodeData.broader_uri;

      if (languageChangeNodeData.term_description.length > 0) {
        termdescription.push(languageChangeNodeData.term_description);
      }

      language.push(languageChangeNodeData.language);

      let preferredLabel;
      if (this.currentNode.preferred_label) {
        preferredLabel = this.currentNode.preferred_label;
      } else {
        // If a preferred label is not defined, display the term in the preferred label column
        // Do not add for determined terms
        if (this.currentNode.confirm == 0) {
          preferredLabel = this.currentNode.term;
        }
      }
      if (preferredLabel) {
       this.tmpPreferredLabel.list[languageChangeNodeData.language] = preferredlabel;
      }

      this.tmpBroaderTerm.list[language] = broaderterm;
      this.tmpBroaderTerm.broader_uri = broader_uri;
      this.tmpTermDescription.list[language] = termdescription;
    }else{
      this.currentLangDiffNodeClear();
      this.currentLangDiffNode.language = this.currentNode.language=='ja'?'en':'ja';
    }
  }

  /**
   * Changing the color of related terms and vocabulary
   * @param  {string}  currentId - selected term id
   * @param  {string}  colorId - 'color1' or 'color2'
   * @param  {string}  tmpColor - color to change       
   * @param  {Boolean} [isHistory=false] - undo/redo
   */
  @action updateColor(currentId, colorId, tmpColor, isHistory = false) {

    const selectedTermList = this.selectedTermList;
    let responseData=null;
    if(isHistory){
      responseData = this.tmpUpdateColor(currentId, colorId, tmpColor, isHistory);
    }else{
      selectedTermList.forEach((item)=>{      
        responseData = this.tmpUpdateColor(item.id, colorId, tmpColor, isHistory);
      });
      const ret = this.centerMoveDisabled(true);
      this.setCurrentNodeById(currentId, true);
      this.centerMoveDisabled( ret);
    }  
  }

  tmpUpdateColor(currentId, colorId, tmpColor, isHistory = false) {
    const requestBody = [];

    const updateCurrent = this.editingVocabulary.find((data) =>
      data.id == currentId);

    if (!updateCurrent) {
      console.log('id: ' + currentId + 'is not found.');
      return;
    }
    const history = new History(colorId, currentId);

    if ('color1' == colorId) {
      history.previous = updateCurrent.color1;
      history.following = tmpColor;
      updateCurrent.color1 = tmpColor;
    } else { // color2
      history.previous = updateCurrent.color2;
      history.following = tmpColor;
      updateCurrent.color2 = tmpColor;
    }

    requestBody.push(updateCurrent);
    const url = '/api/v1/vocabulary/editing_vocabulary/' + updateCurrent.term;
    axios
        .post(url,
            requestBody,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
        )
        .then((response) => {
          console.log('request url:' + url + ' come response.');
          if (!(isHistory)) {
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

  @observable tmpBorderColor = {id: '', color: ''};

  /**
   * Related terms tab color selection event
   * @param  {string} id - target vocabulary id
   * @param  {string} color - selected color
   */
  @action selectTmpBorderColor(id, color) {
    if ( (this.tmpBorderColor.id !== '') &&
        (this.tmpBorderColor.color != color) ) {
      this.tmpBorderColor = {id: id, color: color};
    }
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
   * For data with a blank "term name", the prefix of the (unique) term name indicating the blank is returned.
   * '_TERM_BLANK_' cannot be changed because it is common to the file_controller.py and vocablary_controller.py
   * 
   * @return {string} - prefix string
   */
   @action getTermBlankPrefix(){
    return '_TERM_BLANK_';
  }
  /**
   * Whether the term contains a prefix indicating a blank
   * 
   * @return {bool} - true=is blank term / false=not blank term
   */
   @action isBlankTerm( term){
    const blankPrefix = this.getTermBlankPrefix();
    if(term && term.indexOf( blankPrefix) != -1){
      return true;
    }
    return false;
  }

  /**
   * Visualization screen panel creating vocabulary list for vocabulary tab
   * @return {array} - vocabulary list
   */
  @computed get termListForVocabulary() {
    const targetData = this.getTargetFileData(this.selectedFile.id);

    const termListForVocabulary = [];
    const blankPrefix = this.getTermBlankPrefix();
    targetData.forEach((data) => {
      if(data.term.indexOf( blankPrefix)== -1){
        // Editing vocabulary
        termListForVocabulary.push({
          data: {
            id: data.id,
            term: data.term,
            language: data.language,
            preferred_label: data.preferred_label,
            idofuri: data.idofuri,
            uri: data.uri,
            vocabularyColor: data.color1?data.color1:'',
            other_voc_syn_uri: data.other_voc_syn_uri,
            term_description: data.term_description,
            created_time: data.created_time,
            modified_time: data.modified_time,
            confirm: data.confirm?data.confirm:'',
          },
          position: {
            x: data.position_x?this.calcPosition(data.position_x):0,
            y: data.position_y?this.calcPosition(data.position_y):0,
          },
          broader_term: data.broader_term,
        });
      }
    });

    // add other vocabulary data  
    const otherVocSynonymUri = [];
    targetData.forEach((data) => {

      const findNode = otherVocSynonymUri.find((item) => { 
        return item.data.term == data.other_voc_syn_uri 
      })
      if( !findNode && data.other_voc_syn_uri
        && ((data.other_voc_syn_uri.indexOf("http://") != -1) 
        || (data.other_voc_syn_uri.indexOf("https://") != -1))){
        // Editing vocabulary
        otherVocSynonymUri.push({
          data: {
            id: data.id * -1,
            term: data.other_voc_syn_uri,
            language: data.language,
            preferred_label: data.preferred_label,
            idofuri: data.idofuri,
            uri: data.uri,
            vocabularyColor: '',
            other_voc_syn_uri: data.other_voc_syn_uri,
            term_description: '',
            created_time: '',
            modified_time: '',
            confirm:'',
          },
          position: {
            x: data.position_x?this.calcPosition(data.position_x):0,
            y: data.position_y?this.calcPosition(data.position_y):0,
          },
          broader_term: '',
        });
      }
    });


    return termListForVocabulary.concat(otherVocSynonymUri);
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
    let history = new History('vocabulary', this.currentNode.id, this.currentLangDiffNode.term==''?null:this.currentLangDiffNode.id);
    let previousForHistory = [];
    let followingForHistory = [];
    
    // DEBUG
    console.log("this.tmpSynonym .id .list .idList");
    console.log(this.tmpSynonym.id);
    console.log(this.tmpSynonym.list["ja"].concat());
    console.log(this.tmpSynonym.list["en"].concat());
    console.log(this.tmpSynonym.idList["ja"].concat());
    console.log(this.tmpSynonym.idList["en"].concat());
    console.log("this.tmpPreferredLabel .id .list");
    console.log(this.tmpPreferredLabel.id);
    console.log(this.tmpPreferredLabel.list["ja"].concat());
    console.log(this.tmpPreferredLabel.list["en"].concat()); 
    console.log("this.tmpUri .id .list");
    console.log(this.tmpUri.id);
    console.log(this.tmpUri.list.concat());
    console.log("this.tmpIdofUri .id .list");
    console.log(this.tmpIdofUri.id);
    console.log(this.tmpIdofUri.list.concat());
    console.log("this.tmpBroaderTerm .id .list .broader_uri");
    console.log(this.tmpBroaderTerm.id);
    console.log(this.tmpBroaderTerm.list["ja"].concat());
    console.log(this.tmpBroaderTerm.list["en"].concat());
    console.log(this.tmpBroaderTerm.broader_uri);
    console.log("this.tmpTermDescription .id .list");
    console.log(this.tmpTermDescription.id);
    console.log(this.tmpTermDescription.list["ja"].concat());
    console.log(this.tmpTermDescription.list["en"].concat());
    console.log("this.tmpLanguage .id .list");
    console.log(this.tmpLanguage.id);
    console.log(this.tmpLanguage.list);
    console.log("this.tmpCreatedTime .id .list");
    console.log(this.tmpCreatedTime.id);
    console.log(this.tmpCreatedTime.list.concat());
    console.log("this.tmpModifiedTime .id .list");
    console.log(this.tmpModifiedTime.id);
    console.log(this.tmpModifiedTime.list.concat());
    console.log("this.tmpOtherVocSynUri .id .list");
    console.log(this.tmpOtherVocSynUri.id);
    console.log(this.tmpOtherVocSynUri.list.concat());
    // DEBUG  // preferred_label //////////////////////

    //uri_prefix
    const uri_prefix = editingVocabularyMetaStore.editingVocabularyMeta.meta_uri;
  
    const prevSynIdListJa =this.currentNode.language === 'ja'? this.currentNode.synonymIdList.concat(): this.currentLangDiffNode.synonymIdList.concat(); 
    const prevSynIdListEn =this.currentNode.language === 'en'? this.currentNode.synonymIdList.concat(): this.currentLangDiffNode.synonymIdList.concat(); 
    const followSynIdListJa = this.tmpSynonym.idList['ja'].concat();
    const followSynIdListEn = this.tmpSynonym.idList['en'].concat();
    const followSynIdListWithMe = [...followSynIdListJa, ...followSynIdListEn, this.currentNode.id];
    
    
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
      followObj.idofuri = String(Date.now());// tentative treatment
      // we need to change it to UUID or something else
      followObj.uri = uri_prefix + followObj.idofuri; 
      followObj.broader_uri = obj.broader_uri;// broader_uri as is 
      followObj.broader_term = obj.broader_term;// broader_term as is  // optional
      followObj.other_voc_syn_uri = ''; // the other_voc_syn_uri should be exist in the remaining synonym group
      followObj.term_description = ''; // 
      followObj.created_time = obj.created_time; // created_time as is
      followObj.modified_time = obj.modified_time; // modified_time as is. this will be changed in updateRequest-method.
      followObj.synonym_candidate = obj.synonym_candidate; // synonym_candidate as is
      followObj.broader_term_candidate = obj.broader_term_candidate; // broader_term_candidate as is
      followObj.hidden = obj.hidden; // hidden as is
      followObj.position_x = obj.position_x; // position_x as is
      followObj.position_y = obj.position_y; // position_y as is
      followObj.color1 = obj.color1; // color1 as is
      followObj.color2 = obj.color2; // color2 as is
      followObj.confirm = obj.confirm; // confirm as is
      delObjList.push(followObj);
      // push it to history
      followingForHistory.push(this.makeVocabularyHistoryData(obj));
    });
    
    // get new syngroup for all language
    const followSynGroup = this.editingVocabulary.filter((obj)=>{
      return (followSynIdListWithMe.includes(obj.id))
    });
    const followSynGroupObjList = [];
    const tmp1Pref = this.tmpPreferredLabel; // this rename is just to avoid variable name resolution problem
    const tmp1IdofUri = this.tmpIdofUri; // this rename is just to avoid variable name resolution problem
    // const tmp1Uri = this.tmpUri; // this rename is just to avoid variable name resolution problem
    const tmp1BroaderTerm = this.tmpBroaderTerm; // this rename is just to avoid variable name resolution problem
    const tmp1OtherVocSynUri = this.tmpOtherVocSynUri; // this rename is just to avoid variable name resolution problem
    const tmp1TermDescription =this.tmpTermDescription; // this rename is just to avoid variable name resolution problem
    followSynGroup.forEach(obj => {
      // push it to history
      previousForHistory.push(this.makeVocabularyHistoryData(obj));
      const followObj = new Object;
      followObj.id = obj.id; // id as is 
      followObj.term = obj.term;// term as is 
      followObj.preferred_label = tmp1Pref.list[obj.language][0];
      followObj.language = obj.language;// language as is 
      // idofuri will be changed only for object whose id is currentNode.id
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
      if(tmp1TermDescription.list[followObj.language].length!==0){
        followObj.term_description = tmp1TermDescription.list[followObj.language][0];
      }else{
        followObj.term_description =''
      }
      followObj.created_time = obj.created_time; // created_time as is
      followObj.modified_time = obj.modified_time; // modified_time as is. this will be changed in updateRequest-method.
      followObj.synonym_candidate = obj.synonym_candidate; // synonym_candidate as is
      followObj.broader_term_candidate = obj.broader_term_candidate; // broader_term_candidate as is
      followObj.hidden = obj.hidden; // hidden as is
      followObj.position_x = obj.position_x; // position_x as is
      followObj.position_y = obj.position_y; // position_y as is
      followObj.color1 = obj.color1; // color1 as is
      followObj.color2 = obj.color2; // color2 as is
      followObj.confirm = obj.confirm; // confirm as is
      // add
      followSynGroupObjList.push(followObj);
      // push it to history
      followingForHistory.push(this.makeVocabularyHistoryData(followObj));
    });

    // if the uri or idofuri has been changed
    // we need to update subordinate term's broader_uri
    const followSubGroupObjList = [];
    if(this.tmpIdofUri.list[0]!= this.currentNode.idofuri){
      // collect uris in the sysnonym group
      const synonymUriSet = new Set(); // set for 'previous' uris in the sysnonym group
      followSynGroup.forEach((obj)=>{
        synonymUriSet.add(obj.uri);
      });
      // get new subordinate terms for all language
      const followSubGroup = this.editingVocabulary.filter((obj)=>{
        return (synonymUriSet.has(obj.broader_uri))
      });
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
        followObj.modified_time = obj.modified_time; // modified_time as is. this will be changed in updateRequest-method.
        followObj.synonym_candidate = obj.synonym_candidate; // synonym_candidate as is
        followObj.broader_term_candidate = obj.broader_term_candidate; // broader_term_candidate as is
        followObj.hidden = obj.hidden; // hidden as is
        followObj.position_x = obj.position_x; // position_x as is
        followObj.position_y = obj.position_y; // position_y as is
        followObj.color1 = obj.color1; // color1 as is
        followObj.color2 = obj.color2; // color2 as is
        followObj.confirm = obj.confirm; // confirm as is
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

    // need to DEBUG history

    this.updateRequest(updateTermList, this.currentNode, history, setTermId);
    return null;
  }


  /**
   * Updating coordinate values etc. to DB 
   * @param  {object} nodes - cytoscape nodes
   * @return {string} - error message
   */
  @action updateVocabularies( nodes, isDrag=false) {

    // Get coordinate information from the visualization panel
    const updateTermList = [];
    const threshold = 0.00001;
    for (let item of this.editingVocabulary) {

      let position_x = null;
      let position_y = null;
      let tmpData = null;
      for (let node of nodes) {
        const posi = node.position();
        if( item.term === node.data().term){
          position_x = this.calcReversePosition( posi.x, isDrag);
          position_y = this.calcReversePosition( posi.y, isDrag);

          if(( threshold > Math.abs( Number( item.position_x) - position_x))
          || ( threshold > Math.abs( Number( item.position_y) - position_y))){
            position_x = null;
          }else{
            tmpData = node.data();
          }
          break;
        }
      }
      if( !tmpData || position_x === null){
        continue;
      }
      
      const history = new History('position', item.id);
      history.previous = { position_x: Number(item.position_x), position_y: Number(item.position_y)};
      history.following ={ position_x:             position_x , position_y:             position_y };
      history.targetId = item.id;
   
      editingHistoryStore.addHistory(history);

      item.position_x = position_x;
      item.position_y = position_y;
      item.color1 = tmpData.vocabularyColor;
      item.color2 = this.confirmColor;
      item.confirm = tmpData.confirm==''? 0:1;

      const dbData = {
        term: item.term,
        preferred_label: '',
        language:'',
        uri: '',
        broader_term: '',
        broader_uri: '',
        other_voc_syn_uri: '',
        term_description: '',
        created_time: '',
        modified_time: '',
        synonym_candidate: [],
        broader_term_candidate: [],
        position_x: String( position_x),
        position_y: String( position_y),
        color1: item.color1,
        color2: item.color2,
        hidden: item.hidden,
        confirm: item.confirm,
      };
      if (item.id) {
        dbData.id = Number(item.id);
      }
      dbData.preferred_label = item.preferred_label;
      dbData.uri = item.uri;
      dbData.language = item.language;
      dbData.other_voc_syn_uri = item.other_voc_syn_uri;
      dbData.term_description = item.term_description;
      dbData.created_time = item.created_time;
      dbData.modified_time = item.modified_time;

      if (item.synonym_candidate) {
        item.synonym_candidate.forEach((term) => {
          dbData.synonym_candidate.push(term);
        });
      }
      dbData.broader_term = item.broader_term;
      dbData.broader_uri = item.broader_uri;
      if (item.broader_term_candidate) {
        item.broader_term_candidate.forEach((term) => {
          dbData.broader_term_candidate.push(term);
        });
      }
      updateTermList.push( dbData);
    }

    updateTermList.forEach((item) => {
      // synonym list
      const objSynonym = this.editingVocabulary.filter((data) =>data.uri == item.uri);

      // Add if not in the array
      objSynonym.forEach(( obj) => {
        const findObj = updateTermList.find((item2) =>obj.id == item2.id);
        if( !findObj){          
          updateTermList.push(obj);
        }   
      });  
    });

    if( updateTermList.length > 0){
      this.updateRequest(updateTermList, updateTermList[0], null, null, false);
    }
    
    return '';
  }

  /**
   * Execute vocabulary data update
   * @param  {array} updateList - updated vocabulary list
   * @param  {object} current - vocabulary data to be updated
   * @param  {object} history - history data 
   * @param  {string} oldNodeTerm - vocabulary old data to be updated
   * @param  {bool} setCurrent - do setCurrentNodeByTerm() 
   */
  updateRequest(updateList, current, history = null, oldNodeId = null, setCurrent=true) {

    //DEBUG
    updateList.forEach(data => {
      console.log("data.id=");
      console.log(data.id);
      console.log("data.term=");
      console.log(data.term);
      // console.log("data.preferred_label=");
      // console.log(data.preferred_label);
      // console.log("data.language=");
      // console.log(data.language);
      console.log("data.idofuri=");
      console.log(data.idofuri);
      console.log("data.uri=");
      console.log(data.uri);
      console.log("data.broader_uri=");
      console.log(data.broader_uri);
      console.log("data.broader_term=");
      console.log(data.broader_term);
      // console.log("data.other_voc_syn_uri=");
      // console.log(data.other_voc_syn_uri);
      // console.log("data.term_description=");
      // console.log(data.term_description);
      // console.log("data.created_time=");
      // console.log(data.created_time);
      // console.log("data.modified_time=");
      // console.log(data.modified_time);
      // console.log("data.synonym_candidate=");
      // console.log(data.synonym_candidate);
      // console.log("data.broader_term_candidate=");
      // console.log(data.broader_term_candidate);
      // console.log("data.hidden=");
      // console.log(data.hidden);
      // console.log("data.position_x=");
      // console.log(data.position_x);
      // console.log("data.position_y=");
      // console.log(data.position_y);
      // console.log("data.color1");
      // console.log(data.color1);
      // console.log("data.color2=");
      // console.log(data.color2);
      // console.log("data.confirm=");      
      // console.log(data.confirm);      
    });
    // DEBUG

    // tentative when broader term exist and broader uri does not exist, log it
    updateList.forEach((item) => {
      if(item.broader_term != '' && item.broader_uri==''){
        console.log('something wrong');
        console.log(item.id);
        console.log(item.term);
        console.log(item.broader_term);
      }}
    );

    const updeteUrl = '/api/v1/vocabulary/editing_vocabulary/' + current.term;
    let requestBody = updateList;

    // updating created_time and modified_time  //////////////////
    const editingVocabularyTerm = [];
    this.editingVocabulary.forEach((data) => {
      editingVocabularyTerm.push(data.term);
    });

    // time 0 fill
    const toDoubleDigits = function(num) {
      num += "";
      if (num.length === 1) {
        num = "0" + num;
      }
      return num;     
    };
    // Get current time
    const dateTmp = new Date();
    const dateNow = dateTmp.getFullYear() + "-" + 
                    toDoubleDigits((dateTmp.getMonth() + 1))  + "-" + 
                    toDoubleDigits(dateTmp.getDate()) + "T" + 
                    toDoubleDigits(dateTmp.getHours()) + ":" + 
                    toDoubleDigits(dateTmp.getMinutes()) + ":" + 
                    toDoubleDigits(dateTmp.getSeconds()) + "Z";

    // updating created_time and modified_time
    requestBody.forEach((data) => {
      data.modified_time = dateNow;
    });

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

          // Reselect to reset tmp information
          if( setCurrent){
            this.setCurrentNodeById(current.id, oldNodeId?false:true);
          }

          if (history) {
            if (!history.targetId) {
              history.targetId = this.currentNode.id;
              const find = history.following.find((data) =>
                data.term === current.term);
              if (find) {
                find.id = this.currentNode.id;
                //DEBUG
                console.assert(false, "something wrong at updateRequest");
              }
            }
            editingHistoryStore.addHistory(history);
          }
          if( oldNodeId && (!this.currentNode.term || (this.currentNode.id && this.currentNode.id != oldNodeId))){
            this.setCurrentNodeById( oldNodeId, true);
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

    // More than one id of uri selected
    if (this.tmpIdofUri.list.length > 1) {
      console.log('[errorCheck] multiIdofUri.');
      ret.errorKind = 'multiIdofUri';
      return ret;
    }

    // Check Id of URL setting /////////////////////////////////////////
    // If no id of uri is set, it is an error.
    if (this.tmpIdofUri.list.length == 0) {
      console.log('[errorCheck] needToIdofUri.');
      ret.errorKind = 'needToIdofUri';
      return ret;
    }

    // Check Id of URL setting for other preferred labels /////////////////////////////////////////
    if ((this.tmpIdofUri.list.length > 0) && (this.tmpIdofUri.list[0])) {
      const idofuri = this.tmpIdofUri.list[0];
      const prfrrdLbl = this.tmpPreferredLabel.list[this.currentNode.language][0];
      if (this.isInvalidIdofUri(this.currentNode, idofuri, prfrrdLbl)) {
        console.log('[errorCheck] equalIdofUri.');
        ret.errorKind = 'equalIdofUri';
        return ret;
      }
    }

    [ this.currentNode, this.currentLangDiffNode].forEach(( currentNode)=>{
      
      if( !currentNode.id){
        if( this.tmpSynonym.list[currentNode.language].length > 0){
          const findTerm = this.tmpSynonym.list[currentNode.language][0];
          const find = this.editingVocabulary.find((item)=> item.term == findTerm )
          if(find){
            currentNode = find;
          }else{  // should not be
            return null;
          }
        }else{
          return null;
        }
      }

      // Multiple selection check /////////////////////////////////////////

      // When multiple preferred labels are selected
      if (this.tmpPreferredLabel.list[currentNode.language].length > 1) {
        console.log('[errorCheck] multiPreferredLabel.');
        ret.errorKind = 'multiPreferredLabel';
        ret.term = currentNode.term;
        ret.language = currentNode.language;
        return ret;
      }

      // More than one broader term selected
      if (this.tmpBroaderTerm.list[currentNode.language].length > 1) {
        console.log('[errorCheck] multiBroaderTerm.');
        ret.errorKind = 'multiBroaderTerm';
        ret.term = currentNode.term;
        ret.language = currentNode.language;
        return ret;
      }

      // Effective term check for preferred label /////////////////////////////////////////

      if (this.tmpPreferredLabel.list[currentNode.language].length == 1) {
        if (this.isInvalidPreferredLabel(currentNode, this.tmpPreferredLabel.list[currentNode.language][0])) {
          console.log('[errorCheck] invalidPreferredLabel.');
          ret.errorKind = 'invalidPreferredLabel';
          ret.term = currentNode.term;
          ret.language = currentNode.language;
          return ret;
        }
      }

      // If there is more than one synonym and no preferred label is set, it is an error.
      if ( this.tmpPreferredLabel.list[currentNode.language].length == 0) {
        // && this.tmpSynonym.list[currentNode.language].length > 0) {
        console.log('[errorCheck] needToPreferredLabel.');
        ret.errorKind = 'needToPreferredLabel';
        ret.term = currentNode.term;
        ret.language = currentNode.language;
        return ret;
      }

      // Check for existing cycles of synonyms
      if (this.tmpSynonym.list[currentNode.language].length > 0) {
        if (this.isRelationSynonym(currentNode, this.tmpSynonym.list[currentNode.language])) {
          console.log('[errorCheck] relationSynonym.');
          ret.errorKind = 'relationSynonym';
          ret.term = currentNode.term;
          ret.language = currentNode.language;
          return ret;
        }
      }


      // Check the validity of a broader term /////////////////////////////////////////
      if ((this.tmpBroaderTerm.list && this.tmpBroaderTerm.list[currentNode.language].length > 0) &&
          (this.tmpBroaderTerm.list[currentNode.language][0])) {
        const nextBroaderTerm = this.tmpBroaderTerm.list[currentNode.language][0];

        if (!this.isValidBrdrTrm(currentNode, nextBroaderTerm)) {
          console.log('[errorCheck] invalidBroaderTerm.');
          ret.errorKind = 'invalidBroaderTerm';
          ret.term = currentNode.term;
          ret.language = currentNode.language;
          return ret;
        }
      }

      // Broader term loop check /////////////////////////////////////////
      if ((this.tmpBroaderTerm.list && this.tmpBroaderTerm.list[currentNode.language].length > 0) &&
          (this.tmpBroaderTerm.list[currentNode.language][0])) {
        if (this.isCycleBrdrTrm(currentNode, this.tmpBroaderTerm.list[currentNode.language][0])) {
          console.log('[errorCheck] cycleBroaderTerm.');
          ret.errorKind = 'cycleBroaderTerm';
          ret.term = currentNode.term;
          ret.language = currentNode.language;
          return ret;
        }
      }
      
      // When multiple term description labels are selected
      if (this.tmpTermDescription.list[currentNode.language].length > 1) {
        console.log('[errorCheck] multiTermDescription.');
        ret.errorKind = 'multiTermDescription';
        ret.term = currentNode.term;
        ret.language = currentNode.language;
        return ret;
      }
    });

    // Determine whether URIs between broader terms are common
    if (this.tmpBroaderTerm.list['ja'].length > 0 && this.tmpBroaderTerm.list['en'].length > 0) {
      if (!this.isValidSynonymBrdrTrm(this.currentNode, this.tmpBroaderTerm.list[this.currentNode.language][0])) {
        console.log('[errorCheck] invalidSynonymBroaderTerm.');
        ret.errorKind = 'invalidSynonymBroaderTerm';
        ret.term = this.currentNode.term;
        ret.language = this.currentNode.language;
        return ret;
      }
    }

    return ret.errorKind==''?null:ret;
  }

  @observable equalUriPreferredLabel = '';
  @observable cycleBroaderTerm = [];

  // URI //////////////////////
  @observable tmpUri = {
    id: '',
    list: [],
  };

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
   * Determine if the Id of URI is set to the appropriate  Id of URI
   * @param  {object}  currentNode - check target node
   * @param  {String}  idofuri - Id of URI string
   * @param  {String}  prfrrdLbl - preferred label of Id of URI
   * @return {Boolean} - true: inappropriate, false: appropriate
   */
   isInvalidIdofUri(currentNode, idofuri, prfrrdLbl) {
    let isSameIdofUri = false;

    if (!idofuri) {
      return isSameIdofUri;
    }

    const tmpPreferredLabel = prfrrdLbl;
    const tmpIdofUri = idofuri;
    const tmpLanguage = currentNode.language;

    // Extract vocabulary with same Id of URI and same language
    let idofuriVocList = this.editingVocabulary.filter((data) =>
      data.idofuri === tmpIdofUri && data.language === tmpLanguage);
    if (idofuriVocList) {
      // Exclude terms and terms in preferred label being edited
      if (tmpPreferredLabel) {
        idofuriVocList = idofuriVocList.filter((data) =>
          data.preferred_label !== tmpPreferredLabel);
      }

      idofuriVocList = idofuriVocList.filter((data) =>
        data.term !== currentNode.term);
    }

    idofuriVocList.forEach((data) => {
      // If no synonyms are present, an error occurs if another Id of URI is set
      if (this.tmpSynonym.list[data.language].length == 0) {
        this.equalUriPreferredLabel = data.preferred_label;
        console.log(
            '[errorCheck] idofuri is not unmatch(' +
            tmpPreferredLabel +
            ' : ' +
            tmpIdofUri +
            ', ' +
            data.preferred_label +
            ' : ' +
            data.idofuri +
            ').',
        );
        isSameIdofUri = true;
      }
    });
    return isSameIdofUri;
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
   * Create ID of URI list for screen display
   * @return {Array} - ID of URI list
   */
  @computed get currentIdofUri() {
    if (!(this.currentNode.id)) {
      return [];
    }
    let filterList = [];
    if (this.tmpIdofUri.id == this.currentNode.id) {
      if ( this.tmpIdofUri.list.length > 0 ) {
        filterList = this.tmpIdofUri.list;
      }
    } else {
      if ( this.currentNode.idofuri != '' ) {
        filterList = [this.currentNode.idofuri];
      }
    }
    return filterList;
  }

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
      newValue.forEach((id) => {
        array.push(id);
      });
    } else {
      if (this.tmpPreferredLabel.list[this.tmpLanguage.list].length > 0) {
        // Do not add terms that are not selected and have no title to the broader term
        newValue.forEach((id) => {
          array.push(id);
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
   * @param  {string} newValueUri - broader uri
   */
  @action updateBroaderTerm(newValue, newValueUri='') {
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
      const currentLang = this.currentNode.language;
      const find = this.editingVocabulary.find((data)=> (data.term===newValue[0]) && (data.language == currentLang) );
      if(find){newValueUri = find.uri};
    }

    const newLangDiffValue = [];
    const langDiffFilters=this.editingVocabulary.filter((item)=>{
      return item.uri == newValueUri && item.language != this.tmpLanguage.list
    })
    langDiffFilters.forEach((node)=>{
      if(node.preferred_label != '' && node.term===node.preferred_label){
        newLangDiffValue.push(node.preferred_label);
      } 
    });

    this.tmpBroaderTerm.id = this.currentNode.id; 
    this.tmpBroaderTerm.list[this.tmpLanguage.list] = newValue;
    this.tmpBroaderTerm.list[this.tmpLanguage.list=='ja'?'en':'ja'] =newLangDiffValue;
    this.tmpBroaderTerm.broader_uri = newValueUri;
  }

  /**
   * Delete and update the end of the list of top words being edited
   */
  @action popBroaderTerm() {
    const newArray = [];
    this.tmpBroaderTerm.list[this.tmpLanguage.list].forEach((data) => {
      newArray.push(data);
    });
    newArray.pop();
    this.updateBroaderTerm(newArray);
  }

  /**
   * Determine if it is a valid broader term
   * @param  {object}  currentNode - check target node
   * @param  {String}  broaderTerm - broader term
   * @return {Boolean} - true: valid, false: invalid
   */
  @action isValidBrdrTrm(currentNode, broaderTerm) {
    // broaderTerm is the preferred label of this currentNode
    if (this.tmpPreferredLabel && this.tmpPreferredLabel.list[currentNode.language].length == 1) {
      if (broaderTerm === this.tmpPreferredLabel.list[currentNode.language][0]) {
        console.log('[errorCheck] preferredLabel is set for broaderTerm.');
        return false;
      }
    }

    // Whether there are synonyms for the broaderTerm
    if (this.tmpSynonym.list[currentNode.language].length > 0) {
      const find = this.tmpSynonym.list[currentNode.language].find( (term) =>
      term == broaderTerm);
      if (find) {
        console.log('[errorCheck] synonym is set for broaderTerm.');
        return false;
      }
    }

    // Whether or not the selected term is set in the broader term
    if (broaderTerm == currentNode.term) {
      console.log('[errorCheck] current term is set for broaderTerm.');
      return false;
    }

    return true;
  }

  /**
   * Determine if a broader term is not looping
   * @param  {object}  currentNode - check target node
   * @param  {String}  broaderTerm - broader term
   * @return {Boolean} - true: invalid(loop), false: valid
   */
  @action isCycleBrdrTrm(currentNode, broaderTerm) {
    // For epistatic cyclic vocabulary storage
    const cycleCheckList = [];
    if ( this.tmpPreferredLabel.list[currentNode.language][0]) {
      // Since a preferred label is specified for a broader term, if a preferred label exists, it is checked by the preferred label
      cycleCheckList.push( this.tmpPreferredLabel.list[currentNode.language][0]);
    } else {
      cycleCheckList.push(currentNode.term);
    }

    // A list of terms or preferred label against which circulation is determined
    // Covers the vocabulary or preferred label you select and the synonymous preferred label
    const cycleTargetList = [];
    cycleTargetList.push(cycleCheckList[0]);
    if (this.tmpSynonym.list[currentNode.language].length > 0) {
      this.tmpSynonym.list[currentNode.language].forEach((synonym) => {
        const objSynonym = this.editingVocabulary.find( (data) =>
          data.term === synonym);

        if (objSynonym) {
          // Synonyms exist in the editing vocabulary
          if (objSynonym.preferred_label) {
            // A preferred label is set for the vocabulary specified in the synonym
            const prfrrdLbl = objSynonym.preferred_label;
            if (prfrrdLbl != broaderTerm) {
            if (!cycleTargetList.find((term) => term == prfrrdLbl)) {
              // CycleTargetList ddd preferred label that have not already been added
              cycleTargetList.push(prfrrdLbl);
            }
            } else {
              // If the preferred label of a synonym is set to a broader term, do not check it because it will not cycle
              console.log('preferredLabel change to broaderTerm(' +
                          broaderTerm + ').');
            }
          }
        }
      });
    }

    let nextBroaderTerm = broaderTerm;
    let continueFlg = true;
    do {
      const find = this.editingVocabulary.find((data) =>
        data.term === nextBroaderTerm);
      if (find) {
        if (cycleTargetList.indexOf(find.term) != -1) {
          // The broader term is specified in the editing vocabulary
          if (cycleCheckList.indexOf(find.term) == -1) {
            cycleCheckList.push(find.term);
          }
          console.log('[errorCheck] cyclic.' + cycleCheckList);
          this.cycleBroaderTerm = cycleCheckList;
          continueFlg = false;
          return true;
        } else {
          if (find.preferred_label) {
            cycleCheckList.push(find.preferred_label);
          } else {
            cycleCheckList.push(find.term);
          }
          if (find.broader_term) {
            // Search continues because there is a broader term
            nextBroaderTerm = find.broader_term;
          } else {
            continueFlg = false;
          }
        }
      } else {
        continueFlg = false;
      }
    } while (continueFlg);

    return false;
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

    const find_j = this.editingVocabulary.find((data) => {
      return (data.term == tmpBroaderTerm_j && data.language == 'ja') 
    });
    const find_e = this.editingVocabulary.find((data) => {
      return (data.term == tmpBroaderTerm_e && data.language == 'en')
    });
    if( find_j && find_e && find_j.uri != find_e.uri){
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
   * @param  {string} newValue - synonym
   */
  @action updateSynonym(newValue) {

    const newLangDiffValue = this.tmpSynonym.list[this.tmpLanguage.list=='ja'?'en':'ja'].concat();
    const currentNodeSynList = this.tmpLanguage.list==this.currentNode.language?this.currentNode.synonymList:this.currentLangDiffNode.synonymList
    if( newValue.length > currentNodeSynList.length ){
      newValue.forEach((term)=>{
        const find = this.editingVocabulary.find((d)=>d.term==term)
        const langDiffFilters=this.editingVocabulary.filter((item)=>{
          return item.idofuri == find.idofuri && item.language != find.language
        })
        langDiffFilters.forEach((node)=>{ 
          // Dare to use 'this.currentNode.term'
          this.currentNode.term != node.term && newLangDiffValue.push(node.term) 
        }); 
      });
      newLangDiffValue.filter((val, i, self)=>{ return i === self.indexOf(val)});
    }

    const synonymNewList={ja:[], en:[]};
    synonymNewList[this.tmpLanguage.list] = newValue;
    synonymNewList[this.tmpLanguage.list=='ja'?'en':'ja'] = newLangDiffValue;

    [ this.currentNode, this.currentLangDiffNode].forEach((currentNode)=>{

      const array = [];
      // Add synonyms received from component to the list
      synonymNewList[currentNode.language].forEach((synonym) => {
        if (currentNode.term) {
          // If the vocabulary being edited is added to a synonym by direct input, etc., omit it
          if ( currentNode.language != this.currentNode.language) {
            array.push(synonym);
          }else if ( synonym !== currentNode.term) {
            array.push(synonym);
          }
        } else {
          array.push(synonym);
        }
      });
      // Complete only for additional updates
      if (array.length > this.tmpSynonym.list[currentNode.language].length) {
        // Extract added synonyms
        const addSynonymList = array.filter((i) =>
          this.tmpSynonym.list[currentNode.language].indexOf(i) == -1);

        // Add synonyms associated with synonyms received from component to the list
        addSynonymList.forEach((synonym) => {
          const allList = [
            ...this.editingVocabulary,
          ];

          // Since the added synonym may not be a preferred label, the preferred label is drawn and complemented from the vocabulary information of the added synonym
          const synonymData =
            allList.find( (data) => data.term == synonym);

          // Terms associated with the preferred labels of additional synonyms
          let targetList = [];
          if (synonymData) {
            if (synonymData.preferred_label) {
              // For items with preferred label, extract all relevant terms
              targetList =
                allList.filter((data) =>
                  data.preferred_label == synonymData.preferred_label &&
                  data.term != currentNode.term);
            } else {
              // If no preferred label is set, only that term is extracted
              targetList.push(synonymData);
            }
          }

          targetList.forEach((target) => {
            // Preferred label
            if ((target.preferred_label != '') &&
              (target.preferred_label != null) &&
              (this.tmpPreferredLabel.list[currentNode.language].indexOf(target.preferred_label)==-1)) {
              this.tmpPreferredLabel.list[currentNode.language].push(target.preferred_label);
            }
            // Broader term
            if ((target.broader_term != '') &&
            (target.broader_term != null) &&
            (this.tmpBroaderTerm.list[currentNode.language].indexOf(target.broader_term) == -1)) {
              this.tmpBroaderTerm.list[currentNode.language].push(target.broader_term);
              this.tmpBroaderTerm.broader_uri =  target.broader_uri;
              
            }
            // URI
            if ((this.tmpUri.list.length == 0) && (target.uri)) {
              this.tmpUri.list.push(target.uri);
            }            
            // term description
            if ( target.term_description != '' && target.term_description != null 
              && this.tmpTermDescription.list[currentNode.language].indexOf(target.term_description) == -1) {
              this.tmpTermDescription.list[currentNode.language].push(target.term_description);
            }

            // Add additional synonyms if any
            if (target.term !== synonym) {
              array.push(target.term);
            }
          });
        });
      }

      this.tmpSynonym.id = this.currentNode.id; // Setting 'this.currentNode' on purpose
      this.tmpSynonym.list[currentNode.language] = array.filter((val, i, self)=>{ return i === self.indexOf(val)});
      //tentative treatment
      const idArray = [];
      this.tmpSynonym.list[currentNode.language].forEach((term) =>{
        const find = this.editingVocabulary.find((data)=> (data.term === term));
        idArray.push(find.id);
      });
      this.tmpSynonym.idList[currentNode.language] =idArray;
    })
  }

  /**
   * Delete and update the end of the synonym list you are editing
   */
  @action popSynonym() {
    const newArray = [];
    this.tmpSynonym.list[this.tmpLanguage.list].forEach((data) => {
      newArray.push(data);
    });
    newArray.pop();
    this.updateSynonym(newArray);
  }

  /**
   * [isRelationSynonym description]
   * @param  {object}  currentNode - check target node
   * @param  {Array}  list synonymList
   * @return {Boolean}     true:relation, false:not relation
   */
  @action isRelationSynonym(currentNode, list) {
    const lblList = [];

    list.forEach((synonym) => {
      if (lblList.indexOf(synonym) == -1) {
        lblList.push(synonym);
      }
    });

    this.tmpPreferredLabel.list[currentNode.language].forEach((label) => {
      if (lblList.indexOf(label) == -1) {
        lblList.push(label);
      }
    });

    if (lblList.indexOf(currentNode.term) == -1) {
      lblList.push(currentNode.term);
    }

    if (this.tmpSubordinateTerm.some((sub) => lblList.indexOf(sub) != -1)) {
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
  @observable uri2preflabel = {
    ja:{},
    en:{}
  };



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
    this.tmpPreferredLabel.list[this.tmpLanguage.list] = array.filter((val, i, self)=>{ return i === self.indexOf(val)});

    if( this.tmpPreferredLabel.list['ja'].length == 1){ // Japanese PreferredLabel takes precedence
      const find = this.editingVocabulary.find((d)=>d.term==this.tmpPreferredLabel.list['ja'][0]);
      this.tmpIdofUri.list = [ find?find.idofuri : this.tmpPreferredLabel.list['ja'][0] ];
    }else if(this.tmpPreferredLabel.list['ja'].length == 0 && this.tmpPreferredLabel.list['en'].length == 1){
      const find = this.editingVocabulary.find((d)=>d.term==this.tmpPreferredLabel.list['en'][0]);
      this.tmpIdofUri.list = [ find?find.idofuri : this.tmpPreferredLabel.list['en'][0] ];
    }
  }

  /**
   * Delete and update the end of the preferred label list being edited
   */
  @action popPreferredLabel() {
    const newArray = [];
    this.tmpPreferredLabel.list[this.tmpLanguage.list].forEach((data) => {
      newArray.push(data);
    });
    newArray.pop();
    this.updataPreferredLabel(newArray);
  }

  /**
   * Determine if a broader term is a term name or synonym
   * @param  {object}  currentNode - check target node
   * @param  {string}  newValue - term set for the preferred label
   * @return {Boolean} - true: inappropriate, false: appropriate
   */
  isInvalidPreferredLabel(currentNode, newValue) {
    if (currentNode.id) {
      if (newValue === currentNode.term) {
        return false;
      }
      const find = this.tmpSynonym.list[ currentNode.language].some((synonym) => synonym === newValue);
      if (find) return false;

      return true;
    }
    return false;
  }

  // subordinateTerm //////////////////////

  /**
   * Create determined narrower term list
   * @return {Array} - list of narrower term
   */
  @computed get currentSubordinateTerm() {
    const subordinateTerm = [];

    // Find out if a preferred label is set for a term that is set as a broader term of each vocabulary
    let target = '';
    if (this.currentNode.preferred_label) {
      target = this.currentNode.preferred_label;
    } else {
      target = this.currentNode.term;
    }

    if ( target == '' ) {
      return subordinateTerm;
    }

    const selectedFilesList = this.getTargetFileData(this.selectedFile.id);
    selectedFilesList.forEach((node) => {
      if (node.broader_term === target) {
        // Add a preferred label vocabulary or a vocabulary with no preferred label to a narrower term
        if (node.preferred_label === node.term ||
          !node.preferred_label ) {
          subordinateTerm.push(node.term);
        }
      }
    });

    return subordinateTerm;
  }

  /**
   * Create narrower term list for screen display
   * @return {Array}
   */
  @computed get tmpSubordinateTerm() {
    const subordinateTerm = [];

    let keyList = [];
    // Extract a narrower term, extract a preferred label in a preferred label column as key
    if (this.tmpPreferredLabel.list[this.tmpLanguage.list].length > 0) {
      keyList = this.tmpPreferredLabel.list[this.tmpLanguage.list].concat();

      // If there is no current term in the list of preferred labels, the narrower term may designate a current term as a narrower term, so add it as key
      if (this.currentNode.term) {
        if (keyList.indexOf(this.currentNode.term) == -1) {
          keyList.push(this.currentNode.term);
        }
      }
    } else {
      if (this.currentNode.term) {
        keyList.push(this.currentNode.term);
      }
    }

    const selectedFilesList = this.getTargetFileData(this.selectedFile.id);
    // In order to extract a narrower term, the term as a preferred label among the terms in the synonym column is extracted as key
    if (this.tmpSynonym.list[this.tmpLanguage.list].length > 0) {
      this.tmpSynonym.list[this.tmpLanguage.list].forEach((synonym) => {
        const objSynonym = selectedFilesList.find((data) =>
          data.term === synonym);
        // Synonyms not found in selectedFilesList are new terms
        if (objSynonym) {
          // Add a term to key that is labeled with the term specified in the synonym
          if (objSynonym.preferred_label) {
                // In some cases, the term may overlap with the term set in the preferred label
              if (keyList.indexOf(objSynonym.preferred_label) == -1) {
                keyList.push(objSynonym.preferred_label.toString());
              }
          } else {
            // Add a term with no caption to key because it is also a broader term
              // In some cases, the term may overlap with the term set in the peferred label
            if (keyList.indexOf(objSynonym.term) == -1) {
              keyList.push(synonym.toString());
            }
          }
        }
      });
    }

    // Extract terms with the key term set to a narrower term
    keyList.forEach((prfrdLbl) => {
      selectedFilesList.forEach((data) => {
        // Add a preferred label to a narrower term from the set of terms in the broader term
        if (data.broader_term === prfrdLbl) {
          // language data same from the selected term
          if (data.preferred_label === data.term &&
            this.tmpLanguage.list == this.currentNode.language) {
              subordinateTerm.push(data.term);
          }
          // language data different from the selected term
          if (data.preferred_label === data.term &&
             data.preferred_label != this.currentNode.preferred_label &&
             data.language != this.currentNode.language) {
              subordinateTerm.push(data.term);
          }
          // Terms without preferred labels are also broader term
          if (!data.preferred_label) {
            subordinateTerm.push(data.term);
          }
        }
      });
    });

    return subordinateTerm;
  }

  // Term Description //////////////////////
  @observable tmpTermDescription = {
    id: '',
    list: {ja:[], en:[]},
  };

  /**
   * Term Description update event
   * @param  {string} newValue Term Description
   */
  @action updataTermDescription(newValue) {
    const array = [];

    const currentNode = this.tmpLanguage.list == this.currentNode.language ? this.currentNode: this.currentLangDiffNode;
 
    if (currentNode.term) {
      newValue.forEach((term) => {
        array.push(term);
      });
    } else {
      // Do not add terms that are not selected and have no title to the term description
      newValue.forEach((term) => {
        array.push(term);
      });
    }
    this.tmpTermDescription.id = currentNode.id;
    this.tmpTermDescription.list[currentNode.language] = array;
  }

  /**
   * Delete and update the end of the term description list you are editing
   */
   @action popTermDescription() {
    const newArray = [];
    this.tmpTermDescription.list[this.tmpLanguage.list].forEach((data) => {
      newArray.push(data);
    });
    newArray.pop();
    this.updataTermDescription(newArray);
  }

  // Language //////////////////////
  @observable tmpLanguage = {
    id: '',
    list: 'ja',
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

    const url = '/api/v1/vocabulary/editing_vocabulary/' + confirmList[0].term;
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
   * @param  {String} term - confirmed term
   * @param  {Boolean} isConfirm - confirm ON/OFF
   * @param  {Boolean} [isHistory=false] - modified by undo/redo ?
   */
  toggleConfirm(term, isConfirm, isHistoryOp = false) {
    const currentNode = this.editingVocabulary.find((data) =>
      data.term == term);

    if (!currentNode) {
      console.log(term + ' is not found from editingVocabulary.');
      return;
    }

    let targetList = [];
    if (currentNode.preferred_label) {
      // When changing confirmation information for a term with a preferred label, update all terms with the same preferred label
      targetList = this.editingVocabulary.filter((data) =>
        data.preferred_label == currentNode.preferred_label);
      targetList.forEach((data) => {
        if (isConfirm) {
          data.confirm = 1;
          data.color2 = this.confirmColor;
        } else {
          data.confirm = 0;
          data.color2 = 'green';
        }
      });
    } else {
      // When changing confirmed information for a term without a preferred label, update only that term
      if (isConfirm) {
        currentNode.confirm = 1;
        currentNode.color2 = this.confirmColor;
      } else {
        currentNode.confirm = 0;
        currentNode.color2 = 'green';
      }
      targetList.push(currentNode);
    }

    const history = new History(
        'confirmChanged',
        currentNode.id,
        !isConfirm,
        isConfirm,
    );

    const url = '/api/v1/vocabulary/editing_vocabulary/' + currentNode.term;
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
