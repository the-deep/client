import PropTypes from 'prop-types';
import React from 'react';

import VirtualizedListView from '#rscv/VirtualizedListView';
import Field from './Field';

const propTypes = {
    className: PropTypes.string,
    sheet: PropTypes.shape({
        fields: PropTypes.array,
        options: PropTypes.object,
    }),
    onClick: PropTypes.func.isRequired,
    highlights: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    sheet: {},
    highlights: {},
};

export default class TabularSheetPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keySelector = d => d.id;

    renderParams = (key, field) => ({
        fieldId: field.id,
        // title: field.title,
        // type,
        options: field.optinos,
        healthStats: field.cache.healthStats,
        tabularFieldData: field,
        color: (this.props.highlights[field.id] || {}).color,
        leadKey: (this.props.highlights[field.id] || {}).key,
        onClick: this.props.onClick,
    })

    render() {
        const {
            className,
            sheet: {
                fields,
            },
        } = this.props;

        return (
            <VirtualizedListView
                className={className}
                keySelector={TabularSheetPreview.keySelector}
                rendererParams={this.renderParams}
                data={fields}
                renderer={Field}
            />
        );
    }
}
