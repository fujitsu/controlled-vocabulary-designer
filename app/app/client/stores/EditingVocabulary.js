/**
 * EditingVocabulary.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import {action, computed, observable} from 'mobx';
import axios from 'axios';

import editingHistoryStore from './EditingHistory';
import History from './History';
import config from '../config/Config';

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

  // Example sentence search results
  @observable exampleResult = {
    data: {
      AllResultCount: 0,
      ExamplePhrases: {
        id: 1,
        phrase: '',
      },
    },
  };
  // Array for displaying example sentence data
  @observable examplePhrases = [];
  // Array for storing example sentence data
  @observable examplePhrasesCopy = [];
  // For example sentence retrieval term storage
  @observable searchTerm = '';
  // Example sentence index
  @observable dispNowIndex = 0;

  // Array for selected term on Visual vocabulary Tab
  @observable selectedTermList = [];

  updated = false;
  /**
   * Set vocabulary update flags for editing
   */
  setUpdate() {
    this.updated = true;
  }
  /**
   * Delete vocabulary update flags for editing
   */
  clearUpdate() {
    this.updated = false;
  }

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
          this.setUpdate();
          this.broaderUriToBroaderTerm = true;
          this.setEditingVocabularyData(response.data.EditingVocabulary);
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
   * Generate data for DBupdata from currentNode and the data being edited
   * @return {object} - editing vocabulary data
   */
  createDBFormatDataByCurrentNode() {
    const dbData = {
      term: this.currentNode.term,
      preferred_label: '',
      language: '',
      idofuri: '',
      uri: '',
      broader_term: '',
      // synonym : [],
      other_voc_syn_uri: '',
      term_description: '',
      created_time: '',
      modified_time: '',
      synonym_candidate: [],
      broader_term_candidate: [],
      position_x: String(this.currentNode.position_x),
      position_y: String(this.currentNode.position_y),
      color1: this.currentNode.color1,
      color2: this.currentNode.color2,
      hidden: this.currentNode.hidden,
      confirm: this.currentNode.confirm,
    };
    if (this.currentNode.id) {
      dbData.id = Number(this.currentNode.id);
    }
    if (this.tmpPreferredLabel.list && this.tmpPreferredLabel.list.length > 0) {
      dbData.preferred_label = this.tmpPreferredLabel.list[0];
    }
    if (this.tmpIdofUri.list && this.tmpIdofUri.list.length > 0) {
      dbData.idofuri = this.tmpIdofUri.list[0];
      // if id of uri is set and uri isn't set, uri is set
      if(this.tmpUri.list && this.tmpUri.list.length == 0) {
        // uri number of before
        let urihttp = this.editingVocabulary.find((data) => data.uri);
        urihttp = urihttp.uri;
        dbData.uri = urihttp.replace(urihttp.substring(urihttp.lastIndexOf('/')+1), this.tmpIdofUri.list[0]);
      }
    }
    if (this.tmpUri.list && this.tmpUri.list.length > 0) {
      dbData.uri = this.tmpUri.list[0].replace(this.tmpUri.list[0].substring(this.tmpUri.list[0].lastIndexOf('/')+1), this.tmpIdofUri.list[0]);
    }
    if (this.tmpBroaderTerm.list && this.tmpBroaderTerm.list.length > 0) {
      const broaderTerm = this.tmpBroaderTerm.list[0];
      dbData.broader_term = broaderTerm;
      const findData = this.editingVocabulary.find((data) =>
        data.term === broaderTerm);

      // Replace with the preferred label of the specified broader term
      if (findData && findData.preferred_label) {
        // Assume that the broader term you want to replace is not a current preferred term or term
        // Case in which the broader term had a synonymous relationship before amendment
        if (findData.preferred_label != dbData.preferred_label &&
            findData.preferred_label != dbData.term) {
          dbData.broader_term = findData.preferred_label;
          this.tmpBroaderTerm.list[0] = findData.preferred_label;
        }
      }
    }
    if (this.currentNode.synonym_candidate) {
      this.currentNode.synonym_candidate.forEach((term) => {
        dbData.synonym_candidate.push(term);
      });
    }

    if (this.currentNode.broader_term_candidate) {
      this.currentNode.broader_term_candidate.forEach((term) => {
        dbData.broader_term_candidate.push(term);
      });
    }

    if (this.tmpTermDescription.list && this.tmpTermDescription.list.length > 0) {
      dbData.term_description = this.tmpTermDescription.list[0];
    }

    if (this.tmpLanguage.list && this.tmpLanguage.list.length > 0) {
      dbData.language = this.tmpLanguage.list[0];
    }

    if (this.tmpCreatedTime.list && this.tmpCreatedTime.list.length > 0) {
      dbData.created_time = this.tmpCreatedTime.list[0];
    }

    if (this.tmpModifiedTime.list && this.tmpModifiedTime.list.length > 0) {
      dbData.modified_time = this.tmpModifiedTime.list[0];
    }

    if (this.tmpOtherVocSynUri.list && this.tmpOtherVocSynUri.list.length > 0) {
      dbData.other_voc_syn_uri = this.tmpOtherVocSynUri.list[0];
    }

    return dbData;
  }

  /**
   * Create history information
   * @param  {object} data - information of vocabulary
   * @return {object} - information of history
   */
  makeVocabularyHistoryData(data) {
    const obj = {
      id: '',
      term: '',
      preferred_label: '',
      idofuri: '',
      uri: '',
      broader_term: '',
      other_voc_syn_uri: '',
      term_description: '',
      language: '',
      created_time: '',
      modified_time: '',
    };
    obj.id = data.id;
    obj.term = data.term;
    obj.preferred_label = data.preferred_label;
    obj.idofuri = data.idofuri;
    obj.uri = data.uri;
    obj.broader_term = data.broader_term;
    obj.other_voc_syn_uri = data.other_voc_syn_uri;
    obj.term_description = data.term_description;
    obj.language = data.language;
    obj.created_time = data.created_time;
    obj.modified_time = data.modified_time;
    obj.confirm = data.confirm;

    return obj;
  }

  /**
   * Editing vocabulary data initialization
   * @param {array} dbData - list of editing vocabulary
   */
  setEditingVocabularyData(dbData) {
    const editingVocabulary = [];

    const uri_preferred_label = {};
    dbData.forEach( (data) => {
      // Make dictionary {uri: preferred_label}
      if (data.preferred_label && data.uri) {
          uri_preferred_label[data.uri] = data.preferred_label;
        }
    });

    dbData.forEach( (data) => {
      // Convert broader_uri into broader_term
      if (uri_preferred_label[data.broader_term] != undefined) {
        if((data.broader_term.indexOf("http://") != -1) || (data.broader_term.indexOf("https://") != -1)) {
          data.broader_term = uri_preferred_label[data.broader_term];
        }
      } else if (data.broader_term != null) {
        if ((data.broader_term.indexOf("http://") != -1) || (data.broader_term.indexOf("https://") != -1)) {
          data.broader_term = '';
        }
      }
      data.idofuri = data.uri.substring(data.uri.lastIndexOf('/')+1);

      // If the parameter is string (Set the empty string character)
      if (!data.preferred_label) data.preferred_label = '';
      if (!data.language) data.language = '';
      if (!data.uri) data.idofuri = '';
      if (!data.uri) data.uri = '';
      if (!data.broader_term) data.broader_term = '';
      if (!data.other_voc_syn_uri) data.other_voc_syn_uri = '';
      if (!data.term_description) data.term_description = '';
      if (!data.created_time) data.created_time = '';
      if (!data.modified_time) data.modified_time = '';
      if (!data.position_x) data.position_x = '';
      if (!data.position_y) data.position_y = '';
      if (!data.color1) data.color1 = '';
      if (!data.color2) data.color2 = '';

      // array
      if (!(data.synonym_candidate) || !(data.synonym_candidate[0])) {
        data.synonym_candidate = [];
      }
      if (!(data.broader_term_candidate) || !(data.broader_term_candidate[0])) {
        data.broader_term_candidate = [];
      }

      editingVocabulary.push(data);
    });

    this.editingVocabulary = editingVocabulary;
    this.initConfirmColor();
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
      if (uri_preferred_label[data.broader_term] != undefined) {
        if((data.broader_term.indexOf("http://") != -1) || (data.broader_term.indexOf("https://") != -1)) {
          data.broader_term = uri_preferred_label[data.broader_term];
        }
      } else if (data.broader_term != null) {
        if ((data.broader_term.indexOf("http://") != -1) || (data.broader_term.indexOf("https://") != -1)) {
          data.broader_term = '';
        }
      }

      data.idofuri = data.uri.substring(data.uri.lastIndexOf('/')+1);

      // If the parameter is string (Sets the empty string character)
      if (!data.preferred_label) data.preferred_label = '';
      if (!data.language) data.language = '';
      if (!data.uri) data.idofuri = '';
      if (!data.uri) data.uri = '';
      if (!data.broader_term) data.broader_term = '';
      if (!data.other_voc_syn_uri) data.other_voc_syn_uri = '';
      if (!data.term_description) data.term_description = '';
      if (!data.created_time) data.created_time = '';
      if (!data.modified_time) data.modified_time = '';

      referenceVocabulary.push(data);
    });

    return referenceVocabulary;
  }

  /**
   * Create editing vocabulary data from reference vocabulary
   * @param  {string} term - vocabulary
   * @param  {string} preferredLabel - preferred label
   * @param  {string} [language=null] - language
   * @param  {string} [uri=null] - URI
   * @param  {string} [broaderTerm=null] - broader term
   * @param  {string} [other_voc_syn_uri=null] - other voc syn uri
   * @param  {string} [term_description=null] - term description
   * @param  {string} [created_time=null] - created time
   * @param  {string} [modified_time=null] - modified time
   * @return {object} - editing vocbulary data
   */
  createFromReferenceVocabulary(
      term,
      preferredLabel,
      language = null,
      uri = null,
      broaderTerm = null,
      other_voc_syn_uri = null,
      term_description = null,
      created_time = null,
      modified_time = null,
  ) {
    const findData = this.editingVocabulary.find((data) => data.term == term);
    if (findData != undefined) {
      // Arguments:term is assumed to be a term not in the editing vocabulary, but returns existing data to avoid adding unnecessary data and terminating errors
      console.log(
          '[createFromReferenceVocabulary] ' +
          term +
          ' is already existed of editing_vocabulary.',
      );
      return findData;
    }

    const createData = {
      term: term,
      preferred_label: preferredLabel,
      language: '',
      uri: '',
      broader_term: '',
      other_voc_syn_uri: '',
      term_description: '',
      created_time: '',
      modified_time: '',
      synonym_candidate: [],
      broader_term_candidate: [],
      position_x: '',
      position_y: '',
      hidden: false,
      color1: 'black',
      color2: 'black',
      confirm: 0,
    };
    if (uri) createData.uri = uri;
    if (language) createData.language = language;
    if (broaderTerm) createData.broader_term = broaderTerm;
    if (other_voc_syn_uri) createData.other_voc_syn_uri = other_voc_syn_uri;
    if (term_description) createData.term_description = term_description;
    if (created_time) createData.created_time = created_time;
    if (modified_time) createData.modified_time = modified_time;
    return createData;
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
   * Index value update of the displayed example sentence
   * @param {string} mode 'next' or 'prev' string.
   */
  @action changeDispNowIndex(mode) {
    switch (mode) {
      case 'next':
        this.dispNowIndex += 1;
        break;
      case 'prev':
        this.dispNowIndex -= 1;
        break;
    }
  }

  /**
   * TextField candidate term referrer display text
   * @param {string} term - target vocabulary
   * @param {string} type 'broader_term' or 'Synonym'
   * @return {string} - source information
   */
  @action getReferenceFromData(term, type) {
    let str = '( ';

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

    str += ')';
    return str;
  }

  // Select file switch ////////////////////////////////////////////////////////////
  @observable selectedFile = {id: 0, name: '編集用語彙'};

  @observable isSelected = {ralation: false, vocabulary: true};

  /**
   * Visualization screen Initial display status update
   * @param {num} target - 0: related term, 1: vocabulary
   * @param {bool} value - true: not displayed, false: displayed
   */
  @action setSelected(target, value) {
    if (target == 0) {
      this.isSelected.ralation = value;
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
      return this.isSelected.ralation;
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
        if (!node.data.preferred_label) {
          // A vocabulary without a preferred label is an independent vocabulay without synonyms and so is mapped as a broader term
          const sourceId =
            this.getNodeIdByTerm(termListForVocabulary, node.broader_term);
          if ( '' != sourceId ) {
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
            if ( '' != sourceId ) {
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
              data.data.preferred_label == node.data.preferred_label );
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
                if (node.data.term === node.data.preferred_label) {
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

    return broaderTermEdges.concat(synonymEdges);
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
  }

  /**
   * Get the vocabulary associated with currentNode registered in the editing and reference vocabulary (De-duplication, sorted)
   * @param {string} type 'broader_term' or 'Synonym'
   * @return {array} - list of related term
   */
  @action getCandidateTermList(type) {
    const list = [];
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
    broader_term: '',
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
      broader_term: '',
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
    };
  }

  /**
   * Setting of new vocabulary
   * @param {string} newTerm - new vocabulary
   * @note assume vocabulary that is not in the editing vocabulary
   */
  setCurrentNodeByNewTerm(newTerm) {
    this.currentNode = {
      id: null,
      idofuri: '',
      uri: '',
      term: newTerm,
      language: '',
      preferred_label: '',
      part_of_speech: '',
      relationTermColor: '',
      vocabularyColor: '',
      hidden: false,
      broader_term: '',
      other_voc_syn_uri: '',
      term_description: '',
      created_time: '',
      modified_time: '',
      position_x: '',
      position_y: '',
      locked: null,
      color1: 'black',
      color2: 'black',
      confirm: 0,
    };
  }

  /**
   * Initialization of data being edited
   */
  tmpDataClear() {
    this.tmpIdofUri = {id: '', list: []};
    this.tmpIdofUriInit = true;
    this.tmpUri = {id: '', list: []};
    this.tmpUriInit = true;
    this.tmpLanguage = {id: '', list: []};
    this.tmpLanguageInit = true;
    this.tmpBroaderTerm = {id: '', list: []};
    this.tmpBroaderTermInit = true;
    this.tmpSynonym = {id: '', list: []};
    this.currentSynonym = {id: '', list: []};
    this.tmpSynonymInit = true;
    this.tmpPreferredLabel = {id: '', list: []};
    this.tmpPreferredLabelInit = true;
    this.tmpOtherVocSynUri = {id: '', list: []};
    this.tmpOtherVocSynUriInit = true;
    this.tmpTermDescription = {id: '', list: []};
    this.tmpTermDescriptionInit = true;
    this.tmpCreatedTime = {id: '', list: []};
    this.tmpCreatedTimeInit = true;
    this.tmpModifiedTime = {id: '', list: []};
    this.tmpModifiedTimeInit = true;
    this.tmpBorderColor =
        {id: this.currentNode.id, color: this.currentNode.color1};
    this.tmpVocabularycolor =
        {id: this.currentNode.id, color: this.currentNode.color2};
  }

  /**
   * Whether the selected term has been edited and is pending
   * @return {boolean} - true: contain changes, false: not contain changes
   */
  @computed get isCurrentNodeChanged() {
    // Id of URI
    if (this.isIdofUriChanged()) {
      return true;
    }

    // URI
    if (this.isUriChanged()) {
      return true;
    }

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

    // Language
    if (this.isLanguageChanged()) {
      return true;
    }

    // Created time
    if (this.isCreatedTimeChanged()) {
      return true;
    }

    // Modified time
    if (this.isModifiedTimeChanged()) {
      return true;
    }

    // Other Voc Syn Uri
    if (this.isOtherVocSynUriChanged()) {
      return true;
    }

    return false;
  }

  /**
   * Determine if Id of URI is changed
   * @return {boolean} - true: contain changes, false: not contain changes
   */
   isIdofUriChanged() {
    if (this.currentNode.idofuri) {
      if (this.tmpIdofUri.list.length == 1) {
        const tmpIdofUri = this.tmpIdofUri.list[0];
        if (this.currentNode.idofuri === tmpIdofUri) {
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
        const tmpUri = this.tmpUri.list[0];
        if (this.currentNode.uri === tmpUri) {
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
    if (this.currentNode.preferred_label) {
      if (this.tmpPreferredLabel.list.length == 1) {
        const tmpPrfrdLbl = this.tmpPreferredLabel.list[0];
        if (this.currentNode.preferred_label === tmpPrfrdLbl) {
          return false;
        } else {
          return true;
        }
      } else {
        // Has changed if not one is being edited
        return true;
      }
    } else {
      if (this.tmpPreferredLabel.list.length == 0) {
        return false;
      } else {
        // If it is not set, even one is changed if it is being edited
        return true;
      }
    }
  }

  /**
   * Determine if the broader term is changed
   * @return {boolean} - true: contain changes, false: not contain changes
   */
  isBrdrTermChanged() {
    if (this.currentNode.broader_term) {
      if (this.tmpBroaderTerm.list.length == 1) {
        const tmpBrdrTerm = this.tmpBroaderTerm.list[0];
        if (this.currentNode.broader_term === tmpBrdrTerm) {
          return false;
        } else {
          return true;
        }
      } else {
        // Has changed if not one is being edited
        return true;
      }
    } else {
      if (this.tmpBroaderTerm.list.length == 0) {
        return false;
      } else {
        // If it is not set, even one is changed if it is being edited
        return true;
      }
    }
  }

  /**
   * Determine if synonyms are changed
   * @return {boolean} - true: contain changes, false: not contain changes
   */
  isSynonymChanged() {
    if (this.currentSynonym.list.length == 0) {
      if (this.tmpSynonym.list.length == 0) {
        return false;
      } else {
        return true;
      }
    } else {
      if (this.tmpSynonym.list.length == 0) {
        return true;
      } else {
        let isAllMatched = true;
        this.currentSynonym.list.forEach((current) => {
          const find = this.tmpSynonym.list.find((tmp) => tmp == current);
          if (!find) {
            isAllMatched = false;
          }
        });
        this.tmpSynonym.list.forEach((current) => {
          const find = this.currentSynonym.list.find((tmp) => tmp == current);
          if (!find) {
            isAllMatched = false;
          }
        });
        if (isAllMatched) {
          return false;
        } else {
          return true;
        }
      }
    }
  }

  /**
   * Determine if the term description has been changed
   * @return {boolean} - true: contain changes, false; not contain changes
   */

   isTermDescriptionChanged() {
    if (this.currentNode.term_description) {
      if (this.tmpTermDescription.list.length == 1) {
        const tmpTermDescription = this.tmpTermDescription.list[0];
        if (this.currentNode.term_description === tmpTermDescription) {
          return false;
        } else {
          return true;
        }
      } else {
        // Modified if not one is being edited
        return true;
      }
    } else {
      if (this.tmpTermDescription.list.length == 0) {
        return false;
      } else {
        // If it is not set, even one is changed if it is being edited
        return true;
      }
    }
  }

/**
 * Determine if the language has been changed
 * @return {boolean} - true: contain changes, false; not contain changes
 */
 isLanguageChanged() {
  if (this.currentNode.language) {
    if (this.tmpLanguage.list.length == 1) {
      const tmpLanguage = this.tmpLanguage.list[0];
      if (this.currentNode.language === tmpLanguage) {
        return false;
      } else {
        return true;
      }
    } else {
      // Modified if not one is being edited
      return true;
    }
  } else {
    if (this.tmpLanguage.list.length == 0) {
      return false;
    } else {
      // If it is not set, even one is changed if it is being edited
      return true;
    }
  }
}

/**
 * Determine if the created time has been changed
 * @return {boolean} - true: contain changes, false; not contain changes
 */
 isCreatedTimeChanged() {
  if (this.currentNode.created_time) {
    if (this.tmpCreatedTime.list.length == 1) {
      const tmpCreatedTime = this.tmpCreatedTime.list[0];
      if (this.currentNode.created_time === tmpCreatedTime) {
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
      const tmpOtherVocSynUri = this.tmpOtherVocSynUri.list[0];
      if (this.currentNode.other_voc_syn_uri === tmpOtherVocSynUri) {
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
   * @param {String} term - vocbulary
   * @param {number} [id=null] id
   * @param {array} [synonymList=null] - configuration synonym list
   * @param {boolean} [isForce=false] - forced selection
   */
  @action setCurrentNodeByTerm(
      term, id = '', synonymList = null, isForce = false) {
    let target = {};
    if (!id) {
      target = this.getTargetFileData(this.selectedFile.id).find((obj) => {
        return (obj.term == term);
      });
    } else {
      target = this.getTargetFileData(this.selectedFile.id).find((obj) => {
        return (obj.id == id);
      });
    }

    if (undefined == target) {
      console.log('[setCurrentNodeByTerm] Not Found term:' + term + '.');
      this.currentNodeClear();
      this.tmpDataClear();
      return;
    }

    // Deselect selected terms when they are reselected
    if (!isForce) {
      if (target.term === this.currentNode.term) {
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

    this.tmpDataClear();

    this.tmpIdofUri = {id: this.currentNode.id, list:[]};
    if (this.currentNode.idofuri) {
      this.tmpIdofUri.list.push(this.currentNode.idofuri);
    }
    this.tmpUri = {id: this.currentNode.id, list:[]};
    if (this.currentNode.uri) {
      this.tmpUri.list.push(this.currentNode.uri);
    }
    this.tmpBroaderTerm = {id: this.currentNode.id, list: []};

    if (this.currentNode.broader_term) {
      this.tmpBroaderTerm.list.push(this.currentNode.broader_term);
    }

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
    this.tmpPreferredLabel = {id: this.currentNode.id, list: []};
    if (preferredLabel) {
      this.tmpPreferredLabel.list.push(preferredLabel);
    }

    if (synonymList) {
      this.currentSynonym = {id: this.currentNode.id, list: synonymList};
    } else {
      if (this.currentNode.preferred_label) {
        const synonymNode =
            this.getTargetFileData(this.selectedFile.id).filter((node) =>
              node.preferred_label === this.currentNode.preferred_label,
            );
        this.currentSynonym = {id: this.currentNode.id, list: []};
        synonymNode.forEach((synonym) => {
          if (synonym.term != this.currentNode.term) {
            this.currentSynonym.list.push(synonym.term);
          }
        });
      }
    }
    this.tmpSynonym.list = this.currentSynonym.list;

    this.tmpTermDescription ={id: this.currentNode.id, list:[]};
    if (this.currentNode.term_description) {
      this.tmpTermDescription.list.push(this.currentNode.term_description);
    }

    if (this.currentNode.language) {
      this.tmpLanguage = {id: this.currentNode.id, list: [this.currentNode.language]};
    }

    if (this.currentNode.created_time) {
      this.tmpCreatedTime = {id: this.currentNode.id, list: [this.currentNode.created_time]};
    }

    if (this.currentNode.modified_time) {
      this.tmpModifiedTime = {id: this.currentNode.id, list: [this.currentNode.modified_time]};
    }

    if (this.currentNode.other_voc_syn_uri) {
      this.tmpOtherVocSynUri = {id: this.currentNode.id, list: [this.currentNode.other_voc_syn_uri]};
    }

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
      this.setCurrentNodeByTerm('', currentId, null, true);
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
          this.broaderUriToBroaderTerm = false;
          // this.setEditingVocabularyData(response.data);
          // // Reselect to reset tmp information
          // this.setCurrentNodeByTerm(updateCurrent.term,
          //     '', null, true);

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

  @observable tmpVocabularycolor = {id: '', color: ''};

  /**
   * Vocabulary tab color selection event
   * @param  {string} id - target vocabulary id
   * @param  {string} color - selected color
   */
  @action selectTmpVocabularycolor(id, color) {
    if ( (this.tmpVocabularycolor.id !== '') &&
        (this.tmpVocabularycolor.color != color) ) {
      this.tmpVocabularycolor = {id: id, color: color};
    }
  }

  sortData = [
    {key: 'ascend', value: '昇順'},
    {key: 'descend', value: '降順'},
  ];

  @observable currentSort = {key: 'ascend', value: '昇順'};

  /**
   * Sort switching
   * @param {string} orderKey 'ascend' or 'descend'
   */
  @action changeSort(orderKey) {
    this.currentSort = this.sortData.find((obj) => {
      return (obj.key == orderKey);
    });
  }

  /**
   * Returns a sorted list of vocabulary lists by sort specification
   * @return {array} - sort list
   */
  @computed get sortedNodeList() {
    let targetData;
    // Temporary processing. Needs correction when repairing homotopic 
    // -------------------------- 
    // if (this.currentVisualTab.id === 0) {
    //   const editingVocabulary = this.editingVocabulary;
    //   let referenceVocabulary = [];
    //   switch (this.homotopicFile.id) {
    //     case 1: referenceVocabulary = this.referenceVocabulary1; break;
    //     case 2: referenceVocabulary = this.referenceVocabulary2; break;
    //     case 3: referenceVocabulary = this.referenceVocabulary3; break;
    //     default: break;
    //   }

    //   // only the editing vocabulary is displayed. 
    //   targetData = editingVocabulary
    // } else {
      targetData = this.getTargetFileData(this.selectedFile.id);
    // }

    if (this.currentSort.key == 'ascend') {
      return targetData.slice().sort((a, b) => {
        const lowerA = a.term.toString().toLowerCase();
        const lowerB = b.term.toString().toLowerCase();
        if (lowerA > lowerB) {
          return 1;
        } else {
          return -1;
        }
      });
    } else {
      // descend
      return targetData.slice().sort((a, b) => {
        const lowerA = a.term.toString().toLowerCase();
        const lowerB = b.term.toString().toLowerCase();
        if (lowerA < lowerB) {
          return 1;
        } else {
          return -1;
        }
      });
    }
  }

  // Visualization screen selection tab information ///////////////////////////////////////////////////
  @observable currentVisualTab = {id: 0};
  // id = 0 : Related terms tab
  // id = 1 : Vocabulary tab

  /**
   * Table visualization screen selection tab update
   * @param {number} id index
   */
  @action selectCurrentVisualTab(id) {
    console.log('[selectCurrentVisualTab] id: ' + id);
    this.currentVisualTab.id = id;
  }

  // Homotopic display selection file switching ///////////////////////////////////////////////////
  @observable homotopicFile = {id: 1, name: '参照用語彙1'};
  // @observable homotopicFile = {id: 0, name: '--------'};

  /**
   * Display vocabulary data selection
   * @param {number} id index
   */
  @action selectHomotopicFile(id) {
    console.log('[selectHomotopicFile] id: ' + id);

    if (this.homotopicFile.id == id) return;
    switch (id) {
      // case 0:
      //   this.homotopicFile = {id: 0, name: '--------'};
      //   break;
      case 1:
        this.homotopicFile = {id: 1, name: '参照用語彙1'};
        break;
      case 2:
        this.homotopicFile = {id: 2, name: '参照用語彙2'};
        break;
      case 3:
        this.homotopicFile = {id: 3, name: '参照用語彙3'};
        break;
      default:
        break;
    }
    this.currentNodeClear();
    this.tmpDataClear();
  }

  /**
   * Edit operation tab map panel get coordinates for display
   * @return {object} - edit operation tab coordinates panel display coordinates
   */
  getCurrentNodePosition() {
    const editingVocabFile = this.editingVocabulary;
    const currentRefFile = this.getTargetFileData(this.homotopicFile.id);
    let currentPos = {
      position_x: this.currentNode.position_x,
      position_y: this.currentNode.position_y,
    };
    let selectedPosX;
    let selectedPosY;

    const edit = editingVocabFile.find(
        (edit) => this.currentNode.term === edit.term);

    const refere = currentRefFile.find(
        (ref) => this.currentNode.term === ref.term);

    const magForRef = config.magnification[0].reference;

    let posXMultipliedByMag;
    let posYMultipliedByMag;

    if (refere) {
      posXMultipliedByMag = refere.position_x;
      posYMultipliedByMag = refere.position_y;

      // Set the magnification of the reference vocabulary
      if (magForRef > 0) {
        posXMultipliedByMag *= magForRef;
        posYMultipliedByMag *= magForRef;
      } else if (magForRef < 0) {
        posXMultipliedByMag /= magForRef * -1;
        posYMultipliedByMag /= magForRef * -1;
      }
    }

    if (edit && refere) {
      currentPos.position_x = edit.position_x;
      currentPos.position_y = edit.position_y;

      selectedPosX = edit.position_x;
      selectedPosY = edit.position_y;
      if (!selectedPosX && !selectedPosY) {
        selectedPosX = refere.position_x;
        selectedPosY = refere.position_y;
      }

      // Hides the coordinate values in the edit operations panel when for the coordinate values (0, 0)
      if (!(selectedPosX == 0 && selectedPosY == 0) &&
        (currentPos.position_x === 0 && currentPos.position_y === 0)) {
        selectedPosX = edit.position_x;
        selectedPosY = edit.position_y;
        currentPos = null;
      }
    } else if (edit) {
      currentPos.position_x = edit.position_x;
      currentPos.position_y = edit.position_y;

      selectedPosX = edit.position_x;
      selectedPosY = edit.position_y;

    } else if (refere) {
      // For terms in reference vocabulary only
      currentPos.position_x = 0;
      currentPos.position_y = 0;

      selectedPosX = refere.position_x;
      selectedPosY = refere.position_y;

      currentPos = null;
    }

    if (currentPos) {
    // Rounds down to eight decimal places 
    currentPos.position_x = this.orgFloor(currentPos.position_x, 100000000);
    currentPos.position_y = this.orgFloor(currentPos.position_y, 100000000);
    }

    // Hide coordinate values if they do not exist when importing data
    if (!selectedPosX && !selectedPosY) {
      currentPos = null;
    }

    return currentPos;
  }

  /**
 * Function to truncate to any digit
 * @param {number} value - number to round off
 * @param {number} base - which digits to truncate (10 - > 10 place, 0.1 - > 1 decimal place)
 * @return {number} - truncated value
 */
  orgFloor(value, base) {
    return Math.floor(value * base) / base;
  }

  // //////////////////////////////////////////////////////

  // node display MAX number
  DISP_NODE_MAX = 100;

  // Data for controlling graph contraction of visualization screen panel related term tab
  @observable tmpRelationWordMinZoom = {thinOut: false, value: -1};

  /**
   * Initialize min zoom factor
   * @param  {number} zoom - magnification
   */
  @action initRelationWordMinZoom(zoom) {
    if (zoom == -1) {
      this.tmpRelationWordMinZoom = {thinOut: false, value: -1};
      // console.log('[RelationWordTab] reset tmpRelationWordMinZoom');
      return;
    }

    if (this.tmpRelationWordMinZoom.value == -1) {
      this.tmpRelationWordMinZoom = {thinOut: false, value: zoom};
      return;
    }
  }

  /**
   * Minimum zoom magnification update
   * @param  {number} zoom - zoom magnification
   */
  @action updateRelationWordMinZoom(zoom) {
    const before = this.tmpRelationWordMinZoom.thinOut;
    if (this.tmpRelationWordMinZoom.value > zoom) {
      this.tmpRelationWordMinZoom.thinOut = true;
    } else {
      this.tmpRelationWordMinZoom.thinOut = false;
    }
    if ( true == before && false == this.tmpRelationWordMinZoom.thinOut ) {
      this.currentNodeClear();
    }
  }

  /**
   * Generate vocabulary list for visualization screen panel related terms tab
   * @return {array} - generate vocabulary list
   */
  @computed get termListForRelationWord() {
    // Combine reference vocabulary data specified on the related terms tab into a list
    const editingVocabulary = this.editingVocabulary;
    let referenceVocabulary = [];
    switch (this.homotopicFile.id) {
      case 1: referenceVocabulary = this.referenceVocabulary1; break;
      case 2: referenceVocabulary = this.referenceVocabulary2; break;
      case 3: referenceVocabulary = this.referenceVocabulary3; break;
      default: break;
    }

    // Add only terms that are not in the editing vocabulary
    const margeData = [];
    referenceVocabulary.forEach((merge) => {
      const find = editingVocabulary.find((data) => data.term === merge.term);
      if (!find) {
        margeData.push(merge);
      }
    });

    // Related terms all terms of the editorial and reference terms displayed on the screen
    const targetData = [
      ...editingVocabulary,
      ...margeData,
    ];

    const termListForRelationWord = [];

    // Because related terms have a mix of editing and reference terms, you cannot use the ID for each of the potentially duplicate terms, so issue a unique ID
    let idCounter = 0;

    targetData.forEach((data) => {
      // Extracts reference vocabulary data for homotopic display
      const find = referenceVocabulary.find(
          (refere) => data.term === refere.term);

      const nodeData = this.createNodeDataForRelation(data, find, idCounter);
      if (nodeData) {
        termListForRelationWord.push(nodeData);
        idCounter += 1;
      }
    });

    // Since the node that was listed later has priority, the descending sort order is selected
    if (this.tmpRelationWordMinZoom.thinOut) {
      // Weeding sort
      termListForRelationWord.sort((a, b) => {
        if (a.randomId > b.randomId) return -1;
        if (a.randomId < b.randomId) return 1;
        return 0;
      });
      const currentIndex =
        termListForRelationWord.findIndex((element) =>
          this.isCurrentNode(element));
      if (-1 != currentIndex) {
        this.moveAt(
            termListForRelationWord,
            currentIndex,
            (termListForRelationWord.length - 1),
        );
      }
    } else {
      // Sort by origin
      termListForRelationWord.sort((a, b) => {
        if (a.distance > b.distance) return -1;
        if (a.distance < b.distance) return 1;
        return 0;
      });
      const currentIndex =
        termListForRelationWord.findIndex((element) =>
          this.isCurrentNode(element));
      if (-1 != currentIndex) {
        this.moveAt(
            termListForRelationWord,
            currentIndex,
            (termListForRelationWord.length - 1),
        );
      }

      // termListForRelationWord =
      //  termListForRelationWord.slice(
      //      (termListForRelationWord.length - this.DISP_NODE_MAX),
      //      termListForRelationWord.length,
      //  );
    }

    return termListForRelationWord;
  }

  /**
   * Create nodedata for related terms tab
   * @param {object} data editing or reference vocabulary
   * @param {object} refer reference vocabulary
   * @param {Number} idCounter id
   * @return {object} cytoscape node object
   */
  createNodeDataForRelation(data, refer, idCounter) {
    // Do not list data that does not have coordinate information
    // if (!data || !data.position_x) return null;
    if (!data) return null;

    const randomId =
      Math.floor(Math.random() * Math.floor(1000000000000000));
    const position =
      this.calcPositionValueForHomotopic(data, refer);

    return {
      data: {
        id: idCounter,
        term: data.term,
        hidden: (data.hidden)?data.hidden:false,
        relationTermColor: (data.color1)?data.color1:'black',
        confirm: data.confirm,
        // has_position: (!data.position_x || data.position_y !== null),
      },
      position: {
        x: position.x,
        y: position.y,
      },
      locked: true,
      // Random number for filter
      randomId: randomId,
      distance: Math.sqrt(
          Math.pow(Math.abs(position.x), 2) +
          Math.pow(Math.abs(position.y), 2),
      ),
    };
  }

  /**
   * Related terms tab coordinate value calculation
   * @param  {object} relationTerm - editing vocabulary data or reference vocabulary data
   * @param  {object} refer - reference vocabulary data with the same term as relationTerm
   * @return {object} - related term coordinate value
   */
  calcPositionValueForHomotopic(relationTerm, refer) {
    const position = {x: null, y: null};
    const editingVocabFile = this.editingVocabulary;
    const magForRef = config.magnification[0].reference;

    const edit = editingVocabFile.find(
        (edit) => relationTerm.term === edit.term);

    if (edit && refer) {
      // Calculates line coordinates for common editing and reference terms
      position.x =
      this.calcPositionByHomotopic(edit.position_x);
      position.y =
      this.calcPositionByHomotopic(edit.position_y);
    } else if (edit) {
      // For terms in editing vocabulary only
      position.x =
        this.calcPositionByHomotopic(edit.position_x);
      position.y =
        this.calcPositionByHomotopic(edit.position_y);
    } else if (refer) {
      // For reference terms only
      position.x =
      this.calcPositionByHomotopic(0);
      position.y =
      this.calcPositionByHomotopic(0);
    }
    position.y *= -1;
    return position;
  }

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
   * @return {Number} - reverse value
   */
   calcReversePosition(position) {     
    const ret =  Math.sign(position)*1.0/10000.0*Math.pow(Math.E, 4.0/3.0*Math.log(1.0/2.0*Math.abs(position)));
    return ret;
  }

  /**
   * [calcPositionByHomotopic description]
   * @param  {Number} a vec0 - coordinate value
   * @return {Number} - coordinate value
   */
  calcPositionByHomotopic(a) {
    const value = a;
    return this.calcPosition(value);
  }

  /**
   * Visualization screen panel creating vocabulary list for vocabulary tab
   * @return {array} - vocabulary list
   */
  @computed get termListForVocabulary() {
    const targetData = this.getTargetFileData(this.selectedFile.id);

    const termListForVocabulary = [];
    targetData.forEach((data) => {

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

  /**
   * Move elements at index to at
   * @param  {array} array - list
   * @param  {number} index - source element index
   * @param  {number} at - destination element index
   * @return {array} - update list
   */
  moveAt(array, index, at) {
    if (index === at || index > array.length -1 || at > array.length - 1) {
      return array;
    }

    const value = array[index];
    const tail = array.slice(index + 1);

    array.splice(index);

    Array.prototype.push.apply(array, tail);

    array.splice(at, 0, value);

    return array;
  }

  // Hidden filter //////////////////////////////////////////////////

  /**
   * Hidden filter switching
   * @param  {Boolean} [isHistory=false] - request by undo/redo?
   */
  @action changeHidden(isHistory = false) {
    if (!(this.currentNode.id)) return;

    const requestBody = [];

    const updateCurrent = {...this.currentNode};
    const history = new History(
        'hidden',
        updateCurrent.id,
        updateCurrent.hidden,
        !(updateCurrent.hidden),
    );
    updateCurrent.hidden = !(updateCurrent.hidden);

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
          this.broaderUriToBroaderTerm = false;
          this.setEditingVocabularyData(response.data);
          // Reselect to reset tmp information
          this.setCurrentNodeByTerm(updateCurrent.term,
              updateCurrent.id, null, true);
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
          this.openApiErrorDialog('表示/非表示情報変更エラー', errCode, errMsg);
        });
  };

  // Vocabulary data update //////////////////////////////////////////////////

  /**
   * Updating synonyms, preferred label, URI, and broader term
   * @return {string} - error message
   */
  @action updateVocabulary() {
    const error = this.errorCheck();
    if (error != '') {
      return error;
    }

    if (!this.currentNode.id) {
      // When a term is not selected, if a term is entered in the title field, select the term
      if (this.tmpPreferredLabel.list[0]) {
        this.setCurrentNodeByNewTerm(this.tmpPreferredLabel.list[0]);
      } else {
        return '';
      }
    }

    const updateTermList = [];
    const deleteIdList = [];
    const history = new History('vocabulary', this.currentNode.id);
    const previous = [];
    const following = [];

    if (this.currentNode.id) {
      // If the selected term is not in the editing vocabulary data, register it as a new term.
      // This is the case when the term is not selected and the term is entered in the title field
      previous.push(this.makeVocabularyHistoryData(this.currentNode));
    }

    // Add selected vocabulary
    const updateCurrent = this.createDBFormatDataByCurrentNode();

    following.push(this.makeVocabularyHistoryData(updateCurrent));
    updateTermList.push(updateCurrent);

    // Updating vocabulary information by updating a broader term //////////////////

    // Pre-Update broader term (current superordinate)
    const strPrevBrdrTrm = this.currentNode.broader_term;
    // Updated broader term
    const strNextBrdrTrm = this.tmpBroaderTerm.list[0];

    if (this.isUpdateBroaderTerm(strPrevBrdrTrm, strNextBrdrTrm)) {
      this.updateVocabularyForBroaderTerm(
          strPrevBrdrTrm,
          strNextBrdrTrm,
          updateCurrent,
          updateTermList,
          deleteIdList,
          previous,
          following,
      );
    }

    // Vocabulary information update by synonym update //////////////////

    // List of synonyms deleted in the update
    const deleteSynonymList =
      this.currentSynonym.list.filter((i) =>
        this.tmpSynonym.list.indexOf(i) == -1);
    if (deleteSynonymList.length > 0) {
      console.log('delete synonym: ' + deleteSynonymList);
    }

    // List of synonyms added in the update
    const addSynonymList =
      this.tmpSynonym.list.filter((i) =>
        this.currentSynonym.list.indexOf(i) == -1);
    if (addSynonymList.length > 0) {
      console.log('add synonym: ' + addSynonymList);
    }

    // Updated synonym list
    const nextSynonymList = this.tmpSynonym.list;

    this.updateVocabularyForSynonym(
        deleteSynonymList,
        nextSynonymList,
        updateCurrent,
        updateTermList,
        deleteIdList,
        previous,
        following,
    );

    // Updating vocabulary information by updating preferred label //////////////////

    // Pre-update preferred label
    const prevPrfrdLbl = this.currentNode.preferred_label;
    // Updated preferred label
    const nextPrfrdLbl = updateCurrent.preferred_label;

    this.updateVocabularyForPreferredLabel(
        prevPrfrdLbl,
        nextPrfrdLbl,
        updateCurrent,
        updateTermList,
        deleteIdList,
        previous,
        following,
    );

    // Pre-Update synonym of of broader term //////////////////
    // Pre-Update uri of broader term
    const prevUriofSynofBrdr = [];
    // Pre-Update synonym of of broader term
    const prevSynofBrdr = [];
    const findprevUriofSynofBrdr = this.editingVocabulary.find( (data) =>
      data.term === strPrevBrdrTrm);
    if (findprevUriofSynofBrdr == undefined) {
    }
    else {
      prevUriofSynofBrdr.push(findprevUriofSynofBrdr.uri);

      const findprevSynofBrdr = this.editingVocabulary.filter( (data) =>
        data.uri == prevUriofSynofBrdr);
      findprevSynofBrdr.forEach((data) => {
        prevSynofBrdr.push(data.term);
      });
    }

    // Updated broader term synonym of of broader term //////////////////
    // Updated uri of broader term
    const nextUriofSynofBrdr = [];
    // Updated synonym of of broader term
    const nextSynofBrdr = [];
    const findnextUriofSynofBrdr = this.editingVocabulary.find( (data) =>
      data.term === strNextBrdrTrm);
    if (findnextUriofSynofBrdr == undefined) {
    }
    else {
      nextUriofSynofBrdr.push(findnextUriofSynofBrdr.uri);

      const findnextSynofBrdr = this.editingVocabulary.filter( (data) =>
        data.uri == nextUriofSynofBrdr);
      findnextSynofBrdr.forEach((data) => {
        nextSynofBrdr.push(data.term);
      });
    }

    //  updated vocabulary list //////////////////
    if (strPrevBrdrTrm != strNextBrdrTrm) {
      if (strPrevBrdrTrm == undefined) {
        this.editingVocabulary.forEach((data) => {
          if (data.term == strNextBrdrTrm) {
            const addData = this.createFromReferenceVocabulary(data.term,
                                                               data.preferredLabel,
                                                               data.language,
                                                               data.uri, 
                                                               data.broaderTerm, 
                                                               data.other_voc_syn_uri, 
                                                               data.term_description,
                                                               data.created_time,
                                                               data.modified_time);
            updateTermList.push(addData);
          }
          nextSynofBrdr.forEach((datanextSynofBrdr) => {
            if (data.term == datanextSynofBrdr) {
              const addData = this.createFromReferenceVocabulary(data.term,
                                                                 data.preferredLabel,
                                                                 data.language,
                                                                 data.uri, 
                                                                 data.broaderTerm, 
                                                                 data.other_voc_syn_uri, 
                                                                 data.term_description,
                                                                 data.created_time,
                                                                 data.modified_time);
              updateTermList.push(addData);
            }
          });
        });
      }

      if (strNextBrdrTrm == undefined) {
        this.editingVocabulary.forEach((data) => {
          if (data.term == strPrevBrdrTrm) {
            const addData = this.createFromReferenceVocabulary(data.term,
                                                              data.preferredLabel,
                                                              data.language,
                                                              data.uri, 
                                                              data.broaderTerm, 
                                                              data.other_voc_syn_uri, 
                                                              data.term_description,
                                                              data.created_time,
                                                              data.modified_time);
            updateTermList.push(addData);
          }
          prevSynofBrdr.forEach((dataprevSynofBrdr) => {
            if (data.term == dataprevSynofBrdr) {
              const addData = this.createFromReferenceVocabulary(data.term,
                                                                data.preferredLabel,
                                                                data.language,
                                                                data.uri, 
                                                                data.broaderTerm, 
                                                                data.other_voc_syn_uri, 
                                                                data.term_description,
                                                                data.created_time,
                                                                data.modified_time);
              updateTermList.push(addData);
            }
          });
        });
      }

      if (strPrevBrdrTrm != undefined && strNextBrdrTrm != undefined) {
        this.editingVocabulary.forEach((data) => {
          if (data.term == strPrevBrdrTrm) {
            const addData = this.createFromReferenceVocabulary(data.term,
                                                              data.preferredLabel,
                                                              data.language,
                                                              data.uri, 
                                                              data.broaderTerm, 
                                                              data.other_voc_syn_uri, 
                                                              data.term_description,
                                                              data.created_time,
                                                              data.modified_time);
            updateTermList.push(addData);
          }
          if (data.term == strNextBrdrTrm) {
            const addData = this.createFromReferenceVocabulary(data.term,
                                                               data.preferredLabel,
                                                               data.language,
                                                               data.uri, 
                                                               data.broaderTerm, 
                                                               data.other_voc_syn_uri, 
                                                               data.term_description,
                                                               data.created_time,
                                                               data.modified_time);
            updateTermList.push(addData);
          }
          prevSynofBrdr.forEach((dataprevSynofBrdr) => {
            if (data.term == dataprevSynofBrdr) {
              const addData = this.createFromReferenceVocabulary(data.term,
                                                                data.preferredLabel,
                                                                data.language,
                                                                data.uri, 
                                                                data.broaderTerm, 
                                                                data.other_voc_syn_uri, 
                                                                data.term_description,
                                                                data.created_time,
                                                                data.modified_time);
              updateTermList.push(addData);
            }
          });
          nextSynofBrdr.forEach((datanextSynofBrdr) => {
            if (data.term == datanextSynofBrdr) {
              const addData = this.createFromReferenceVocabulary(data.term,
                                                                 data.preferredLabel,
                                                                 data.language,
                                                                 data.uri, 
                                                                 data.broaderTerm, 
                                                                 data.other_voc_syn_uri, 
                                                                 data.term_description,
                                                                 data.created_time,
                                                                 data.modified_time);
              updateTermList.push(addData);
            }
          });
        });
      }
    }
    
  
    // if new added term, uri assign unique number  //////////////////　
    // number list of uri(this.editingVocabulary)
    const editingVocabularyUriNum = [];   
    this.editingVocabulary.forEach((data) => {
      editingVocabularyUriNum.push(Number(data.uri.substring(data.uri.lastIndexOf('/')+1)));
    });

    const uriNumFillList = editingVocabularyUriNum.filter(data => data);
    
    // Duplicate delete
    const UriNumList = uriNumFillList.filter(function (x, i, self){ 
      return self.indexOf(x) === i;
    });


    let uriNumFinal = Math.max(...UriNumList)+1;
    
    // uri number of before
    let urihttp = this.editingVocabulary.find((data) => data.uri);
    urihttp = urihttp.uri;

    // if new added term, uri assign unique number
    const addDataUri = updateTermList.forEach((data) => {
      if (data.uri == ''){
        data.uri = urihttp.replace(urihttp.substring(urihttp.lastIndexOf('/')+1), uriNumFinal);

        UriNumList.push(uriNumFinal); // updating number list of uri(this.editingVocabulary)
        uriNumFinal = Math.max(...UriNumList)+1;
      }
    });
    //  updated vocabulary list
    if (addDataUri != undefined) {
      updateTermList.push(addDataUri);
    }

    // Save the information before and after the change in the history information
    history.previous = previous;
    history.following = following;
    this.updateRequest(updateTermList, deleteIdList, updateCurrent, history);

    return '';
  }


  /**
   * Delete Vocabulary
   * 
   */
   @action deleteVocabulary(){

   
    const target = this.currentNode;  

    if( 1 > this.selectedTermList.length) return;
    if( !target) return;
    
    const previous = [target];
    const following = [];
    const updateTermList=[];

    this.editingVocabulary.forEach((obj) => {
      let pushed=false;
      let tmpObj={ ...obj };

      // Delete if it is included in the preferred_label
      if (obj.preferred_label && target.preferred_label && obj.id != target.id 
        && obj.preferred_label == target.preferred_label){
        pushed=true;
        obj.preferred_label =obj.term;
      }

      // Delete if it is included in the broader_term
      if (obj.broader_term && obj.broader_term == target.term){
        pushed=true;
        obj.broader_term ='';
      }
      if(pushed){
        previous.push(tmpObj);
        following.push(obj);
        updateTermList.push(obj);
      }
    });

    const history = new History('vocabulary', target.id);
    history.previous = previous;
    history.following = following;
    history.targetId = target.id;
 
    editingHistoryStore.addHistory(history);

    this.updateRequest(updateTermList,[target.id], target);
    
    
    this.currentNodeClear();
    this.tmpDataClear();
    this.setSelectedTermList(target.term); // Remove target from selected terms
  }

  /**
   * Updating coordinate values etc. to DB 
   * @param  {object} nodes - cytoscape nodes
   * @return {string} - error message
   */
  @action updateVocabularys( nodes) {
    const error = this.errorCheck();
    if (error != '') {
      return error;
    }

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
          position_x = this.calcReversePosition( posi.x);
          position_y = this.calcReversePosition( posi.y);

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
      if (item.broader_term_candidate) {
        item.broader_term_candidate.forEach((term) => {
          dbData.broader_term_candidate.push(term);
        });
      }
      updateTermList.push( dbData);
    }
    if( updateTermList.length > 0){
      this.updateRequest(updateTermList, [], updateTermList[0], null, null, false);
    }
    
    return '';
  }

  /**
   * Determine whether a broader term is updated
   * @param  {String} prev - pre-update broader term (may be undefined)
   * @param  {String} next - updated broader term (may be undefined)
   * @return {Boolean} - true: contain update, false: not contain update
   */
  isUpdateBroaderTerm(prev, next) {
    if (!prev && next) {
      // Register broader term
      console.log('Added BroaderTerm: ' + next);
      return true;
    } else if (prev && !next) {
      // Delete broader term
      console.log('Delete BroaderTerm: ' + prev);
      return true;
    } else if (!prev && !next) {
      // Unedited broader term
      return false;
    } else if (prev !== next) {
      // Update broader term
      console.log('Changed BroaderTerm: ' + prev + ' => ' + next);
      return true;
    }

    return false;
  }

  /**
   * Updating vocabulary information by updating a broader term
   * @param  {String}   strPrevBrdrTrm - pre-update broader term (IN)
   * @param  {String}   strNextBrdrTrm - updated broader term (IN)
   * @param  {Object}   updateCurrent - updated vocabulary information (IN)
   * @param  {Array}    updateTermList - list of terms to be updated (IN/OUT)
   * @param  {Array}    deleteIdList - Id list to be deleted (IN/OUT)
   * @param  {Array}    previous - pre-update history information list (IN/OUT)
   * @param  {Array}    following - updated history information list (IN/OUT)
   */
  updateVocabularyForBroaderTerm(
      strPrevBrdrTrm,
      strNextBrdrTrm,
      updateCurrent,
      updateTermList,
      deleteIdList,
      previous,
      following,
  ) {
    // Vocabulary extraction for deletion
    if (strPrevBrdrTrm) {
      // Remove terms from the editing vocabulary if the original broader term was added from the reference vocabulary

      // Vocabulary information of the pre-update broader term
      const objPrevBrdrTrm = this.editingVocabulary.find( (data) =>
        data.term === strPrevBrdrTrm);

      if (objPrevBrdrTrm) {
        // Deleted broader term data does not need to be updated
      } else {
        // If the pre-update broader term does not exist in the editing vocabulary
        console.error(
            '[updateVocabulary] ' +
            strPrevBrdrTrm +
            ' is not in the term of editing_vocabulary.',
        );
      }
    }

    // Additional vocabulary extraction by broader term update
    if (strNextBrdrTrm) {
      // Vocabulary information of the pre-update broader term
      const objNextBrdrTrm = this.editingVocabulary.find( (data) =>
        data.term == strNextBrdrTrm);

      if (objNextBrdrTrm != undefined) {
        // No need to add if the updated broader term already exists in the editing vocabulary
        console.log(
            '[updateVocabulary] ' +
            strNextBrdrTrm +
            ' is already existed of editing_vocabulary.',
        );
      } else {
        console.log(
            '[updateVocabulary] Add ' +
            strNextBrdrTrm +
            ' to editing_vocabulary by broaderTerm.',
        );
        const addData = this.createFromReferenceVocabulary(
            strNextBrdrTrm, strNextBrdrTrm,
            updateCurrent.language,
            null,
            null,
            null,
            null,
            updateCurrent.created_time,
            updateCurrent.modified_time
            );
        console.log(addData);
        updateTermList.push(addData);
        following.push(this.makeVocabularyHistoryData(addData));
      }
    }
  }

  /**
   * Term information update by synonym update
   * @param  {Array}    deleteSynonymList - synonyms deleted in update (IN)
   * @param  {Array}    nextSynonymList - synonyms after update (IN)
   * @param  {Object}   updateCurrent - updated vocabulary information (IN)
   * @param  {Array}    updateTermList - updated vocabulary list (IN/OUT)  
   * @param  {Array}    deleteIdList - id list to be deleted (IN/OUT)
   * @param  {Array}    previous - pre-update history information list (IN/OUT)
   * @param  {Array}    following - update history information list (IN/OUT)       
   */
  updateVocabularyForSynonym(
      deleteSynonymList,
      nextSynonymList,
      updateCurrent,
      updateTermList,
      deleteIdList,
      previous,
      following,
  ) {
    // List of preferred label before overwriting
    const prevPreferredLabelList = [];

    // A term formerly synonymous with a synonym that was an added broader term
    // -> The broader term needs to be updated
    const preSynonymList = [];

    // Extract additional synonyms and update or add vocabulary data
    nextSynonymList.forEach((synonym) => {
      // Extracts vocabulary information for synonym and updates preferred label, URI, and broader term
      const objSynonym = this.editingVocabulary.find( (data) =>
        data.term === synonym);

      if (objSynonym) {
        previous.push(this.makeVocabularyHistoryData(objSynonym));
        //Update ID of URI
        if (this.tmpIdofUri.list[0]) {
          objSynonym.idofuri = this.tmpIdofUri.list[0];
        } else {
          objSynonym.idofuri = '';
        }
        // Update URI
        if (this.tmpUri.list[0]) {
          objSynonym.uri = this.tmpUri.list[0].replace(this.tmpUri.list[0].substring(this.tmpUri.list[0].lastIndexOf('/')+1), this.tmpIdofUri.list[0]);
        } else {
          objSynonym.uri = '';
        }

        if (objSynonym.preferred_label == synonym) {
          // Extracts the term data for the preferred label entered in the synonym
          const objPreSynonym = this.editingVocabulary.filter((data) =>
            data.preferred_label === synonym);
          objPreSynonym.forEach((presyn) => {
            // Pick up only terms that are not preferred labels or editing terms
            if (presyn.term != synonym && presyn.term != updateCurrent.term) {
              if (nextSynonymList.indexOf(presyn.term) == -1) {
                if (preSynonymList.indexOf(presyn.term) == -1) {
                  preSynonymList.push(presyn.term);
                }
              }
            }
          });
        }

        // Update preferred label
        if (this.tmpPreferredLabel.list[0]) {
          // Memorize the preferred label before updating and update the broader term of the vocabulary data of the narrower term associated with the preferred label
          // Do not modify the narrower label associated with the preferred label if the term assigned to the synonym is not a preferred label
          if (objSynonym.preferred_label &&
            objSynonym.preferred_label !== this.tmpPreferredLabel.list[0]) {
            prevPreferredLabelList.push(objSynonym.preferred_label);
          }

          objSynonym.preferred_label = this.tmpPreferredLabel.list[0];
        } else {
          console.log('[updateVocabulary] error PreferredLabel is none.');
        }

        // Update broader term
        if (this.tmpBroaderTerm.list[0]) {
          objSynonym.broader_term = this.tmpBroaderTerm.list[0];
        } else {
          objSynonym.broader_term = '';
        }

        // Update term_desription
        if (this.tmpTermDescription.list[0]) {
          objSynonym.term_description = this.tmpTermDescription.list[0];
        } else {
          objSynonym.term_description = '';
        }

        console.log(
            '[updateVocabulary] ' +
            synonym +
            ' update uri(' +
            objSynonym.uri +
            ') and preferred_label(' +
            objSynonym.preferred_label +
            ') and broader_term(' +
            objSynonym.broader_term +
            ') and term_description(' +
            objSynonym.term_description +
            '). ',
        );

        updateTermList.push(objSynonym);
        following.push(this.makeVocabularyHistoryData(objSynonym));
      } else {
        // Synonyms not in the editing vocabulary (Select from reference vocabulary): adding as a new vocabulary to the editing vocabulary data
        console.log(
            '[updateVocabulary] Add ' +
            synonym +
            ' to editing_vocabulary by synonym.',
        );
        
        console.log(`synonym = ${synonym}`);
        console.log(`updateCurrent.preferred_label = ${updateCurrent.preferred_label}`);
        console.log(`updateCurrent.uri = ${updateCurrent.uri}`);
        console.log(`updateCurrent.broader_term = ${updateCurrent.broader_term}`);

        const addData = this.createFromReferenceVocabulary(
            synonym,
            updateCurrent.preferred_label,
            updateCurrent.language,
            updateCurrent.uri,
            updateCurrent.broader_term,
            updateCurrent.other_voc_syn_uri,
            updateCurrent.term_description,
            null,
            updateCurrent.modified_time
        );
        updateTermList.push(addData);
        following.push(this.makeVocabularyHistoryData(addData));
      }
    });

    // Update a broader term of vocabulary data of a narrower term associated with an unupdated preferred label
    // Update the preferred label of synonym data associated with the preferred label before update
    prevPreferredLabelList.forEach((strPrfdLbl) => {
      this.editingVocabulary.forEach( (data) => {
        // Narrower term associated with synonyms are excluded from editing terms
        if (data.broader_term === strPrfdLbl &&
            data.preferred_label !== updateCurrent.preferred_label &&
            data.term !== updateCurrent.term) {
          previous.push(this.makeVocabularyHistoryData(data));

          console.log('[update ' + data.term + '] broader_term: ' +
           strPrfdLbl + ' => ' + updateCurrent.preferred_label);

          data.broader_term = updateCurrent.preferred_label;
          updateTermList.push(data);
          following.push(this.makeVocabularyHistoryData(data));
        }
      });
    });

    preSynonymList.forEach((preSyn) => {
      const target = this.editingVocabulary.find((data) =>
        data.term == preSyn);
      if (target) {
        previous.push(this.makeVocabularyHistoryData(target));
        target.preferred_label = target.term;
        target.uri = '';
        updateTermList.push(target);
        following.push(this.makeVocabularyHistoryData(target));
      }
    });

    // Extract deleted synonyms and update or delete vocabulary data
    deleteSynonymList.sort();
    let setPreferred_label = '';

    const tmpPreLabel = this.editingVocabulary.find( (data) =>
    data.term === deleteSynonymList[0]);

    if ( tmpPreLabel && tmpPreLabel.preferred_label 
          && this.currentNode.term === tmpPreLabel.preferred_label) {
      setPreferred_label = tmpPreLabel.term;
    }else if ( tmpPreLabel && tmpPreLabel.preferred_label 
              && deleteSynonymList.indexOf( tmpPreLabel.preferred_label) !== -1) {
      setPreferred_label = tmpPreLabel.preferred_label;
    }
    deleteSynonymList.forEach((synonym) => {
      const objDelSynonym = this.editingVocabulary.find( (data) =>
        data.term === synonym);
      if (objDelSynonym) {
        if (this.isAddedVocabulary(objDelSynonym)) {
          if (deleteIdList.indexOf(objDelSynonym.id) == -1) {
            deleteIdList.push(objDelSynonym.id);
          }
        }

        if (objDelSynonym.term !== objDelSynonym.preferred_label) {
          previous.push(this.makeVocabularyHistoryData(objDelSynonym));
          // Removed synonyms were words belonging to the editing vocabulary (preferred label), so remove the association with the editing vocabulary
          objDelSynonym.preferred_label = setPreferred_label;
          objDelSynonym.uri = '';
          console.log(
              '[updateVocabulary] ' +
              synonym +
              ' is clear uri and preferred_label.',
          );
          updateTermList.push(objDelSynonym);
          following.push(this.makeVocabularyHistoryData(objDelSynonym));
        } else {
          // Removed synonyms are captions, so vocabulary data need not be updated
        }
      } else {
        console.error(
            '[updateVocabulary] ' +
            synonym +
            ' is not in the term of editing_vocabulary.',
        );
      }
    });
  }

  /**
   * Term information update by synonym update
   * @param  {String}   prevPrfrdLbl - pre-update preferred label (IN)
   * @param  {String}   nextPrfrdLbl - updated preferred label (IN)
   * @param  {Object}   updateCurrent - updated vocabulary information (IN)
   * @param  {Array}    updateTermList - updated vocabulary list (IN/OUT)
   * @param  {Array}    deleteIdList - id list to be deleted (IN/OUT)
   * @param  {Array}    previous - pre-update history information list (IN/OUT)
   * @param  {Array}    following - update history information list (IN/OUT)   
   */
  updateVocabularyForPreferredLabel(
      prevPrfrdLbl,
      nextPrfrdLbl,
      updateCurrent,
      updateTermList,
      deleteIdList,
      previous,
      following,
  ) {
    // Delete the old preferred label if it becomes an unrelated term
    if (nextPrfrdLbl !== prevPrfrdLbl) {
      if (prevPrfrdLbl) {
        const target = this.editingVocabulary.find( (data) =>
          data.term === prevPrfrdLbl);
        if (target) {
          if (this.isAddedVocabulary(target)) {
            if (deleteIdList.indexOf(target.id) == -1) {
              deleteIdList.push(target.id);
            }
          }
        }
      }
    }

    // * undefined  Synonymous preferred label: Modified
    //  => Need to update other terms (Update terms with current as a broader term)
    if (!prevPrfrdLbl) {
      if (nextPrfrdLbl && nextPrfrdLbl !== updateCurrent.term) {
        this.editingVocabulary.forEach( (data) => {
          // Sets the updated preferred term to the broader term for terms with the broader term set to current
          if (data.broader_term === updateCurrent.term) {
            const find = updateTermList.forEach((update) =>
              update.term == data.term);

            if (!find) {
              console.log(data.term + ': broader_term ' +
                data.broader_term + ' -> ' + nextPrfrdLbl,
              );
              previous.push(this.makeVocabularyHistoryData(data));
              data.broader_term = nextPrfrdLbl;
              updateTermList.push(data);
              following.push(this.makeVocabularyHistoryData(data));
            } else {
              console.log(data.term + ' is already updated.');
            }
          }
        });
      }
    }

    if (prevPrfrdLbl && nextPrfrdLbl) {
      if (prevPrfrdLbl === updateCurrent.term &&
          nextPrfrdLbl !== updateCurrent.term) {
        // * current    Separate preferred label in synonyms: with preferred label changes
        //  => Need to update other terms
        // * current    Off-Synonym preferred label: Preferred label Changed
        //  => Need to update other terms
        this.editingVocabulary.forEach( (data) => {
          // Sets the updated preferred label to the broader term for terms with the broader term set to current
          if (data.broader_term === updateCurrent.term) {
            const find = updateTermList.forEach((update) =>
              update.term == data.term);

            if (!find) {
              console.log(data.term + ': broader_term ' +
                data.broader_term + ' -> ' + nextPrfrdLbl,
              );
              previous.push(this.makeVocabularyHistoryData(data));
              data.broader_term = nextPrfrdLbl;
              updateTermList.push(data);
              following.push(this.makeVocabularyHistoryData(data));
            } else {
              console.log(data.term + ' is already updated.');
            }
          }
        });
      }

      // * Synonymous preferred label different preferred label in synonyms: Preferred label Changed
      //  => Need to update other terms
      const nextSynonymList = this.tmpSynonym.list;
      if ((nextSynonymList.includes(prevPrfrdLbl)) &&
          (nextSynonymList.includes(nextPrfrdLbl)) ) {
        this.editingVocabulary.forEach( (data) => {
          // Sets the updated preferred label to the broader term for terms with the broader term set to current
          if (data.broader_term === updateCurrent.term) {
            const find = updateTermList.forEach((update) =>
              update.term == data.term);

            if (!find) {
              console.log(data.term + ': broader_term ' +
                  data.broader_term + ' -> ' + nextPrfrdLbl,
              );
              previous.push(this.makeVocabularyHistoryData(data));
              data.broader_term = nextPrfrdLbl;
              updateTermList.push(data);
              following.push(this.makeVocabularyHistoryData(data));
            } else {
              console.log(data.term + ' is already updated.');
            }
          }
        });
      }
    }
  }

  /**
   * Execute vocabulary data update
   * @param  {array} updateList - updated vocabulary list
   * @param  {array} deleteList - deleted vocabulary list
   * @param  {object} current - vocabulary data to be updated
   * @param  {object} history - history data 
   * @param  {object} oldNode - vocabulary old data to be updated
   * @param  {bool} setCurrent - do setCurrentNodeByTerm() 
   * @param  {object} [history=null] - history information (null: undo/redo requests)
   */
  updateRequest(updateList, deleteList, current, history = null, oldNode = null, setCurrent=true) {
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
      if(editingVocabularyTerm.includes(data.term)) {
        data.modified_time = dateNow;
      }
      else {
        data.created_time = dateNow;
        data.modified_time = dateNow;
      }
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
          // console.log("request url:" + url + " come response.");

          // Run the delete API if there are vocabulary terms to delete
          let idList = [];
          if (deleteList.length > 0) {
            // Manual update requests
            if (history) {
              this.broaderUriToBroaderTerm = false;
              this.setEditingVocabularyData(response.data);

              deleteList.forEach((id) => {
                let isRelated;
                const objDeleteTerm = this.editingVocabulary.find((data) =>
                  data.id == id);
                if (objDeleteTerm) {
                  isRelated = this.editingVocabulary.find((obj) =>
                    this.isRelatedObj(obj, objDeleteTerm.term) );
                }

                if (!isRelated && !objDeleteTerm.preferred_label) {
                    idList.push(id);
                    // If there is a vocabulary to be deleted in the changed list, delete it.
                    history.following = history.following.filter((data) =>
                      data.id != id);
                  }
              });
            } else {
              idList = deleteList;
            }

            const deleteUrl = '/api/v1/vocabulary/editing_vocabulary';
            requestBody = idList;
            // requestBody = deleteList;
            axios
                .post(deleteUrl,
                    requestBody,
                    {
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    },
                )
                .then((response) => {
                  this.broaderUriToBroaderTerm = false;
                  this.setEditingVocabularyData(response.data);
                  // Reselect to reset tmp information
                  this.setCurrentNodeByTerm(
                      current.term, current.id, null, oldNode?false:true);

                  if (history) {
                    if (!history.targetId) {
                      history.targetId = this.currentNode.id;
                      const find = history.following.find((data) =>
                        data.term === current.term);
                      if (find) {
                        find.id = this.currentNode.id;
                      }
                    }
                    editingHistoryStore.addHistory(history);

                  }
                  if( oldNode){
                    this.setCurrentNodeByTerm( oldNode.term, oldNode.id, null, true);
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
                  this.openApiErrorDialog('語彙データ削除エラー', errCode, errMsg);
                });
          } else {
            this.broaderUriToBroaderTerm = false;
            this.setEditingVocabularyData(response.data);

            // Reselect to reset tmp information
            if( setCurrent){
              this.setCurrentNodeByTerm(current.term, current.id, null, oldNode?false:true);
            }

            if (history) {
              if (!history.targetId) {
                history.targetId = this.currentNode.id;
                const find = history.following.find((data) =>
                  data.term === current.term);
                if (find) {
                  find.id = this.currentNode.id;
                }
              }
              editingHistoryStore.addHistory(history);
            }
            if( oldNode){
              this.setCurrentNodeByTerm( oldNode.term, oldNode.id, null, true);
            }
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

  // Editing vocabulary data added in APP (Vocabulary data added from the reference vocabulary)
  // true:add date, false:existing data
  /**
   * Editing vocabulary data added in APP (Vocabulary data added from the reference vocabulary)
   * @param  {object}  target - vocabulary data
   * @return {Boolean} - true: additional data, false: existing data
   */
  isAddedVocabulary(target) {
    if (!target.position_x) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Determining if a vocabulary is related to something other than the vocabulary data being edited
   * @param  {object}  target - vocabulary data
   * @param  {number}  currentId - editing vocabulary ID
   * @return {Boolean} - true: not relevant, false: relevant
   */
  isNotRelatedExceptCurrent(target, currentId) {
    // Extracts the vocabulary whose target is set to the broader term
    let filterList = this.editingVocabulary.filter( (data) =>
      data.broader_term === target.term );
    // Removes the currently editing vocabulary from the extracted vocabulary
    filterList = filterList.filter( (data) => data.id !== currentId );

    // Remove synonyms in the current vocabulary from the extracted vocabulary
    filterList = filterList.filter( (data) =>
      data.preferred_label !== this.currentNode.preferred_label );

    if ( filterList.length == 0 ) {
      // Vocabulary data other than the one being edited is not set as a broader term

      // Extracts the vocabulary whose target is set to the preferred label
      filterList = this.editingVocabulary.filter( (data) =>
        data.preferred_label === target.term );
      // Remove one's vocabulary from the extracted vocabulary
      filterList = filterList.filter( (data) => data.term !== target.term );
      // Removes the vocabulary data being edited from the extracted vocabulary
      filterList = filterList.filter( (data) =>
        data.term !== this.currentNode.term );

      if ( filterList.length == 0 ) {
        if (target.id === currentId) {
          if (this.tmpPreferredLabel.list[0]) {
            return false;
          }
        }
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
    let errorKind = '';

    // Multiple selection check /////////////////////////////////////////

    // When multiple preferred labels are selected
    if (this.tmpPreferredLabel.list.length > 1) {
      console.log('[errorCheck] multiPreferredLabel.');
      errorKind = 'multiPreferredLabel';
      return errorKind;
    }

    // More than one id of uri selected
    if (this.tmpIdofUri.list.length > 1) {
      console.log('[errorCheck] multiIdofUri.');
      errorKind = 'multiIdofUri';
      return errorKind;
    }

    // More than one broader term selected
    if (this.tmpBroaderTerm.list.length > 1) {
      console.log('[errorCheck] multiBroaderTerm.');
      errorKind = 'multiBroaderTerm';
      return errorKind;
    }

    // Effective term check for preferred label /////////////////////////////////////////

    if (this.tmpPreferredLabel.list.length == 1) {
      if (this.isInvalidPreferredLabel(this.tmpPreferredLabel.list[0])) {
        console.log('[errorCheck] invalidPreferredLabel.');
        errorKind = 'invalidPreferredLabel';
        return errorKind;
      }
    }

    // If there is more than one synonym and no preferred label is set, it is an error.
    if (this.tmpPreferredLabel.list.length == 0 &&
        this.tmpSynonym.list.length > 0) {
      console.log('[errorCheck] needToPreferredLabel.');
      errorKind = 'needToPreferredLabel';
      return errorKind;
    }

    // Check for existing cycles of synonyms
    if (this.tmpSynonym.list.length > 0) {
      if (this.isRelationSynonym(this.tmpSynonym.list)) {
        console.log('[errorCheck] relationSynonym.');
        errorKind = 'relationSynonym';
        return errorKind;
      }
    }

    // Check Id of URL setting /////////////////////////////////////////
    // If no id of uri is set, it is an error.
    if (this.tmpIdofUri.list.length == 0) {
      console.log('[errorCheck] needToIdofUri.');
      errorKind = 'needToIdofUri';
      return errorKind;
    }
       
  
      // Check Id of URL setting for other preferred labels /////////////////////////////////////////
      if ((this.tmpIdofUri.list.length > 0) && (this.tmpIdofUri.list[0])) {
        const idofuri = this.tmpIdofUri.list[0];
        const prfrrdLbl = this.tmpPreferredLabel.list[0];
        if (this.isInvalidIdofUri(idofuri, prfrrdLbl)) {
          console.log('[errorCheck] equalIdofUri.');
          errorKind = 'equalIdofUri';
          return errorKind;
        }
      }
  
    // Check URL setting for other preferred labels /////////////////////////////////////////
    if ((this.tmpUri.list.length > 0) && (this.tmpUri.list[0])) {
      const uri = this.tmpUri.list[0];
      const prfrrdLbl = this.tmpPreferredLabel.list[0];
      if (this.isInvalidUri(uri, prfrrdLbl)) {
        console.log('[errorCheck] equalUri.');
        errorKind = 'equalUri';
        return errorKind;
      }
    }

    // Check the validity of a broader term /////////////////////////////////////////
    if ((this.tmpBroaderTerm.list.length > 0) &&
        (this.tmpBroaderTerm.list[0])) {
      const nextBroaderTerm = this.tmpBroaderTerm.list[0];

      if (this.isInvalidBrdrTrm(nextBroaderTerm)) {
        console.log('[errorCheck] invalidBroaderTerm.');
        errorKind = 'invalidBroaderTerm';
        return errorKind;
      }
    }

    // Broader term loop check /////////////////////////////////////////
    if ((this.tmpBroaderTerm.list.length > 0) &&
        (this.tmpBroaderTerm.list[0])) {
      if (this.isCycleBrdrTrm(this.tmpBroaderTerm.list[0])) {
        console.log('[errorCheck] cycleBroaderTerm.');
        errorKind = 'cycleBroaderTerm';
        return errorKind;
      }
    }

    return errorKind;
  }

  @observable equalUriPreferredLabel = '';
  @observable cycleBroaderTerm = [];

  // URI //////////////////////
  @observable tmpUri = {
    id: '',
    list: [],
  };
  tmpUriInit = true;

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
    this.tmpUriInit = false;
    return filterList;
  }

  /**
   * URI update event
   * @param  {string} newValue URI
   */
  @action updataUri(newValue) {
    // console.log("updataBroaderTerm :" + newValue.length);
    const array = [];

    // Add URI received from component to list
    if (newValue !== '') {
      array.push(newValue);
    }

    this.tmpUri.id = this.currentNode.id;
    this.tmpUri.list = array;
  }

  /**
   * Determine if the URI is set to the appropriate URI
   * @param  {String}  uri - URI string
   * @param  {String}  prfrrdLbl - preferred label of URI
   * @return {Boolean} - true: inappropriate, false: appropriate
   */
  isInvalidUri(uri, prfrrdLbl) {
    let isSameUri = false;

    if (!uri) {
      return isSameUri;
    }

    const tmpPreferredLabel = prfrrdLbl;
    const tmpUri = uri;

    // Extract vocabulary with same URI
    let uriVocList = this.editingVocabulary.filter((data) =>
      data.uri === tmpUri);
    if (uriVocList) {
      // Exclude terms and terms in preferred label being edited
      if (tmpPreferredLabel) {
        uriVocList = uriVocList.filter((data) =>
          data.preferred_label !== tmpPreferredLabel);
      }

      uriVocList = uriVocList.filter((data) =>
        data.term !== this.currentNode.term);
    }

    uriVocList.forEach((data) => {
      // If no synonyms are present, an error occurs if another URI is set
      if (this.tmpSynonym.list.length == 0) {
        this.equalUriPreferredLabel = data.preferred_label;
        console.log(
            '[errorCheck] uri is not unmatch(' +
            tmpPreferredLabel +
            ' : ' +
            tmpUri +
            ', ' +
            data.preferred_label +
            ' : ' +
            data.uri +
            ').',
        );
        isSameUri = true;
      } else if (!this.tmpSynonym.list.find((synonym) =>
        data.term === synonym)) {
        // It is an error if the URI of a term other than the one set in the synonym is set
        this.equalUriPreferredLabel = data.preferred_label;
        console.log(
            '[errorCheck] uri is not unmatch(' +
            tmpPreferredLabel +
            ' : ' +
            tmpUri +
            ', ' +
            data.preferred_label +
            ' : ' +
            data.uri +
            ').',
        );
        isSameUri = true;
      }
    });
    return isSameUri;
  }

  /**
   * Determine if the Id of URI is set to the appropriate  Id of URI
   * @param  {String}  idofuri - Id of URI string
   * @param  {String}  prfrrdLbl - preferred label of Id of URI
   * @return {Boolean} - true: inappropriate, false: appropriate
   */
   isInvalidIdofUri(idofuri, prfrrdLbl) {
    let isSameIdofUri = false;

    if (!idofuri) {
      return isSameIdofUri;
    }

    const tmpPreferredLabel = prfrrdLbl;
    const tmpIdofUri = idofuri;

    // Extract vocabulary with same Id of URI
    let idofuriVocList = this.editingVocabulary.filter((data) =>
      data.idofuri === tmpIdofUri);
    if (idofuriVocList) {
      // Exclude terms and terms in preferred label being edited
      if (tmpPreferredLabel) {
        idofuriVocList = idofuriVocList.filter((data) =>
          data.preferred_label !== tmpPreferredLabel);
      }

      idofuriVocList = idofuriVocList.filter((data) =>
        data.term !== this.currentNode.term);
    }

    idofuriVocList.forEach((data) => {
      // If no synonyms are present, an error occurs if another Id of URI is set
      if (this.tmpSynonym.list.length == 0) {
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
      } else if (!this.tmpSynonym.list.find((synonym) =>
        data.term === synonym)) {
        // It is an error if the Id of URI of a term other than the one set in the synonym is set
        this.equalUriPreferredLabel = data.preferred_label;
        console.log(
            '[errorCheck] id of uri is not unmatch(' +
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
  tmpIdofUriInit = true;

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
    this.tmpIdofUriInit = false;
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
      newValue.forEach((term) => {
        array.push(term);
      });
    } else {
      if (this.tmpPreferredLabel.list.length > 0) {
        // Do not add terms that are not selected and have no title to the broader term
        newValue.forEach((term) => {
          array.push(term);
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
    list: [],
  };
  tmpBroaderTermInit = true;
  broaderUriToBroaderTerm = true;

  /**
   * Create a screen display broader term list
   * @return {Array} - list of broader term
   */
  @computed get currentBroaderTerm() {
    if (!(this.currentNode.id)) {
      return [];
    }
    let filterList = [];

    if (this.tmpBroaderTerm.id == this.currentNode.id) {
      if ( this.tmpBroaderTerm.list.length > 0 ) {
        filterList = this.tmpBroaderTerm.list;
      } else {
        if (this.tmpBroaderTermInit) {
          if ( this.currentNode.broader_term != '' ) {
            filterList = [this.currentNode.broader_term];
          }
        }
      }
    } else {
      if ( this.currentNode.broader_term != '' ) {
        filterList = [this.currentNode.broader_term];
      }
    }
    this.tmpBroaderTermInit = false;
    return filterList;
  }

  /**
   * Broader term update event
   * @param  {string} newValue - broader term
   */
  @action updataBroaderTerm(newValue) {
    const array = [];
    if (this.currentNode.term) {
      newValue.forEach((term) => {
        array.push(term);
      });
    } else {
      if (this.tmpPreferredLabel.list.length > 0) {
        // Do not add terms that are not selected and have no title to the broader term
        newValue.forEach((term) => {
          array.push(term);
        });
      }
    }
    this.tmpBroaderTerm.id = this.currentNode.id;
    this.tmpBroaderTerm.list = array;
  }

  /**
   * Delete and update the end of the list of top words being edited
   */
  @action popBroaderTerm() {
    const newArray = [];
    this.tmpBroaderTerm.list.forEach((data) => {
      newArray.push(data);
    });
    newArray.pop();
    this.updataBroaderTerm(newArray);
  }

  /**
   * Determine if it is a valid broader term
   * @param  {String}  broaderTerm - broader term
   * @return {Boolean} - true: invalid, false: valid
   */
  @action isInvalidBrdrTrm(broaderTerm) {
    // Whether a preferred label is set for a broader term
    if (this.tmpPreferredLabel.list.length == 1) {
      if (broaderTerm === this.tmpPreferredLabel.list[0]) {
        console.log('[errorCheck] preferredLabel is set for broaderTerm.');
        return true;
      }
    }

    // Whether there are synonyms for the broader term
    if (this.tmpSynonym.list.length > 0) {
      const find = this.tmpSynonym.list.find( (data) =>
        data == broaderTerm);
      if (find) {
        console.log('[errorCheck] synonym is set for broaderTerm.');
        return true;
      }
    }

    // Whether or not the selected term is set in the broader term
    if (broaderTerm == this.currentNode.term) {
      console.log('[errorCheck] current term is set for broaderTerm.');
      return true;
    }

    return false;
  }

  /**
   * Determine if a broader term is not looping
   * @param  {String}  broaderTerm - broader term
   * @return {Boolean} - true: invalid(loop), false: valid
   */
  @action isCycleBrdrTrm(broaderTerm) {
    // For epistatic cyclic vocabulary storage
    const cycleCheckList = [];
    if (this.tmpPreferredLabel.list[0]) {
      // Since a preferred label is specified for a broader term, if a preferred label exists, it is checked by the preferred label
      cycleCheckList.push(this.tmpPreferredLabel.list[0]);
    } else {
      cycleCheckList.push(this.currentNode.term);
    }

    // A list of terms or preferred label against which circulation is determined
    // Covers the vocabulary or preferred label you select and the synonymous preferred label
    const cycleTargetList = [];
    cycleTargetList.push(cycleCheckList[0]);
    if (this.tmpSynonym.list.length > 0) {
      this.tmpSynonym.list.forEach((synonym) => {
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

  // Synonym //////////////////////
  @observable tmpSynonym = {
    id: '',
    list: [],
  };
  @observable currentSynonym = {
    id: '',
    list: [],
  };
  tmpSynonymInit = true;

  /**
   * Synonym update event
   * @param  {string} newValue - synonym
   */
  @action updataSynonym(newValue) {
    const array = [];
    // Add synonyms received from component to the list
    newValue.forEach((synonym) => {
      if (this.currentNode.term) {
        // If the vocabulary being edited is added to a synonym by direct input, etc., omit it
        if (synonym !== this.currentNode.term) {
          array.push(synonym);
        }
      } else {
        if (this.tmpPreferredLabel.list.length == 0) {
          // Do not allow addition to a synonym if preferred label does not exist
        } else if (this.tmpPreferredLabel.list.length == 1) {
          // Do not add to synonyms when they are added with no vocabulary selected
          const find = this.tmpPreferredLabel.list.find(
              (prfrrdlbl) => prfrrdlbl == synonym);
          if (!find) {
            array.push(synonym);
          }
        } else {
          // If there are two or more preferred labels, they cannot be registered and it is difficult to complete them properly, so they are displayed as they are
          array.push(synonym);
        }
      }
    });
    // Complete only for additional updates
    if (array.length > this.tmpSynonym.list.length) {
      // Extract added synonyms
      const addSynonymList = array.filter((i) =>
        this.tmpSynonym.list.indexOf(i) == -1);

      // Add synonyms associated with synonyms received from component to the list
      addSynonymList.forEach((synonym) => {
        const allList = [
          ...this.editingVocabulary,
          // ...this.referenceVocabulary1,
          // ...this.referenceVocabulary2,
          // ...this.referenceVocabulary3,
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
                data.term != this.currentNode.term);
          } else {
            // If no preferred label is set, only that term is extracted
            targetList.push(synonymData);
          }
        }

        targetList.forEach((target) => {
          // Preferred label
          if ((target.preferred_label != '') &&
            (target.preferred_label != null) &&
            (this.tmpPreferredLabel.list.indexOf(target.preferred_label)==-1)) {
            this.tmpPreferredLabel.list.push(target.preferred_label);
          }
          // Broader term
          if ((target.broader_term != '') &&
          (target.broader_term != null) &&
          (this.tmpBroaderTerm.list.indexOf(target.broader_term) == -1)) {
            this.tmpBroaderTerm.list.push(target.broader_term);
          }
          // URI
          if ((this.tmpUri.list.length == 0) && (target.uri)) {
            this.tmpUri.list.push(target.uri);
          }

          // Add additional synonyms if any
          if (target.term !== synonym) {
            array.push(target.term);
          }
        });
      });
    }

    this.tmpSynonym.id = this.currentNode.id;
    this.tmpSynonym.list = array;
  }

  /**
   * Delete and update the end of the synonym list you are editing
   */
  @action popSynonym() {
    const newArray = [];
    this.tmpSynonym.list.forEach((data) => {
      newArray.push(data);
    });
    newArray.pop();
    this.updataSynonym(newArray);
  }

  /**
   * [isRelationSynonym description]
   * @param  {Array}  list synonymList
   * @return {Boolean}     true:relation, false:not relation
   */
  @action isRelationSynonym(list) {
    const lblList = [];

    list.forEach((synonym) => {
      if (lblList.indexOf(synonym) == -1) {
        lblList.push(synonym);
      }
    });

    this.tmpPreferredLabel.list.forEach((label) => {
      if (lblList.indexOf(label) == -1) {
        lblList.push(label);
      }
    });

    if (lblList.indexOf(this.currentNode.term) == -1) {
      lblList.push(this.currentNode.term);
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
    list: [],
  };
  tmpPreferredLabelInit = true;

  /**
   * Create list for screen display
   * @return {Array} - list of preferred label
   */
  @computed get currentPreferredLabel() {
    if (!(this.currentNode.id)) {
      return [];
    }
    let filterList = [];
    if (this.tmpPreferredLabel.id == this.currentNode.id) {
      if ( this.tmpPreferredLabel.list.length > 0 ) {
        filterList = this.tmpPreferredLabel.list;
      } else {
        if (this.tmpPreferredLabelInit) {
          if ( this.currentNode.preferred_label != '' ) {
            filterList = [this.currentNode.preferred_label];
          }
        }
      }
    } else {
      if ( this.currentNode.preferred_label != '' ) {
        filterList = [this.currentNode.preferred_label];
      }
    }
    this.tmpPreferredLabelInit = false;
    return filterList;
  }

  /**
   * Preferred label update event
   * @param  {array} newValue - preferred label (string)
   */
  @action updataPreferredLabel(newValue) {
    if (this.currentNode.id) {
      const array = [];

      // Add preferred label received from component to the list
      newValue.forEach((term) => {
        array.push(term);
      });

      this.tmpPreferredLabel.id = this.currentNode.id;
      this.tmpPreferredLabel.list = array;
    } else {
      if (newValue.length == 0) {
        // To prevent entry of terms without preferred label when no vocabulary is selected, if preferred labels are deleted when no vocabulary is selected, synonyms and broader terms are also deleted
        const array = [];
        this.tmpPreferredLabel.id = this.currentNode.id;
        this.tmpPreferredLabel.list = array;
        this.tmpSynonym.list = array;
        this.tmpIdofUri.list = array;
        this.tmpUri.list = array;
        this.tmpBroaderTerm.list = array;
        this.tmpTermDescription.list = array;
      } else if (newValue.length == 1) {
        const value = newValue[0];
        const target = this.editingVocabulary.find((data) =>
          data.term === value);
        if (target) {
          // Select if the preferred label is an existing vocabulary
          this.setCurrentNodeByTerm(target.term, target.id, null, true);
        } else {
          const array = [];

          // Add preferred labels received from component to the list
          newValue.forEach((term) => {
            array.push(term);
          });

          this.tmpPreferredLabel.id = this.currentNode.id;
          this.tmpPreferredLabel.list = array;
          // When more than one preferred label exists, an invalid synonym may be added, so an update process is called to optimize it
          this.updataSynonym(this.tmpSynonym.list);
        }
      } else {
        const array = [];

        // Add preferred labels received from component to the list
        newValue.forEach((term) => {
          array.push(term);
        });

        this.tmpPreferredLabel.id = this.currentNode.id;
        this.tmpPreferredLabel.list = array;
      }
    }
  }

  /**
   * Delete and update the end of the preferred label list being edited
   */
  @action popPreferredLabel() {
    const newArray = [];
    this.tmpPreferredLabel.list.forEach((data) => {
      newArray.push(data);
    });
    newArray.pop();
    this.updataPreferredLabel(newArray);
  }

  /**
   * Determine if a broader term is a term name or synonym
   * @param  {string}  newValue - term set for the preferred label
   * @return {Boolean} - true: inappropriate, false: appropriate
   */
  isInvalidPreferredLabel(newValue) {
    if (this.currentNode.id) {
      if (newValue === this.currentNode.term) {
        return false;
      }
      const find = this.tmpSynonym.list.some((synonym) => synonym === newValue);
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
    if (this.tmpPreferredLabel.list.length > 0) {
      keyList = this.tmpPreferredLabel.list.concat();

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
    if (this.tmpSynonym.list.length > 0) {
      this.tmpSynonym.list.forEach((synonym) => {
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
          if (data.preferred_label === data.term) {
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
    list: [],
  };
  tmpTermDescriptionInit = true;

  /**
   * Create Term Description list for screen display
   * @return {Array} - Term Description list
   */
  @computed get currentTermDescription() {
    if (!(this.currentNode.id)) {
      return [];
    }
    let filterList = [];
    if (this.tmpTermDescription.id == this.currentNode.id) {
      if ( this.tmpTermDescription.list.length > 0 ) {
        filterList = this.tmpTermDescription.list;
      }
    } else {
      if ( this.currentNode.term_description != '' ) {
        filterList = [this.currentNode.term_description];
      }
    }
    this.tmpTermDescription = false;
    return filterList;
  }

  /**
   * Term Description update event
   * @param  {string} newValue Term Description
   */
  @action updataTermDescription(newValue) {
    const array = [];

    // Add term description received from component to list
//    if (newValue !== '') {
//      array.push(newValue);
//    }

  if (this.currentNode.term) {
    newValue.forEach((term) => {
      array.push(term);
    });
  } else {
    if (this.tmpPreferredLabel.list.length > 0) {
      // Do not add terms that are not selected and have no title to the term description
      newValue.forEach((term) => {
        array.push(term);
      });
    }
  }
    this.tmpTermDescription.id = this.currentNode.id;
    this.tmpTermDescription.list = array;
  }

  /**
   * Delete and update the end of the term description list you are editing
   */
   @action popTermDescription() {
    const newArray = [];
    this.tmpTermDescription.list.forEach((data) => {
      newArray.push(data);
    });
    newArray.pop();
    this.updataTermDescription(newArray);
  }

  // Language //////////////////////
  @observable tmpLanguage = {
    id: '',
    list: [],
  };
  tmpLanguageInit = true;

  /**
   * Create Language list for screen display
   * @return {Array} - Language list
   */
  @computed get currentLanguage() {
    if (!(this.currentNode.id)) {
      return [];
    }
    let filterList = [];
    if (this.tmpLanguage.id == this.currentNode.id) {
      if ( this.tmpLanguage.list.length > 0 ) {
        filterList = this.tmpLanguage.list;
      }
    } else {
      if ( this.currentNode.language != '' ) {
        filterList = [this.currentNode.language];
      }
    }
    this.tmpLanguage = false;
    return filterList;
  }

  /**
   * Language update event
   * @param  {string} newValue Language
   */
  @action updataLanguage(newValue) {
    const array = [];

    // Add URI received from component to list
    if (newValue !== '') {
      array.push(newValue);
    }

    this.tmpLanguage.id = this.currentNode.id;
    this.tmpLanguage.list = array;
  }

  /**
   * Delete and update the end of the language list you are editing
   */
   @action popTermDescription() { //language？
    const newArray = [];
    this.tmpLanguage.list.forEach((data) => {
      newArray.push(data);
    });
    newArray.pop();
    this.updataLanguage(newArray);
  }

  // Created Time //////////////////////
  @observable tmpCreatedTime = {
    id: '',
    list: [],
  };
  tmpCreatedTimeInit = true;

  /**
   * Create Created Time list for screen display
   * @return {Array} - Created Time list
   */
  @computed get currentCreatedTime() {
    if (!(this.currentNode.id)) {
      return [];
    }
    let filterList = [];
    if (this.tmpCreatedTime.id == this.currentNode.id) {
      if ( this.tmpCreatedTime.list.length > 0 ) {
        filterList = this.tmpCreatedTime.list;
      }
    } else {
      if ( this.currentNode.created_time != '' ) {
        filterList = [this.currentNode.created_time];
      }
    }
    this.tmpCreatedTime = false;
    return filterList;
  }

  /**
   * Created Time update event
   * @param  {string} newValue Created Time
   */
  @action updataCreatedTime(newValue) {
    const array = [];

    // Add URI received from component to list
    if (newValue !== '') {
      array.push(newValue);
    }

    this.tmpCreatedTime.id = this.currentNode.id;
    this.tmpCreatedTime.list = array;
  }

  /**
   * Delete and update the end of the created time list you are editing
   */
   @action popCreatedTime() {
    const newArray = [];
    this.tmpCreatedTime.list.forEach((data) => {
      newArray.push(data);
    });
    newArray.pop();
    this.updataCreatedTime(newArray);
  }

  // Modified Time //////////////////////
  @observable tmpModifiedTime = {
    id: '',
    list: [],
  };
  tmpModifiedTimeInit = true;

  /**
   * Create Modified Time list for screen display
   * @return {Array} - Modified Time list
   */
  @computed get currentModifiedTime() {
    if (!(this.currentNode.id)) {
      return [];
    }
    let filterList = [];
    if (this.tmpModifiedTime.id == this.currentNode.id) {
      if ( this.tmpModifiedTime.list.length > 0 ) {
        filterList = this.tmpModifiedTime.list;
      }
    } else {
      if ( this.currentNode.modified_time != '' ) {
        filterList = [this.currentNode.modified_time];
      }
    }
    this.tmpModifiedTime = false;
    return filterList;
  }

  /**
   * Modified Time update event
   * @param  {string} newValue Modified Time
   */
  @action updataModifiedTime(newValue) {
    const array = [];

    // Add URI received from component to list
    if (newValue !== '') {
      array.push(newValue);
    }

    this.tmpModifiedTime.id = this.currentNode.id;
    this.tmpModifiedTime.list = array;
  }

  /**
   * Delete and update the end of the modified time list you are editing
   */
   @action popModifiedTime() {
    const newArray = [];
    this.tmpModifiedTime.list.forEach((data) => {
      newArray.push(data);
    });
    newArray.pop();
    this.updataModifiedTime(newArray);
  }

  // Other Voc Syn Uri //////////////////////
  @observable tmpOtherVocSynUri = {
    id: '',
    list: [],
  };
  tmpOtherVocSynUriInit = true;

  // confirm //////////////////////
  // Confirmed color information
  // The confirmed color information is stored in color2 in each term data of the editing vocabulary data, but since it becomes the same information, it is managed by confirmColor in app
  @observable confirmColor = 'black';

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
   * @param  {Boolean} [isHistory=false] - modified by undo/redo ?
   */
  seletConfirmColor(color = this.confirmColor, isHistory = false) {
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
          this.broaderUriToBroaderTerm = false;
          this.setEditingVocabularyData(response.data);

          // Reselect to reset tmp information
          // this.setCurrentNodeByTerm(updateCurrent.term,
          //     updateCurrent.id, null, true);

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

  /**
   * Confirm change request
   * Switching term setting ON/OFF
   * @param  {String} term - confirmed term
   * @param  {Boolean} isConfirm - confirm ON/OFF
   * @param  {Boolean} [isHistory=false] - modified by undo/redo ?
   */
  toggleConfirm(term, isConfirm, isHistory = false) {
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
          data.color2 = 'black';
        }
      });
    } else {
      // When changing confirmed information for a term without a preferred label, update only that term
      if (isConfirm) {
        currentNode.confirm = 1;
        currentNode.color2 = this.confirmColor;
      } else {
        currentNode.confirm = 0;
        currentNode.color2 = 'black';
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
          // this.setEditingVocabularyData(response.data);
          // Reselect to reset tmp information
          this.setCurrentNodeByTerm(currentNode.term,
              currentNode.id, null, true);

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
}

const editingVocabularyStore = new EditingVocabulary();
export default editingVocabularyStore;
