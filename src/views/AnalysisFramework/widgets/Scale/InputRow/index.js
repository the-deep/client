import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rs/components/Action/Button/DangerButton';
import FaramGroup from '#rs/components/Input/Faram/FaramGroup';
import TextInput from '#rs/components/Input/TextInput';
import ColorInput from '#rs/components/Input/ColorInput';

import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
};

// eslint-disable-next-line react/prefer-stateless-function
export default class InputRow extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { index } = this.props;
        return (
            <div className={styles.sortableUnit}>
                <FaramGroup
                    faramElementName={String(index)}
                >
                    <ColorInput
                        faramElementName="color"
                        label={_ts('framework.scaleWidget', 'colorLabel')}
                    />
                    <TextInput
                        className={styles.titleInput}
                        faramElementName="label"
                        label={_ts('framework.scaleWidget', 'inputLabel', { index: index + 1 })}
                        placeholder={_ts('framework.scaleWidget', 'titlePlaceholderScale')}
                        autoFocus
                    />
                </FaramGroup>
                <DangerButton
                    className={styles.deleteButton}
                    iconName={iconNames.delete}
                    faramAction="remove"
                    title={_ts('framework.scaleWidget', 'removeButtonTitle')}
                    faramElementIndex={index}
                    transparent
                />
            </div>
        );
    }
}
