import React from 'react';
import PropTypes from 'prop-types';

import { FaramOutputElement } from '#rscg/FaramElements';

import ListView from '#rscv/List/ListView';
import ListItem from '#components/ListItem';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    labelSelector: PropTypes.func,
    keySelector: PropTypes.func,
    options: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    options: [],
    value: [],
    labelSelector: v => v.label,
    keySelector: v => v.key,
};

@FaramOutputElement
export default class MultiSelectListOutput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getSelections = (options, value, keySelector) => (
        options.filter(o => value.find(v => v === keySelector(o)))
    )

    constructor(props) {
        super(props);
        const {
            options,
            value,
            keySelector,
        } = props;

        this.selections = MultiSelectListOutput.getSelections(
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
            this.selections = MultiSelectListOutput.getSelections(
                newOptions,
                newValue,
                keySelector,
            );
        }
    }

    rendererParams = (key, option) => ({
        value: this.props.labelSelector(option),
    })

    render() {
        const {
            className,
            keySelector,
        } = this.props;

        return (
            <ListView
                className={`${className} ${styles.list}`}
                data={this.selections}
                keySelector={keySelector}
                renderer={ListItem}
                rendererParams={this.rendererParams}
            />
        );
    }
}
