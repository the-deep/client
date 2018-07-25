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
                    { /* TODO: push fix in react-store */ }
                    <ColorInput
                        faramElementName="color"
                        label={_ts('framework.scaleWidget', 'colorLabel')}
                        showHintAndError={false}
                    />
                    <TextInput
                        className={styles.titleInput}
                        faramElementName="label"
                        label={_ts('framework.scaleWidget', 'titleLabel')}
                        placeholder={_ts('framework.scaleWidget', 'titlePlaceholderScale')}
                        showHintAndError={false}
                        autoFocus
                    />
                </FaramGroup>
                <DangerButton
                    className={styles.deleteButton}
                    iconName={iconNames.delete}
                    faramAction="remove"
                    // FIXME: use strings
                    title="Remove Scale Unit"
                    faramElementIndex={index}
                    transparent
                />
            </div>
        );
    }
}
