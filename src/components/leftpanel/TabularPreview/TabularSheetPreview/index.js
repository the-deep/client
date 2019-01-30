import PropTypes from 'prop-types';
import React from 'react';

import ListView from '#rscv/List/ListView';
import Field from './Field';

const propTypes = {
    className: PropTypes.string,
    sheet: PropTypes.shape({
        fields: PropTypes.array,
        data: PropTypes.object,
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

    renderParams = (key, { id, title, type, options }) => ({
        fieldId: id,
        title,
        type,
        options,
        column: this.props.sheet.data.columns[id],
        color: (this.props.highlights[id] || {}).color,
        leadKey: (this.props.highlights[id] || {}).key,
        onClick: this.props.onClick,
    })

    render() {
        const {
            className,
            sheet,
        } = this.props;

        return (
            <ListView
                className={className}
                keySelector={TabularSheetPreview.keySelector}
                rendererParams={this.renderParams}
                data={sheet.fields}
                renderer={Field}
            />
        );
    }
}
