import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ListView from '#rscv/List/ListView';
import { randomString } from '#rsu/common';

import { addAfViewWidgetAction } from '#redux';
import _ts from '#ts';

import WidgetPreview from './WidgetPreview';
import styles from './styles.scss';

const propTypes = {
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    analysisFrameworkId: PropTypes.number.isRequired,
    widgetType: PropTypes.string.isRequired,

    addWidget: PropTypes.func.isRequired,
};
const defaultProps = {
    className: '',
    widgets: [],
};

const mapDispatchToProps = dispatch => ({
    addWidget: params => dispatch(addAfViewWidgetAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class WidgetList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = widget => widget.widgetId;

    handleItemAdd = (widget) => {
        const {
            widgetId,
            title,
            initialLayout,
        } = widget;
        const {
            analysisFrameworkId,
            widgetType,
        } = this.props;

        // TODO: calculate new position appropriately
        const widgetInfo = {
            key: `${widgetType}-${widgetId}-${randomString(16)}`,
            widgetId,
            title: _ts('widgetTitle', title),
            properties: { ...initialLayout, addedFrom: widgetType },
        };

        this.props.addWidget({
            analysisFrameworkId,
            widget: widgetInfo,
        });
    }

    rendererParams = (key, widget) => ({
        widget,
        onAdd: this.handleItemAdd,
    })

    render() {
        const {
            widgets,
            className: classNameFromProps,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.widgetListContainer}
        `;

        return (
            <div className={className}>
                <h4 className={styles.heading}>
                    {/* FIXME: Use strings */}
                    Widgets
                </h4>
                <ListView
                    className={styles.widgetList}
                    data={widgets}
                    renderer={WidgetPreview}
                    keyExtractor={WidgetList.keyExtractor}
                    rendererParams={this.rendererParams}
                />
            </div>
        );
    }
}
