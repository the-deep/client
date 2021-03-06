/**
* @author frozenhelium <fren.ankit@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';

import { FaramErrorIndicatorElement } from '@togglecorp/faram';

import _cs from '#cs';

import styles from './styles.scss';


const propTypes = {
    hasError: PropTypes.bool,
    title: PropTypes.string,
    onClick: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    hasError: false,
    title: '',
    onClick: undefined,
    className: undefined,
};

export class NormalTabTitle extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            title,
            hasError,
            onClick,
            className: classNameFromProps,
        } = this.props;

        const className = _cs(
            styles.button,
            'tab-title',
            hasError && styles.error,
            hasError && 'error',
        );

        return (
            <div className={classNameFromProps}>
                <button
                    className={className}
                    onClick={onClick}
                    tabIndex="-1"
                    type="button"
                >
                    { title }
                </button>
            </div>
        );
    }
}

export default FaramErrorIndicatorElement(NormalTabTitle);
