import React from 'react';
import PropTypes from 'prop-types';

const Cell = (props) => {
    const {
        classNames,
        inputModifier,
        columnKey,
        rowKey,
        subRowKey,
    } = props;

    return (
        <td className={classNames.cell} >
            {
                inputModifier(
                    rowKey,
                    subRowKey,
                    columnKey,
                )
            }
        </td>
    );
};
Cell.propTypes = {
    subRowKey: PropTypes.string.isRequired,
    rowKey: PropTypes.string.isRequired,
    columnKey: PropTypes.string.isRequired,
    inputModifier: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    classNames: PropTypes.object.isRequired,
};

export default Cell;
