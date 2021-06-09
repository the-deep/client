import PropTypes from 'prop-types';
import React from 'react';
import produce from 'immer';
import memoize from 'memoize-one';

import VirtualizedListView from '#rscv/VirtualizedListView';
import Field from './Field';

const propTypes = {
    className: PropTypes.string,
    sheet: PropTypes.shape({
        // eslint-disable-next-line react/forbid-prop-types
        fields: PropTypes.array,
        // eslint-disable-next-line react/forbid-prop-types
        options: PropTypes.object,
    }),
    onClick: PropTypes.func.isRequired,
    highlights: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    showGraphs: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
    sheet: {},
    highlights: {},
};

const emptyArray = [];

export default class TabularSheetPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keySelector = d => d.id;

    constructor(props) {
        super(props);

        this.state = {
            fieldStates: {},
        };
    }

    getFilteredFields = memoize((fields = emptyArray) => fields.filter(field => !field.hidden))

    handleFieldStateChange = (fieldKey, value) => {
        this.setState((state) => {
            const { fieldStates } = state;
            const newFieldStates = produce(fieldStates, (deferred) => {
                // eslint-disable-next-line no-param-reassign
                deferred[fieldKey] = value;
            });
            return { fieldStates: newFieldStates };
        });
    }

    renderParams = (key, field) => ({
        fieldId: field.id,
        title: field.title,
        // type,
        options: field.options,
        healthStats: field.cache.healthStats,
        tabularFieldData: field,
        color: (this.props.highlights[field.id] || {}).color,
        leadKey: (this.props.highlights[field.id] || {}).key,
        onClick: this.props.onClick,
        showGraphs: this.props.showGraphs,

        fieldState: this.state.fieldStates[field.id],
        onFieldStateChange: this.handleFieldStateChange,
    })

    render() {
        const {
            className,
            sheet: {
                fields,
            },
        } = this.props;

        const filteredFields = this.getFilteredFields(fields);

        return (
            <VirtualizedListView
                className={className}
                keySelector={TabularSheetPreview.keySelector}
                rendererParams={this.renderParams}
                data={filteredFields}
                renderer={Field}
            />
        );
    }
}
