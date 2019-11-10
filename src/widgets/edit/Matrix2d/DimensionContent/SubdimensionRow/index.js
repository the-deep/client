import PropTypes from 'prop-types';
import React from 'react';
import { FaramGroup } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import DangerButton from '#rsca/Button/DangerButton';
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';

import _ts from '#ts';

import styles from './styles.scss';

const deleteClick = (options, index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    return newOptions;
};

const SubdimensionRow = ({ className, index }) => (
    <div className={_cs(className, styles.subdimensionRow)}>
        <FaramGroup faramElementName={String(index)}>
            <div className={styles.inputs}>
                <div className={styles.top}>
                    <TextInput
                        className={styles.titleInput}
                        faramElementName="title"
                        autoFocus
                        label={_ts('widgets.editor.matrix2d', 'unnamedSubdimensionLabel', { index: index + 1 })}
                        persistantHintAndError={false}
                    />
                    <TextInput
                        type="number"
                        // FIXME: string
                        label="Font size"
                        className={styles.fontSizeInput}
                        faramElementName="fontSize"
                        persistantHintAndError={false}
                    />
                    <TextInput
                        type="number"
                        // FIXME: string
                        label="Height"
                        className={styles.heightInput}
                        faramElementName="height"
                        persistantHintAndError={false}
                    />
                </div>
                <div className={styles.bottom}>
                    <TextArea
                        faramElementName="tooltip"
                        label={_ts('widgets.editor.matrix2d', 'tooltipLabel')}
                        persistantHintAndError={false}
                    />
                </div>
            </div>
        </FaramGroup>
        <DangerButton
            faramElementName={index}
            faramAction={deleteClick}
            className={styles.deleteButton}
            iconName="delete"
            title={_ts('widgets.editor.matrix2d', 'removeSubdimensionButtonTooltip')}
            transparent
        />
    </div>
);

SubdimensionRow.propTypes = {
    index: PropTypes.number.isRequired,
};

export default SubdimensionRow;

