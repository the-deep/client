import PropTypes from 'prop-types';
import React from 'react';

import { _cs } from '@togglecorp/fujs';
import AccentButton from '#rsca/Button/AccentButton';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired,
};
const defaultProps = {
    className: undefined,
    disabled: false,
};

export default class ExtractThis extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            disabled,
            children,
            onClick,
        } = this.props;

        return (
            <div className={_cs(styles.applyInput, className)}>
                { children }
                <div className={styles.applyButtons}>
                    <AccentButton
                        className={styles.applyButton}
                        transparent
                        title={_ts('addLeads', 'extractLead')}
                        disabled={disabled}
                        onClick={onClick}
                        tabIndex="-1"
                        iconName="eye"
                    />
                </div>
            </div>
        );
    }
}
