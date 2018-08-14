import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';

import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
};

// eslint-disable-next-line react/prefer-stateless-function
export default class SelectedWidgetItem extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const {
            index,
            title,
        } = this.props;

        return (
            <div className={styles.inputContainer}>
                <div className={styles.title}>
                    {title}
                </div>
                <DangerButton
                    className={styles.deleteButton}
                    iconName={iconNames.delete}
                    faramAction="remove"
                    title={_ts('widgets.editor.multiselect', 'removeOptionButtonTitle')}
                    faramElementIndex={index}
                    transparent
                />
            </div>
        );
    }
}
