/**
* @author frozenhelium <fren.ankit@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';

import { FaramErrorIndicatorElement } from '#rscg/FaramElements';
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

    getClassName = () => {
        const { hasError } = this.props;

        const classNames = [
            styles.tabTitle,
            'tab-title',
        ];

        if (hasError) {
            classNames.push(styles.error);
            classNames.push('error');
        }

        return classNames.join(' ');
    }

    render() {
        const { title } = this.props;
        const className = this.getClassName();

        return (
            <span className={className}>
                { title }
            </span>
        );
    }
}
