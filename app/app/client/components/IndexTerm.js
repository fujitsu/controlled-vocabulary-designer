/**
 * IndexTermList.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import {observer} from 'mobx-react';

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
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

/**
 * [ItemRenderer description]
 * @extends PureComponent
 */
export default
@observer class IndexTerm extends React.Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.borderStyle = {
      'black': {
        'borderTop': '3px solid #ffffff',
        'borderBottom': '3px solid #ffffff',
      },
      'brown': {
        'borderTop': '3px solid ' + brown[500],
        'borderBottom': '3px solid ' + brown[500],
      },
      'red': {
        'borderTop': '3px solid ' + red[500],
        'borderBottom': '3px solid ' + red[500],
      },
      'orange': {
        'borderTop': '3px solid ' + orange[500],
        'borderBottom': '3px solid ' + orange[500],
      },
      'yellow': {
        'borderTop': '3px solid ' + yellow[500],
        'borderBottom': '3px solid ' + yellow[500],
      },
      'lightGreen': {
        'borderTop': '3px solid ' + lightGreen[500],
        'borderBottom': '3px solid ' + lightGreen[500],
      },
      'green': {
        'borderTop': '3px solid ' + green[500],
        'borderBottom': '3px solid ' + green[500],
      },
      'lightBlue': {
        'borderTop': '3px solid ' + lightBlue[500],
        'borderBottom': '3px solid ' + lightBlue[500],
      },
      'blue': {
        'borderTop': '3px solid ' + blue[500],
        'borderBottom': '3px solid ' + blue[500],
      },
      'deepPurple': {
        'borderTop': '3px solid ' + deepPurple[500],
        'borderBottom': '3px solid ' + deepPurple[500],
      },
      'purple': {
        'borderTop': '3px solid ' + purple[500],
        'borderBottom': '3px solid ' + purple[500],
      },
    };
    this.backgroundStyle = {
      'black': {
        'unselected': '',
        'selected': '',
      },
      'brown': {
        'unselected': brown[200],
        'selected': brown[400],
      },
      'red': {
        'unselected': red[200],
        'selected': red[400],
      },
      'orange': {
        'unselected': orange[200],
        'selected': orange[400],
      },
      'yellow': {
        'unselected': yellow[200],
        'selected': yellow[400],
      },
      'lightGreen': {
        'unselected': lightGreen[200],
        'selected': lightGreen[400],
      },
      'green': {
        'unselected': green[200],
        'selected': green[400],
      },
      'lightBlue': {
        'unselected': lightBlue[200],
        'selected': lightBlue[400],
      },
      'blue': {
        'unselected': blue[200],
        'selected': blue[400],
      },
      'deepPurple': {
        'unselected': deepPurple[200],
        'selected': deepPurple[400],
      },
      'purple': {
        'unselected': purple[200],
        'selected': purple[400],
      },
    };
  }

  /**
   * [render description]
   * @return {string} [description]
   */
  render() {
    const index = this.props.index;
    const currentTerm = this.props.editingVocabulary.currentNode.term;
    const sortedNodeList = this.props.editingVocabulary.sortedNodeList;
    const isCurrent = sortedNodeList[index].term === currentTerm ? true:false;

    const color1 = sortedNodeList[index].color1;
    // let style = color1 ? this.borderStyle[color1] : {};
    const style =
      color1 ? JSON.parse(JSON.stringify(this.borderStyle[color1])) :
       JSON.parse(JSON.stringify(this.borderStyle['black']));
    const confirmColor = this.props.editingVocabulary.confirmColor;
    if (sortedNodeList[index].confirm == 1) {
      if (isCurrent) {
        style.backgroundColor = this.backgroundStyle[confirmColor].selected;
      } else {
        style.backgroundColor = this.backgroundStyle[confirmColor].unselected;
      }
    }

    // Enable border for border only while viewing lexical data for editing
    const fileId = this.props.editingVocabulary.selectedFile.id;
    const isDivider = fileId == 0 ? true : false;

    return (
      <div style={this.props.style}>
        <ListItem
          button
          style={style}
          key={index}
          divider={isDivider}
          selected={isCurrent}
          onClick={(event) => this.props.selectCurrentTerm(event)}
          // autoFocus={ this.props.index === this.state.tabIndex }
        >
          <ListItemText
            primary={ sortedNodeList[index].term }
            id={ sortedNodeList[index].id }
            classes={ {root: this.props.classes.noWrap} }
          />
        </ListItem>
      </div>
    );
  }
}

IndexTerm.propTypes = {
  index: PropTypes.number,
  style: PropTypes.object,
  classes: PropTypes.object,
  editingVocabulary: PropTypes.object,
  selectCurrentTerm: PropTypes.func,
};
