/**
 * EditTabPanel.js COPYRIGHT FUJITSU LIMITED 2021
 */
import React from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';

/**
 * Edit action screen panel tab component
 * @param  {object} props - property
 * @return {element} - tab element
 */
export default function EditTabPanel(props) {
  const {children, value, index, ...other} = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={1}>
          <Box width="100%">{children}</Box>
        </Box>
      )}
    </div>
  );
}

EditTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};
