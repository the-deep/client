import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import FaramGroup from '#rscg/FaramGroup';
import TextInput from '#rsci/TextInput';

import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const faramInfoForDelete = {
    action: 'remove',
};

const SubsectorRow = ({ index }) => (
    <div className={styles.subsectorRow}>
        <FaramGroup faramElementName={String(index)}>
            <TextInput
                className={styles.input}
                faramElementName="title"
                autoFocus
                label={_ts('widgets.editor.matrix2d', 'unnamedSubsectorLabel', { index: index + 1 })}
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
            title={_ts('widgets.editor.matrix2d', 'removeSubsectorButtonTooltip')}
            faramElementIndex={index}
            transparent
        />
    </div>
);

SubsectorRow.propTypes = {
    index: PropTypes.number.isRequired,
};

export default SubsectorRow;

