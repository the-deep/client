import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import FaramGroup from '#rscg/FaramGroup';
import TextInput from '#rsci/TextInput';

import _ts from '#ts';
import { iconNames } from '#constants';

import styles from './styles.scss';

const deleteClick = (rows, index) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    return newRows;
};

const InputRow = ({ index }) => (
    <div className={styles.inputRow}>
        <FaramGroup faramElementName={String(index)}>
            <TextInput
                className={styles.input}
                faramElementName="value"
                autoFocus
                label={_ts('widgets.editor.matrix1d', 'unnamedCellTitle', { index: index + 1 })}
                selectOnFocus
            />
        </FaramGroup>
        <DangerButton
            faramAction={deleteClick}
            faramElementName={index}
            className={styles.deleteButton}
            iconName={iconNames.delete}
            title={_ts('widgets.editor.matrix1d', 'removeCellButtonTitle')}
            transparent
        />
    </div>
);

InputRow.propTypes = {
    index: PropTypes.number.isRequired,
};

export default InputRow;

