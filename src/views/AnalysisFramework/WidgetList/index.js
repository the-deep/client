import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';

import { widgetGroups } from '#widgets/widgetMetadata';
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

    static keySelector = widget => widget.widgetId;
    static groupKeySelector = widget => widget.groupId;

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

        // TODO: calculate new appropriately while adding new widget
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

    groupRendererParams = (groupKey) => {
        const { title } = widgetGroups[groupKey];
        const children = !title ? '' : _ts('widgetGroupTitle', title);
        return {
            children,
        };
    }

    groupComparator = (a, b) => widgetGroups[a].order - widgetGroups[b].order;

    rendererParams = (key, widget) => ({
        widget,
        onAdd: this.handleItemAdd,
    })

    render() {
        const {
            widgets,
            className: classNameFromProps,
        } = this.props;

        return (
            <div className={_cs(classNameFromProps, styles.widgetListContainer)}>
                <h4 className={styles.heading}>
                    {/* FIXME: Use strings */}
                    Widgets
                </h4>
                <ListView
                    className={styles.widgetList}
                    data={widgets}
                    renderer={WidgetPreview}
                    keySelector={WidgetList.keySelector}
                    rendererParams={this.rendererParams}
                    groupKeySelector={WidgetList.groupKeySelector}
                    rendererClassName={_cs(styles.item, 'widget-list-item')}
                    groupRendererParams={this.groupRendererParams}
                    groupRendererClassName={_cs(styles.group, 'widget-list-group')}
                    groupComparator={this.groupComparator}
                />
            </div>
        );
    }
}
