/**
 * EditingVocabularyMeta.js COPYRIGHT FUJITSU LIMITED 2021
 */
import {action, computed, observable} from 'mobx';
import axios from 'axios';

import editingVocabularyStore from './EditingVocabulary';

/**
 * Vocabulary data management class
 */
class EditingVocabularyMeta {
  // Editing vocabulary meta
  @observable editingVocabularyMeta = null;

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
          this.setEditingVocabularyMetaData(response.data.EditingVocabularyMeta);
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
    }
    return dbData;
  }

  
  /**
   * Editing vocabulary meta data initialization
   * @param {array} dbData - list of editing vocabulary meta
   */
  setEditingVocabularyMetaData(dbData) {
    
    const editingVocabularyMeta = [];

    dbData.forEach( (data) => {
      
      // If the parameter is string (Set the empty string character)
      // if (!data.meta_name) data.meta_name = '';
      // if (!data.meta_enname) data.meta_enname = '';
      // if (!data.meta_version) data.meta_version = '';
      // if (!data.meta_prefix) data.meta_prefix = '';
      // if (!data.meta_uri) data.meta_uri = '';
      // if (!data.meta_description) data.meta_description = '';
      // if (!data.meta_endescription) data.meta_endescription = '';
      // if (!data.meta_author) data.meta_author = '';
      if (undefined == data.meta_name) console.assert(false, "data.meta_name");
      if (undefined == data.meta_enname) console.assert(false, "data.meta_enname");
      if (undefined == data.meta_version) console.assert(false, "data.meta_version");
      if (undefined == data.meta_prefix) console.assert(false, "data.meta_prefix");
      if (undefined == data.meta_uri) console.assert(false, "data.meta_uri");
      if (undefined == data.meta_description) console.assert(false, "data.meta_description");
      if (undefined == data.meta_endescription) console.assert(false, "data.meta_endescription");
      if (undefined == data.meta_author) console.assert(false, "data.meta_author");

      editingVocabularyMeta.push(data);
    });
    this.editingVocabularyMeta = editingVocabularyMeta[ editingVocabularyMeta.length -1];
    this.setCurrentNode( this.editingVocabularyMeta );
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
  setCurrentNode( data=null ){ 
    // If reading the data
    if( data){
      this.currentNode = {
        id:  data.id || null,
        meta_name: data.meta_name || '',
        meta_enname: data.meta_enname || '',
        meta_version: data.meta_version || '',
        meta_prefix: data.meta_prefix || '',
        meta_uri: data.meta_uri || '',
        meta_description: data.meta_description || '',
        meta_endescription: data.meta_endescription || '',
        meta_author: data.meta_author ||'',
      };
    }
    else if( this.currentNode.meta_name !== '' ||
        this.currentNode.meta_enname !== '' ||
        this.currentNode.meta_version !== '' ||
        this.currentNode.meta_prefix !== '' ||
        this.currentNode.meta_uri !== '' ||
        this.currentNode.meta_description !== '' ||
        this.currentNode.meta_endescription  !== '' ||
        this.currentNode.meta_author  !== '' ){

      // this.currentNode; // As it is

    }
    else if (this.editingVocabularyMeta){
      this.currentNode = this.editingVocabularyMeta;
    }
    // If not reading the data
    else if ( !this.editingVocabularyMeta){
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
  @action updateMetaData( datas=null) {

    const error = this.errorCheck();
    if (error != '') {
      return error;
    }
   
    this.setCurrentNode();

    // Add selected vocabulary
    const updateCurrent = this.createDBFormatDataByCurrentNode();
    this.updateRequest([updateCurrent], updateCurrent);

    // all uri over write 
    this.updateVocabulariesUriFromMeta( datas );

    return '';
  }


  /**
   * Updating uri values etc. to DB 
   * @param  {object} datas - react data (EditingVocabulary.editingVocabulary) 
   */
  @action updateVocabulariesUriFromMeta( datas=null ) {
    if( !datas) return;
    if( this.currentNode.meta_uri == this.editingVocabularyMeta.meta_uri) return;
    
    let updateTermList=[];
    const prevMetaUri = this.editingVocabularyMeta.meta_uri; // note: properties of currentNode are changed according to input text. This behavior is different from EditingVocabulary.js
    let nextMetaUri = this.currentNode.meta_uri;
    if(!nextMetaUri.endsWith('/')){
      nextMetaUri = nextMetaUri + '/'
    }
    // this.currentNode.meta_uri <- input uri value
    // const metaUri = this.currentNode.meta_uri.replace(new RegExp('\/$'), '');
    datas.forEach((data) =>{

      if(data.external_voc){
        // other voc terms should not be affected
        return;
      }

      const uri = data.uri.replace(prevMetaUri, nextMetaUri);
      let broader_uri = '';
      if(data.broader_uri !=''){
        broader_uri = data.broader_uri.replace(prevMetaUri, nextMetaUri);
      }

      const dbData = {
        term: data.term,
        preferred_label: data.preferred_label,
        language:data.language,
        uri: uri,
        broader_term: data.broader_term,
        broader_uri: broader_uri,
        other_voc_syn_uri: data.other_voc_syn_uri,
        term_description: data.term_description,
        created_time: data.created_time,
        modified_time: data.modified_time,
        synonym_candidate: [],
        broader_term_candidate: [],
        position_x: String( data.position_x),
        position_y: String( data.position_y),
        color1: data.color1,
        color2: data.color2,
        hidden: data.hidden,
        confirm: data.confirm,
        external_voc: data.external_voc,
      };
      if (data.id) {
        dbData.id = Number(data.id);
      }
      if (data.synonym_candidate) {
        data.synonym_candidate.forEach((term) => {
          dbData.synonym_candidate.push(term);
        });
      }
      if (data.broader_term_candidate) {
        data.broader_term_candidate.forEach((term) => {
          dbData.broader_term_candidate.push(term);
        });
      }
      updateTermList.push(dbData);      
    });

    if( updateTermList.length > 0){
      editingVocabularyStore.updateRequest(updateTermList, updateTermList[0], null, null, false);
    }
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
    // No meta name
    if (this.currentNode.meta_name.trim() === '') {
      console.log('[errorCheck] meta_name.');
      errorKind = 'no_meta_name';
      return errorKind;
    }

    // No meta Uri
    if (this.currentNode.meta_uri.trim() === '') {
      console.log('[errorCheck] meta_uri.');
      errorKind = 'no_meta_uri';
      return errorKind;
    }

    // Wrong url string
    // const ret = /https?:\/\/.+?\//.test(this.currentNode.meta_uri.trim());
    // if ( !ret) {
    //   console.log('[errorCheck] meta_uri_wrong.');
    //   errorKind = 'wrong_url_string';
    //   return errorKind;
    // }

    return errorKind;
  }

  /**
   * Whether data has been edited and is pending
   * @return {boolean} - true: contain changes, false: not contain changes
   */
   @computed get isCurrentNodeChanged() {
    if( !this.editingVocabularyMeta){
      if(
        this.currentNode.meta_name != '' ||
        this.currentNode.meta_enname != '' ||
        this.currentNode.meta_version != '' ||
        this.currentNode.meta_prefix != '' ||
        this.currentNode.meta_uri != '' ||
        this.currentNode.meta_description != '' ||
        this.currentNode.meta_endescription != '' ||
        this.currentNode.meta_author != '' 
      ){
        return true;
      }
      return false;
    }
    else if(
      this.currentNode.meta_name != this.editingVocabularyMeta.meta_name ||
      this.currentNode.meta_enname != this.editingVocabularyMeta.meta_enname ||
      this.currentNode.meta_version != this.editingVocabularyMeta.meta_version ||
      this.currentNode.meta_prefix != this.editingVocabularyMeta.meta_prefix ||
      this.currentNode.meta_uri != this.editingVocabularyMeta.meta_uri ||
      this.currentNode.meta_description != this.editingVocabularyMeta.meta_description ||
      this.currentNode.meta_endescription != this.editingVocabularyMeta.meta_endescription ||
      this.currentNode.meta_author != this.editingVocabularyMeta.meta_author 
    ){
      return true;
    }
    return false;
  }

  /**
   *  MetaName update event
   * @param  {string} newValue MetaName 
   */
  @action updataMetaName(newValue) {
    this.currentNode.meta_name = newValue;
  }

  /**
   * MetaEnName update event
   * @param  {string} newValue MetaEnName
   */
  @action updataMetaEnName(newValue) {
    this.currentNode.meta_enname = newValue;
  }

  /**
   * MetaVersion update event
   * @param  {string} newValue MetaVersion
   */
  @action updataMetaVersion(newValue) {
    this.currentNode.meta_version = newValue;
  }

  /**
   * MetaPrefix update event
   * @param  {string} newValue MetaPrefix
   */
  @action updataMetaPrefix(newValue) {
    this.currentNode.meta_prefix = newValue;
  }

  /**
   * MetaUri update event
   * @param  {string} newValue MetaUri
   */
  @action updataMetaUri(newValue) {
    this.currentNode.meta_uri = newValue;
  }

  /**
   * MetaDescription update event
   * @param  {string} newValue MetaDescription
   */
  @action updataMetaDescription(newValue) {
    this.currentNode.meta_description = newValue;
  }

  /**
   * MetaEnDescription update event
   * @param  {string} newValue MetaEnDescription
   */
  @action updataMetaEnDescription(newValue) {
    this.currentNode.meta_endescription = newValue;
  }

  /**
   * MetaAuthor update event
   * @param  {string} newValue MetaAuthor
   */
  @action updataMetaAuthor(newValue) {
    this.currentNode.meta_author = newValue;
  }
  
}

const editingVocabularyMetaStore = new EditingVocabularyMeta();
export default editingVocabularyMetaStore;
