import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import List from '#rscv/List';

import Cell from './Cell';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    labels: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selections: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    groupKey: PropTypes.string.isRequired,
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

    cellRendererParams = (key, data) => {
        const {
            leadId,
            groupKey,
            selections,
            selectedEntryKey,
            selectedEntryServerId,
        } = this.props;

        const {
            title,
            color,
        } = data;

        const isSelected = selections.some(s => s.labelId === key);
        const isCurrentEntryTagged = selections.some(s =>
            (s.labelId === key) && (s.entryClientId === selectedEntryKey));

        return ({
            color,
            isSelected,
            label: title,
            labelId: key,
            leadId,
            entryGroupKey: groupKey,
            selectedEntryKey,
            selectedEntryServerId,
            isCurrentEntryTagged: isSelected && isCurrentEntryTagged,
        });
    }

    render() {
        const {
            className,
            labels,
            title,
        } = this.props;

        return (
            <tr className={_cs(className, styles.groupRow)} >
                <td className={styles.groupTitle} >
                    {title}
                </td>
                <List
                    data={labels}
                    rendererParams={this.cellRendererParams}
                    renderer={Cell}
                    keySelector={labelKeySelector}
                />
            </tr>
        );
    }
}
