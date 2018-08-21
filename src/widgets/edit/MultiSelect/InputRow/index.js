import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import FaramGroup from '#rscg/FaramGroup';
import TextInput from '#rsci/TextInput';

import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
};

export default class InputRow extends React.PureComponent {
    static propTypes = propTypes;

    static faramInfoForDelete = {
        action: 'remove',
    }

    render() {
        const { index } = this.props;
        return (
            <div className={styles.inputContainer}>
                <FaramGroup
                    faramElementName={String(index)}
                >
                    <TextInput
                        className={styles.titleInput}
                        faramElementName="label"
                        label={_ts('widgets.editor.multiselect', 'optionLabel', { index: index + 1 })}
                        autoFocus
                    />
                </FaramGroup>
                <DangerButton
                    className={styles.deleteButton}
                    iconName={iconNames.delete}
                    faramInfo={InputRow.faramInfoForDelete}
                    title={_ts('widgets.editor.multiselect', 'removeOptionButtonTitle')}
                    faramElementIndex={index}
                    transparent
                />
            </div>
        );
    }
}
