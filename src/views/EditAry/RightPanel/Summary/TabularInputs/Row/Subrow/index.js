import React from 'react';
import PropTypes from 'prop-types';

import FaramGroup from '#rscg/FaramGroup';
import List from '#rscv/List';

import Cell from './Cell';

export default class SubRow extends React.PureComponent {
    static keySelector = data => data.key;

    static propTypes = {
        // eslint-disable-next-line react/forbid-prop-types
        columnFieldTitles: PropTypes.array.isRequired,
        // eslint-disable-next-line react/forbid-prop-types
        classNames: PropTypes.object.isRequired,
        subRowTitle: PropTypes.string.isRequired,
        subRowKey: PropTypes.string.isRequired,
    };

    rendererParamsForCell = key => ({
        columnKey: key,
        ...this.props,
    })

    render() {
        const {
            columnFieldTitles,
            classNames: {
                row,
                cell,
            },
            subRowTitle,
            subRowKey,
        } = this.props;

        return (
            <FaramGroup
                faramElementName={subRowKey}
            >
                <tr className={row}>
                    <td className={cell}>
                        {subRowTitle}
                    </td>
                    <List
                        data={columnFieldTitles}
                        renderer={Cell}
                        rendererParams={this.rendererParamsForCell}
                        keySelector={SubRow.keySelector}
                    />
                </tr>
            </FaramGroup>
        );
    }
}
