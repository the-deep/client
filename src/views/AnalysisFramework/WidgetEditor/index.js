import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import Faram from '#rsci/Faram';
import FaramGroup from '#rsci/Faram/FaramGroup';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import GridLayoutEditor from '#rscv/GridLayoutEditor';

import {
    updateAfViewWidgetAction,
    updateAfViewWidgetLayoutAction,
    removeAfViewWidgetAction,
} from '#redux';
import { iconNames } from '#constants';

import {
    fetchWidget,
    gridSize,
    VISIBILITY,
    VIEW,
    widgetVisibility,
} from '#widgets';

import _ts from '#ts';

import EditButton from './EditButton';
import styles from './styles.scss';

const propTypes = {
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,

    updateWidget: PropTypes.func.isRequired,
    updateWidgetLayout: PropTypes.func.isRequired,
    removeWidget: PropTypes.func.isRequired,

    widgetType: PropTypes.string.isRequired,
};

const defaultProps = {
    widgets: [],
};

const mapDispatchToProps = dispatch => ({
    removeWidget: params => dispatch(removeAfViewWidgetAction(params)),
    updateWidget: params => dispatch(updateAfViewWidgetAction(params)),
    updateWidgetLayout: params => dispatch(updateAfViewWidgetLayoutAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class WidgetEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = widget => widget.key;

    static schema = {};
    static value = {};

    widgetMinSizeSelector = (widget) => {
        const { widgetType } = this.props;
        const { widgetId } = widget;
        const { minSize } = fetchWidget(widgetType, widgetId);
        return minSize;
    }

    handleItemChange = (newWidget) => {
        const {
            analysisFrameworkId,
            updateWidget,
        } = this.props;

        updateWidget({
            analysisFrameworkId,
            widget: newWidget,
        });
    }

    handleItemRemove = (widgetId) => {
        const {
            analysisFrameworkId,
            removeWidget,
        } = this.props;

        removeWidget({
            analysisFrameworkId,
            widgetId,
        });
    }

    handleWidgetLayoutChange = (key, layout) => {
        const {
            widgetType,
            updateWidgetLayout,
            analysisFrameworkId,
        } = this.props;

        updateWidgetLayout({
            analysisFrameworkId,
            widgetKey: key,
            widgetType,
            layout,
        });
    }

    layoutSelector = (widget) => {
        const { widgetType } = this.props;
        const {
            properties: {
                overviewGridLayout,
                listGridLayout,
            } = {},
        } = widget;

        return widgetType === VIEW.overview ? overviewGridLayout : listGridLayout;
    }

    renderWidgetHeader = (widget) => {
        const { title, widgetId, key, properties: { addedFrom } } = widget;
        const { widgetType } = this.props;

        const { editComponent: Widget } = fetchWidget(widgetType, widgetId);

        const notReadonly = widgetVisibility(
            widgetId,
            widgetType,
            addedFrom,
        ) !== VISIBILITY.readonly;

        const layout = this.layoutSelector(widget);
        const widthBlocks = Math.ceil(layout.width / gridSize.width);
        const heightBlocks = Math.ceil(layout.height / gridSize.height);

        const headerTitle = (process.env.NODE_ENV === 'development')
            ? `${title} [${widthBlocks} ⨯ ${heightBlocks}]`
            : title;

        return (
            <div className={styles.header}>
                <h5 className={styles.heading}>
                    {headerTitle}
                </h5>
                <div className={styles.actionButtons}>
                    {
                        notReadonly ? (
                            <Fragment>
                                <EditButton
                                    widget={widget}
                                    renderer={Widget}
                                    onChange={this.handleItemChange}
                                />
                                <DangerConfirmButton
                                    iconName={iconNames.delete}
                                    title={_ts('framework.widgetEditor', 'deleteTooltip')}
                                    tabIndex="-1"
                                    confirmationMessage={_ts('framework.widgetEditor', 'deleteConfirmDetail')}
                                    transparent
                                    onClick={() => this.handleItemRemove(key)}
                                />
                            </Fragment>
                        ) : (
                            <span
                                className={`${iconNames.info} ${styles.infoIcon}`}
                                title={_ts('framework.widgetEditor', 'infoTooltip', { addedFrom })}
                            />
                        )
                    }
                </div>
            </div>
        );
    }

    renderWidgetContent = (widget) => {
        const { widgetId, id, properties: { addedFrom } } = widget;
        const { widgetType } = this.props;

        const {
            component,
            viewComponent,
        } = fetchWidget(widgetType, widgetId);

        const notReadonly = widgetVisibility(
            widgetId,
            widgetType,
            addedFrom,
        ) !== VISIBILITY.readonly;
        const Widget = notReadonly ? component : viewComponent;

        return (
            <div className={styles.content}>
                <FaramGroup faramElementName={String(id)}>
                    <FaramGroup faramElementName="data">
                        { Widget &&
                            <Widget
                                widgetName={widgetId}
                                widgetType={widgetType}
                                widget={widget}

                                entryType="excerpt"
                                excerpt=""
                                image={undefined}

                                disabled
                            />
                        }
                    </FaramGroup>
                </FaramGroup>
            </div>
        );
    }

    render() {
        const {
            widgets,
            widgetType,
        } = this.props;

        const filteredWidgets = widgets.filter(
            w => widgetVisibility(
                w.widgetId,
                widgetType,
                w.properties.addedFrom,
            ) !== VISIBILITY.hidden,
        );

        return (
            <Faram
                className={styles.faram}
                schema={WidgetEditor.schema}
                value={WidgetEditor.value}
                disabled
            >
                <GridLayoutEditor
                    className={styles.gridLayoutEditor}
                    gridSize={gridSize}
                    data={filteredWidgets}
                    layoutSelector={this.layoutSelector}
                    itemMinSizeSelector={this.widgetMinSizeSelector}
                    itemHeaderModifier={this.renderWidgetHeader}
                    itemContentModifier={this.renderWidgetContent}
                    keySelector={WidgetEditor.keySelector}
                    itemClassName={styles.widget}
                    onLayoutChange={this.handleWidgetLayoutChange}
                    dragItemClassName={styles.heading}
                />
            </Faram>
        );
    }
}
