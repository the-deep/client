import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import FaramGroup from '#rsci/Faram/FaramGroup';
import TextInput from '#rsci/TextInput';

import { iconNames } from '#constants';

import styles from './styles.scss';

const SubdimensionRow = ({ index }) => (
    <div className={styles.subdimensionRow}>
        <FaramGroup faramElementName={String(index)}>
            <TextInput
                className={styles.input}
                faramElementName="title"
                autoFocus
                // FIXME: use strings
                label={`Subdimension ${index + 1}`}
            />
            <TextInput
                className={styles.input}
                faramElementName="tooltip"
                // FIXME: use strings
                label="Tooltip"
            />
        </FaramGroup>
        <DangerButton
            className={styles.deleteButton}
            iconName={iconNames.delete}
            faramAction="remove"
            // FIXME: use strings
            title="Remove Subdimensions"
            faramElementIndex={index}
            transparent
        />
    </div>
);

SubdimensionRow.propTypes = {
    index: PropTypes.number.isRequired,
};

export default SubdimensionRow;

