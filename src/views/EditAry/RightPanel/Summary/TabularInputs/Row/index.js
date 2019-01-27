import React from 'react';
import PropTypes from 'prop-types';

import FaramGroup from '#rscg/FaramGroup';
import NonFieldErrors from '#rsci/NonFieldErrors';
import List from '#rscv/List';

import SubRow from './Subrow';

export default class Row extends React.PureComponent {
    static propTypes = {
        // eslint-disable-next-line react/forbid-prop-types
        rowSubFieldTitles: PropTypes.array.isRequired,
        rowKey: PropTypes.string.isRequired,
        rowTitle: PropTypes.string.isRequired,
        // eslint-disable-next-line react/forbid-prop-types
        classNames: PropTypes.object.isRequired,
    };

    static keySelector = data => data.key;

    rendererParamsForSubRow = (key, datum) => ({
        subRowKey: key,
        subRowTitle: datum.title,
        ...this.props,
    });

    render() {
        const {
            rowSubFieldTitles,
            classNames: {
                row,
                sectionTitle,
            },
            rowTitle,
            rowKey,
        } = this.props;

        return (
            <FaramGroup
                faramElementName={rowKey}
            >
                <tr className={row}>
                    <td
                        className={sectionTitle}
                        colSpan="4"
                    >
                        {rowTitle}
                        {/* TODO: fix styling */}
                        <NonFieldErrors faramElement />
                    </td>
                </tr>
                <List
                    data={rowSubFieldTitles}
                    renderer={SubRow}
                    rendererParams={this.rendererParamsForSubRow}
                    keySelector={Row.keySelector}
                />
            </FaramGroup>
        );
    }
}

