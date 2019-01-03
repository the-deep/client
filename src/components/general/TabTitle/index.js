/**
* @author frozenhelium <fren.ankit@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';

import { FaramErrorIndicatorElement } from '#rscg/FaramElements';

import _cs from '#cs';

import styles from './styles.scss';


const propTypes = {
    hasError: PropTypes.bool,
    title: PropTypes.string,
};

const defaultProps = {
    hasError: false,
    title: '',
};

@FaramErrorIndicatorElement
export default class Tab extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { title, hasError } = this.props;

        const className = _cs(
            styles.tabTitle,
            'tab-title',
            hasError && styles.error,
            hasError && 'error',
        );

        return (
            <span className={className}>
                { title }
            </span>
        );
    }
}
