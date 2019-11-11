import PropTypes from 'prop-types';
import React from 'react';
import { FaramGroup } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import DangerButton from '#rsca/Button/DangerButton';
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';

import OrientationInput from '#components/general/OrientationInput';

import _ts from '#ts';

import styles from './styles.scss';

const deleteClick = (options, index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    return newOptions;
};

const SubsectorRow = ({ index, className }) => (
    <div className={_cs(className, styles.subsectorRow)}>
        <FaramGroup faramElementName={String(index)}>
            <div className={styles.inputs}>
                <div className={styles.top}>
                    <TextInput
                        className={styles.titleInput}
                        faramElementName="title"
                        autoFocus
                        label={_ts('widgets.editor.matrix2d', 'unnamedSubsectorLabel', { index: index + 1 })}
                        persistantHintAndError={false}
                    />
                    <OrientationInput
                        className={styles.orientationInput}
                        faramElementName="orientation"
                        persistantHintAndError={false}
                    />
                    <TextInput
                        type="number"
                        // FIXME: string
                        label="Font size"
                        className={styles.fontSizeInput}
                        faramElementName="fontSize"
                    />
                    <TextInput
                        type="number"
                        // FIXME: string
                        label="Width"
                        className={styles.widthInput}
                        faramElementName="width"
                    />
                </div>
                <div className={styles.bottom}>
                    <TextArea
                        className={styles.tooltipInput}
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
            title={_ts('widgets.editor.matrix2d', 'removeSubsectorButtonTooltip')}
            transparent
        />
    </div>
);

SubsectorRow.propTypes = {
    index: PropTypes.number.isRequired,
};

export default SubsectorRow;

