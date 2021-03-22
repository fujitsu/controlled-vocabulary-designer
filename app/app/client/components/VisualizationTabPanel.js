/**
 * VisualizationTabPanel.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import Box from '@material-ui/core/Box';
import PropTypes from 'prop-types';

/**
 * Visualization screen panel tab components
 * @param  {object} props - property
 * @return {element} - tab element
 */
export default function VisualizationTabPanel(props) {
  const {children, value, index, editingVocabulary, ...other} = props;

  if (editingVocabulary.getSelected(index)) {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={0}>
            <Box width="100%">{children}</Box>
          </Box>
        )}
      </div>
    );
  } else {
    let element;
    if (value === index) {
      element = (
        <div
          role="tabpanel"
          id={`simple-tabpanel-${index}`}
          aria-labelledby={`simple-tab-${index}`}
          {...other}
        >
          {
            <Box p={0}>
              <Box width="100%">{children}</Box>
            </Box>
          }
        </div>
      );
    } else {
      element = (
        <div
          role="tabpanel"
          id={`simple-tabpanel-${index}`}
          aria-labelledby={`simple-tab-${index}`}
          {...other}
          style={{display: 'none'}}
        >
          {
            <Box p={0}>
              <Box width="100%">{children}</Box>
            </Box>
          }
        </div>
      );
    }

    return element;
  }
}

VisualizationTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};
