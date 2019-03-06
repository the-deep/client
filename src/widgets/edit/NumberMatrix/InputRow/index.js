import PropTypes from 'prop-types';
import React from 'react';
import { FaramGroup } from '@togglecorp/faram';

import DangerButton from '#rsca/Button/DangerButton';
import TextInput from '#rsci/TextInput';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
};

// eslint-disable-next-line react/prefer-stateless-function
export default class InputRow extends React.PureComponent {
    static propTypes = propTypes;

    static deleteClick = (options, index) => {
        const newOptions = [...options];
        newOptions.splice(index, 1);
        return newOptions;
    }

    render() {
        const { index } = this.props;
        return (
            <div className={styles.inputContainer}>
                <FaramGroup faramElementName={String(index)}>
                    <TextInput
                        className={styles.titleInput}
                        faramElementName="title"
                        label={_ts('widgets.editor.numberMatrix', 'optionLabel', { index: index + 1 })}
                        autoFocus
                    />
                </FaramGroup>
                <DangerButton
                    faramAction={InputRow.deleteClick}
                    faramElementName={index}
                    className={styles.deleteButton}
                    iconName="delete"
                    title={_ts('widgets.editor.numberMatrix', 'removeOptionButtonTitle')}
                    transparent
                />
            </div>
        );
    }
}
