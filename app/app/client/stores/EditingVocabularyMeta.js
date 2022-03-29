/**
 * EditingVocabularyMeta.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import {action, computed, observable} from 'mobx';
import axios from 'axios';

import editingHistoryStore from './EditingHistory';
import History from './History';
import config from '../config/Config';
import { data } from 'jquery';

/**
 * Vocabulary data management class
 */
class EditingVocabularyMeta {
  // Editing vocabulary meta
  @observable editingVocabularyMeta = [];


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
   * Get editing vocabulary meta data
   */
  @action async getEditingVocabularyMetaDataFromDB() {
    // console.log("getEditingVocabularyMetaDataFromDB start.");
    await axios
        .get('/api/v1/vocabulary/editing_vocabulary_meta',
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
        )
        .then((response) => {
          // console.log("getEditingVocabularyMetaDataFromDB response.");
          this.setUpdate();
          this.setEditingVocabularyMetaData(response.data.EditingVocabularyMeta);
          this.tmpMetaDataClear();
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
          this.openApiErrorDialog('編集用語彙メタデータ取得エラー', errCode, errMsg);
        });
  }

  /**
   * Generate data for DBupdata from currentNode and the data being edited
   * @return {object} - editing vocabulary  meta data
   */
  createDBFormatDataByCurrentNode() {
    const dbData = {
      meta_name: this.currentNode.meta_name,
      meta_enname: this.currentNode.meta_enname,
      meta_version: this.currentNode.meta_version,
      meta_prefix: this.currentNode.meta_prefix,
      meta_uri: this.currentNode.meta_uri,
      meta_description: this.currentNode.meta_description,
      meta_endescription: this.currentNode.meta_endescription,
      meta_author: this.currentNode.meta_author, 
    };
    if (this.currentNode.id) {
      dbData.id = Number(this.currentNode.id);
      console.log(dbData.id);
    }
    if (this.tmpMetaName.list && this.tmpMetaName.list.length > 0) {
      dbData.meta_name = this.tmpMetaName.list[0];
      console.log(dbData.meta_name);
    }
    if (this.tmpMetaEnName.list && this.tmpMetaEnName.list.length > 0) {
      dbData.meta_enname = this.tmpMetaEnName.list[0];
    }
    if (this.tmpMetaVersion.list && this.tmpMetaVersion.list.length > 0) {
      dbData.meta_version = this.tmpMetaVersion.list[0];
    }
    if (this.tmpMetaPrefix.list && this.tmpMetaPrefix.list.length > 0) {
      dbData.meta_prefix = this.tmpMetaPrefix.list[0];
    }
    if (this.tmpMetaUri.list && this.tmpMetaUri.list.length > 0) {
      dbData.meta_uri = this.tmpMetaUri.list[0];
    }
    if (this.tmpMetaDescription.list && this.tmpMetaDescription.list.length > 0) {
      dbData.meta_description = this.tmpMetaDescription.list[0];
    }
    if (this.tmpMetaAuthor.list && this.tmpMetaAuthor.list.length > 0) {
      dbData.meta_author = this.tmpMetaAuthor.list[0];
    }
    return dbData;
  }

  
  /**
   * Editing vocabulary meta data initialization
   * @param {array} dbData - list of editing vocabulary meta
   */
  setEditingVocabularyMetaData(dbData) {
    // console.log('setEditingVocabularyMetaData');
    const editingVocabularyMeta = [];

    dbData.forEach( (data) => {
      console.log(data);
      
      // If the parameter is string (Set the empty string character)
      if (!data.meta_name) data.meta_name = '';
      if (!data.meta_enname) data.meta_enname = '';
      if (!data.meta_version) data.meta_version = '';
      if (!data.meta_prefix) data.meta_prefix = '';
      if (!data.meta_uri) data.meta_uri = '';
      if (!data.meta_description) data.meta_description = '';
      if (!data.meta_endescription) data.meta_endescription = '';
      if (!data.meta_author) data.meta_author = '';

      editingVocabularyMeta.push(data);
    });

    this.editingVocabularyMeta = editingVocabularyMeta;
  }


  @observable currentNode = {
    id: null,
    meta_name: '',
    meta_enname: '',
    meta_version: '',
    meta_prefix: '',
    meta_uri: '',
    meta_description: '',
    meta_endescription: '',
    meta_author: '',
  };

  /**
   * Editing vocabulary meta data currentNode set
   */
  setCurrentNode(){ 
    // If reading the data
    if (this.editingVocabularyMeta.length > 0){
      const current = this.editingVocabularyMeta[0];
      this.currentNode = current;
    }
    // If not reading the data
    else if (this.editingVocabularyMeta.length == 0){
      this.currentNode = {
        id: null,
        meta_name: '',
        meta_enname: '',
        meta_version: '',
        meta_prefix: '',
        meta_uri: '',
        meta_description: '',
        meta_endescription: '',
        meta_author: '',
      };
    }
  }


  /**
   * Initialization of data being edited
   */
  tmpMetaDataClear() {
    this.tmpMetaName = {id: '', list: []};
    this.tmpMetaNameInit = true;
    this.tmpMetaEnName = {id: '', list: []};
    this.tmpUMetaEnNameInit = true;
    this.tmpMetaVersion = {id: '', list: []};
    this.tmpMetaVersionInit = true;
    this.tmpMetaPrefix = {id: '', list: []};
    this.tmpMetaPrefixInit = true;
    this.tmpMetaUri = {id: '', list: []};
    this.tmpMetaUriInit = true;
    this.tmpMetaDescription = {id: '', list: []};
    this.tmpMetaDescriptionInit = true;
    this.tmpMetaEnDescription = {id: '', list: []};
    this.tmpMetaEnDescriptionInit = true;
    this.tmpMetaAuthor = {id: '', list: []};
    this.tmpMetaAuthorInit = true;
  }

  /**
   * Whether data has been edited and is pending
   * @return {boolean} - true: contain changes, false: not contain changes
   */
  @computed get isCurrentNodeChanged() {
    // MetaName
    if (this.isMetaNameChanged()) {
      return true;
    }

    // MetaEnName
    if (this.isMetaEnNameChanged()) {
      return true;
    }

    // MetaVersion
    if (this.isMetaVersionChanged()) {
      return true;
    }

    // MetaPrefix
    if (this.isMetaPrefixChanged()) {
      return true;
    }

    // MetaUri
    if (this.isMetaUriChanged()) {
      return true;
    }

    // MetaDescription
    if (this.isMetaDescriptionChanged()) {
      return true;
    }

    // MetaEnDescription
    if (this.isMetaEnDescriptionChanged()) {
      return true;
    }

    // MetaAuthor
    if (this.isMetaAuthorChanged()) {
      return true;
    }

    return false;
  }

  /**
   * Determine if MetaName is changed
   * @return {boolean} - true: contain changes, false: not contain changes
   */
   isMetaNameChanged() {
  }

  /**
   * Determine if MetaEnName is changed
   * @return {boolean} - true: contain changes, false: not contain changes
   */
  isMetaEnNameChanged() {
  }

  /**
   * Determine if MetaVersion is changed
   * @return {boolean} - true: contain changes, false; not contain changes
   */
  isMetaVersionChanged() {
  }

  /**
   * Determine if MetaPrefix is changed
   * @return {boolean} - true: contain changes, false: not contain changes
   */
  isMetaPrefixChanged() {
  }

  /**
   * Determine if MetaUri is changed
   * @return {boolean} - true: contain changes, false; not contain changes
   */

  isMetaUriChanged() {
  }

/**
 * Determine if MetaDescription is changed
 * @return {boolean} - true: contain changes, false; not contain changes
 */
 isMetaDescriptionChanged() {
}

/**
 * Determine if MetaEnDescription is changed
 * @return {boolean} - true: contain changes, false; not contain changes
 */
 isMetaEnDescriptionChanged() {
}

/**
 * Determine if MetaAuthor is changed
 * @return {boolean} - true: contain changes, false; not contain changes
 */
 isMetaAuthorChanged() {
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

  // Vocabulary  meta data update //////////////////////////////////////////////////

  /**
   * Updating 
   * @return {string} - error message
   */
  @action updateVocabulary() {
    const error = this.errorCheck();
    if (error != '') {
      return error;
    }

    this.setCurrentNode();

    const updateTermList = [];
   
    // Add selected vocabulary
    const updateCurrent = this.createDBFormatDataByCurrentNode();
    
    updateTermList.push(updateCurrent);
    this.updateRequest(updateTermList, updateCurrent);

    return '';
  }

  /**
   * Execute vocabulary  meta data update
   * @param  {array} updateList - updated vocabulary list
   * @param  {object} current - vocabulary data to be updated
   */
  updateRequest(updateList, current) {
    const updeteUrl = '/api/v1/vocabulary/editing_vocabulary_meta/'+ current.meta_name ;
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
          console.log('success response.');
          this.setEditingVocabularyMetaData(response.data);
        });
  }


  /**
   * Error determination processing of editing content
   * @return {string} - error type
   */
  errorCheck() {
    let errorKind = '';

    return errorKind;
  }

  // MetaName //////////////////////
  @observable tmpMetaName = {
    id: '',
    list: [],
  };
  tmpMetaNameInit = true;

  /**
   *  MetaName update event
   * @param  {string} newValue MetaName 
   */
  @action updataMetaName(newValue) {
    const array = [];
    if (newValue !== '') {
      array.push(newValue);
    }
    this.tmpMetaName.id = this.currentNode.id;
    this.tmpMetaName.list = array;
  }

  // MetaEnName //////////////////////
  @observable tmpMetaEnName = {
    id: '',
    list: [],
  };
  tmpMetaEnNameInit = true;


  /**
   * MetaEnName update event
   * @param  {string} newValue MetaEnName
   */
  @action updataMetaEnName(newValue) {
    const array = [];

    if (newValue !== '') {
      array.push(newValue);
      console.log(array);
    }

    this.tmpMetaEnName.id = this.currentNode.id;
    this.tmpMetaEnName.list = array;
  }

  // MetaVersion //////////////////////
  @observable tmpMetaVersion = {
    id: '',
    list: [],
  };
  tmpMetaVersionInit = true;

  /**
   * MetaVersion update event
   * @param  {string} newValue MetaVersion
   */
  @action updataMetaVersion(newValue) {
    const array = [];

    if (newValue !== '') {
      array.push(newValue);
      console.log(array);
    }

    this.tmpMetaVersion.id = this.currentNode.id;
    this.tmpMetaVersion.list = array;
  }

  // MetaPrefix //////////////////////
  @observable tmpMetaPrefix = {
    id: '',
    list: [],
  };
  tmpMetaPrefixInit = true;

  /**
   * MetaPrefix update event
   * @param  {string} newValue MetaPrefix
   */
  @action updataMetaPrefix(newValue) {
    const array = [];

    if (newValue !== '') {
      array.push(newValue);
      console.log(array);
    }

    this.tmpMetaPrefix.id = this.currentNode.id;
    this.tmpMetaPrefix.list = array;
  }

  // MetaUri //////////////////////
  @observable tmpMetaUri = {
    id: '',
    list: [],
  };
  tmpMetaUriInit = true;

  /**
   * MetaUri update event
   * @param  {string} newValue MetaUri
   */
  @action updataMetaUri(newValue) {
    const array = [];

    if (newValue !== '') {
      array.push(newValue);
      console.log(array);
    }

    this.tmpMetaUri.id = this.currentNode.id;
    this.tmpMetaUri.list = array;
  }

  // MetaDescription //////////////////////
  @observable tmpMetaDescription = {
    id: '',
    list: [],
  };
  tmpMetaDescriptionInit = true;

  /**
   * MetaDescription update event
   * @param  {string} newValue MetaDescription
   */
  @action updataMetaDescription(newValue) {
    const array = [];

    if (newValue !== '') {
      array.push(newValue);
      console.log(array);
    }

    this.tmpMetaDescription.id = this.currentNode.id;
    this.tmpMetaDescription.list = array;
  }

  // MetaEnDescription //////////////////////
  @observable tmpMetaEnDescription = {
    id: '',
    list: [],
  };
  tmpMetaEnDescriptionInit = true;


  /**
   * MetaEnDescription update event
   * @param  {string} newValue MetaEnDescription
   */
  @action updataMetaEnDescription(newValue) {
    const array = [];

    if (newValue !== '') {
      array.push(newValue);
      console.log(array);
    }

    this.tmpMetaEnDescription.id = this.currentNode.id;
    this.tmpMetaEnDescription.list = array;
  }

  // MetaAuthor //////////////////////
  @observable tmpMetaAuthor = {
    id: '',
    list: [],
  };
  tmpMetaAuthorInit = true;

  /**
   * MetaAuthor update event
   * @param  {string} newValue MetaAuthor
   */
  @action updataMetaAuthor(newValue) {
    const array = [];

    if (newValue !== '') {
      array.push(newValue);
      console.log(array);
    }

    this.tmpMetaAuthor.id = this.currentNode.id;
    this.tmpMetaAuthor.list = array;
  }
  
}

const editingVocabularyMetaStore = new EditingVocabularyMeta();
export default editingVocabularyMetaStore;