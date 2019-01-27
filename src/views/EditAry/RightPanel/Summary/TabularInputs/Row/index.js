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
                sectionTitleCell,
                sectionNonFieldErrors,
                sectionTitleWrapper,
            },
            rowTitle,
            rowKey,
        } = this.props;

        return (
            <FaramGroup faramElementName={rowKey}>
                <tr className={row}>
                    <td
                        className={sectionTitleCell}
                        colSpan="4"
                    >
                        <div className={sectionTitleWrapper}>
                            <div className={sectionTitle}>
                                {rowTitle}
                            </div>
                            <NonFieldErrors
                                className={sectionNonFieldErrors}
                                faramElement
                            />
                        </div>
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

