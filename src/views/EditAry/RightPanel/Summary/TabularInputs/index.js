import React from 'react';
import PropTypes from 'prop-types';

import List from '#rscv/List';

import Header from './Header';
import Row from './Row';

export default class TabularInputs extends React.PureComponent {
    static propTypes = {
        // eslint-disable-next-line react/forbid-prop-types
        rowFieldTitles: PropTypes.array.isRequired,
        // eslint-disable-next-line react/forbid-prop-types
        columnFieldTitles: PropTypes.array.isRequired,
        // eslint-disable-next-line react/forbid-prop-types
        classNames: PropTypes.object.isRequired,
    };

    static keySelector = data => data.key;

    rendererParamsForHeader = (key, datum) => ({
        title: datum.title,
        className: this.props.classNames.header,
    })

    rendererParamsForRow = (key, datum) => ({
        rowKey: key,
        rowTitle: datum.title,
        ...this.props,
    })

    render() {
        const {
            rowFieldTitles,
            classNames: {
                wrapper,
                table,
                body,
                head,
                row,
                header,
            },
            columnFieldTitles,
        } = this.props;

        return (
            <div className={wrapper}>
                <table className={table}>
                    <thead className={head}>
                        <tr className={row}>
                            {/* First empty space */}
                            <th className={header} />
                            <List
                                data={columnFieldTitles}
                                renderer={Header}
                                rendererParams={this.rendererParamsForHeader}
                                keySelector={TabularInputs.keySelector}
                            />
                        </tr>
                    </thead>
                    <tbody className={body}>
                        <List
                            data={rowFieldTitles}
                            rendererParams={this.rendererParamsForRow}
                            renderer={Row}
                            keySelector={TabularInputs.keySelector}
                        />
                    </tbody>
                </table>
            </div>
        );
    }
}
