import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import FaramGroup from '#rscg/FaramGroup';
import TextInput from '#rsci/TextInput';

import _ts from '#ts';
import { iconNames } from '#constants';

import styles from './styles.scss';

const faramInfoForDelete = {
    action: 'remove',
};

const SubdimensionRow = ({ index }) => (
    <div className={styles.subdimensionRow}>
        <FaramGroup faramElementName={String(index)}>
            <TextInput
                className={styles.input}
                faramElementName="title"
                autoFocus
                label={_ts('widgets.editor.matrix2d', 'unnamedSubdimensionLabel', { index: index + 1 })}
            />
            <TextInput
                className={styles.input}
                faramElementName="tooltip"
                label={_ts('widgets.editor.matrix2d', 'tooltipLabel')}
            />
        </FaramGroup>
        <DangerButton
            className={styles.deleteButton}
            iconName={iconNames.delete}
            faramInfo={faramInfoForDelete}
            title={_ts('widgets.editor.matrix2d', 'removeSubdimensionButtonTooltip')}
            faramElementIndex={index}
            transparent
        />
    </div>
);

SubdimensionRow.propTypes = {
    index: PropTypes.number.isRequired,
};

export default SubdimensionRow;

