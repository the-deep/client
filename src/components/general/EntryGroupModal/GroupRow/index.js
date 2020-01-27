import PropTypes from 'prop-types';
import React from 'react';

import List from '#rscv/List';

import Cell from './Cell';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    labels: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selections: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectedEntryKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
};

const defaultProps = {
    className: undefined,
    title: '',
    labels: [],
    selections: [],
    selectedEntryKey: undefined,
};

const labelKeySelector = d => d.id;

export default class GroupRow extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    labelsHeaderRendererParams = (key, data) => {
        const {
            selections,
            selectedEntryKey,
        } = this.props;

        const {
            title,
            color,
        } = data;

        const isSelected = selections.some(s => s.labelId === key);
        const isCurrentEntryTagged = selections.some(s =>
            (s.labelId === key) && (s.entryClientId === selectedEntryKey));

        return ({
            label: title,
            isSelected,
            isCurrentEntryTagged: isSelected && isCurrentEntryTagged,
            color,
        });
    }

    render() {
        const {
            className,
            labels,
            title,
        } = this.props;

        return (
            <tr className={className} >
                <td>
                    {title}
                </td>
                <List
                    data={labels}
                    rendererParams={this.labelsHeaderRendererParams}
                    renderer={Cell}
                    keySelector={labelKeySelector}
                />
            </tr>
        );
    }
}
