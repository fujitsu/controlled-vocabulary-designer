/**
 * Search.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Input from '@material-ui/core/Input';
import SearchIcon from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';

import DialogSearchTermError from './DialogSearchTermError';

/**
 * Search text field component
 * @extends React
 */
export default class Search extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {open: false, term: '', value: ''};
  }

  /**
   * Search error dialog open
   * @param  {string} term - search vocabulary
   */
  handleClickOpen(term) {
    this.setState({open: true, term: term});
  };

  /**
   * Search error dialog close
   */
  handleClose() {
    this.setState({open: false, term: ''});
  };

  /**
   * Search run
   * @param  {object} e - information of event
   */
  search(e) {
    const editingVocabulary = this.props.editingVocabulary;
    if (e.type == 'click' || (e.type == 'keydown' && e.keyCode === 13) ) {
      const convStr = this.hankana2Zenkana(this.state.value);
      let result;
      switch (editingVocabulary.currentVisualTab.id) {
        case 0:
          result = editingVocabulary.termListForRelationWord
              .find((node) => // Case-insensitive comparison
                node.data.term.toUpperCase() === convStr.toUpperCase());
          if (result) {
            editingVocabulary.setCurrentNodeByTerm(
                result.data.term, '', null, true);
          } else {
            this.handleClickOpen(this.state.value);
          }
          break;
        case 1:
          const targetFileData = editingVocabulary.getTargetFileData(
              editingVocabulary.selectedFile.id);
          result = targetFileData.find((node) => // Case-insensitive comparison
            node.term.toUpperCase() === convStr.toUpperCase());
          if (result) {
            editingVocabulary.setCurrentNodeByTerm(
                result.term, '', null, true);
          } else {
            this.handleClickOpen(this.state.value);
          }
          break;
      }
    }
  }

  /**
   * Half-width Katakana => Full-width Katakana conversion
   * @param  {string} str - string
   * @return {string} - conversion string
   */
  hankana2Zenkana(str) {
    const kanaMap = {
      'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
      'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
      'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
      'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
      'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
      'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
      'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
      'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
      'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
      'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
      'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
      'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
      'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
      'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
      'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
      'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
      'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
      'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
      '｡': '。', '､': '、', 'ｰ': 'ー', '｢': '「', '｣': '」', '･': '・',
    };

    const reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g');
    return str
        .replace(reg, (match) => {
          return kanaMap[match];
        })
        .replace(/ﾞ/g, '゛')
        .replace(/ﾟ/g, '゜');
  };

  /**
   * Search icon click event
   * @param  {object} e - information of event
   */
  handleMouseDown(e) {
    e.preventDefault();
  };

  /**
   * Search term input event
   * @param  {object} e - information of event
   */
  handleChange(e) {
    this.setState({value: e.target.value});
  };

  /**
   * render
   * @return {element}
   */
  render() {
    return (
      <div className={this.props.classes.searchRoot}>
        <Grid container spacing={2} border={1}>
          <Grid item xs={12}>
            <Box className={this.props.classes.search}>
              <Input
                placeholder="検索"
                disableUnderline
                classes={{
                  root: this.props.classes.inputRoot,
                  input: this.props.classes.inputInput,
                }}
                onKeyDown={(e) => this.search(e)}
                onChange={(e) => this.handleChange(e)}
                endAdornment={
                  <InputAdornment >
                    <IconButton
                      className={this.props.classes.searchIcon}
                      onClick={(e) => this.search(e)}
                      onMouseDown={(e) => this.handleMouseDown(e)}
                    >
                      <SearchIcon/>
                    </IconButton>
                  </InputAdornment>
                }
              />
            </Box>
          </Grid>
        </Grid>
        <DialogSearchTermError
          classes={this.props.classes}
          open={this.state.open}
          term={this.state.term}
          onClose={() => this.handleClose()}
        />
      </div>
    );
  }
}

Search.propTypes = {
  editingVocabulary: PropTypes.object,
  classes: PropTypes.object,
};
