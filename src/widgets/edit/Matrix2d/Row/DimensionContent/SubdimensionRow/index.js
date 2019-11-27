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

const SubdimensionRow = ({ className, index, advanceMode }) => (
    <div className={_cs(className, styles.subdimensionRow)}>
        <FaramGroup faramElementName={String(index)}>
            <div className={styles.inputs}>
                <div className={styles.top}>
                    <TextInput
                        className={styles.titleInput}
                        faramElementName="title"
                        autoFocus
                        label={_ts('widgets.editor.matrix2d', 'unnamedSubdimensionLabel', { index: index + 1 })}
                    />
                    { advanceMode && (
                        <>
                            <OrientationInput
                                className={styles.orientationInput}
                                faramElementName="orientation"
                            />
                            <TextInput
                                type="number"
                                label={_ts('widgets.editor.matrix2d', 'fontSizeInputLabel')}
                                className={styles.fontSizeInput}
                                faramElementName="fontSize"
                                placeholder={_ts('widgets.editor.matrix2d', 'fontSizeInputPlaceholder')}
                            />
                            <TextInput
                                type="number"
                                label={_ts('widgets.editor.matrix2d', 'heightInputLabel')}
                                className={styles.heightInput}
                                faramElementName="height"
                                placeholder={_ts('widgets.editor.matrix2d', 'heightInputPlaceholder')}
                            />
                        </>
                    )}
                </div>
                <div className={styles.bottom}>
                    <TextArea
                        faramElementName="tooltip"
                        label={_ts('widgets.editor.matrix2d', 'tooltipLabel')}
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
    className: PropTypes.string,
    index: PropTypes.number.isRequired,
    advanceMode: PropTypes.bool,
};

SubdimensionRow.defaultProps = {
    className: undefined,
    advanceMode: false,
};

export default SubdimensionRow;

