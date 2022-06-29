/**
 * History.js COPYRIGHT FUJITSU LIMITED 2021
 */

/**
 * History information class
 */
export default class History {
  /**
   * constructor
   * @param {string} action - operation content
   * @param {number} [targetId=null] - investigate ID
   * @param {number} [targetLangDiffId=null] - diff language investigate ID
   * @param {object} [previous=null] - content before change
   * @param {ObjectorBoolorString} [following=null] - changed content
   */
  constructor(action, targetId = null, targetLangDiffId = null, previous = null, following = null) {
    this._action = action;
    this._targetId = targetId;
    this._targetLangDiffId = targetLangDiffId;
    this._previous = previous;
    this._following = following;
  }

  /**
   * Get action
   * @return {string} - operation content
   */
  get action() {
    return this._action;
  }

  /**
   * Set action
   * @param  {string} action - operation content
   */
  set action(action) {
    this._action = action;
  }

  /**
   * Get targetId
   * @return {number} targetId
   */
  get targetId() {
    return this._targetId;
  }

  /**
   * Set targetId
   * @param  {number} targetId targetId
   */
  set targetId(targetId) {
    this._targetId = targetId;
  }

  /**
   * Get targetLangDiffId
   * @return {number} targetLangDiffId
   */
   get targetLangDiffId() {
    return this._targetLangDiffId;
  }

  /**
   * Set targetLangDiffId
   * @param  {number} targetLangDiffId targetLangDiffId
   */
  set targetLangDiffId(targetLangDiffId) {
    this._targetLangDiffId = targetLangDiffId;
  }

  /**
   * Get previous
   * @return {ObjectorBoolorString} - contents before the change
   */
  get previous() {
    return this._previous;
  }

  /**
   * Set previous
   * @param  {ObjectorBoolorString} previous - contents before the change
   */
  set previous(previous) {
    this._previous = previous;
  }

  /**
   * Get following
   * @return {ObjectorBoolorString} - changed contents
   */
  get following() {
    return this._following;
  }

  /**
   * Set following
   * @param  {ObjectorBoolorString} following - changed contents
   */
  set following(following) {
    this._following = following;
  }
}
