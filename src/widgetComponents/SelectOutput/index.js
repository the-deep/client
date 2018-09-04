import React from 'react';
import PropTypes from 'prop-types';

import { FaramOutputElement } from '#rscg/FaramElements';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.string, // eslint-disable-line react/forbid-prop-types
    labelSelector: PropTypes.func,
    keySelector: PropTypes.func,
    options: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    options: [],
    value: '',
    labelSelector: v => v.label,
    keySelector: v => v.key,
};

@FaramOutputElement
export default class SelectOutput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getSelection = (options, value, keySelector) => (
        options.find(o => value === keySelector(o))
    )

    constructor(props) {
        super(props);
        const {
            options,
            value,
            keySelector,
        } = props;

        this.selection = SelectOutput.getSelection(
            options,
            value,
            keySelector,
        );
    }

    componentWillReceiveProps(nextProps) {
        const {
            options: newOptions,
            value: newValue,
            keySelector,
        } = nextProps;

        const {
            options: oldOptions,
            value: oldValue,
        } = this.props;

        if (oldOptions !== newOptions || newValue !== oldValue) {
            this.selection = SelectOutput.getSelection(
                newOptions,
                newValue,
                keySelector,
            );
        }
    }

    render() {
        const {
            className: classNameFromProps,
            labelSelector,
        } = this.props;

        const emptyText = '-';
        const className = `
            ${classNameFromProps}
            ${styles.selectOutput}
        `;

        return (
            <div className={className} >
                {this.selection ? (
                    labelSelector(this.selection)
                ) : (
                    emptyText
                )}
            </div>
        );
    }
}
