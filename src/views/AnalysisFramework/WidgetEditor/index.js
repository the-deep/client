import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import update from 'immutability-helper';

import Faram from '#rs/components/Input/Faram';
import FaramGroup from '#rs/components/Input/Faram/FaramGroup';
import DangerConfirmButton from '#rs/components/Action/ConfirmButton/DangerConfirmButton';
import GridLayoutEditor from '#rs/components/View/GridLayoutEditor';

import {
    updateAfViewWidgetAction,
    removeAfViewWidgetAction,
} from '#redux';
import { iconNames } from '#constants';

import {
    fetchWidget,
    hasWidget,
    gridSize,
} from '../widgets';

import EditButton from './EditButton';
import styles from './styles.scss';

const OVERVIEW = 'overview';
const LIST = 'list';

const propTypes = {
    widgets: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,

    updateWidget: PropTypes.func.isRequired,
    removeWidget: PropTypes.func.isRequired,

    widgetType: PropTypes.string.isRequired,
};

const mapDispatchToProps = dispatch => ({
    removeWidget: params => dispatch(removeAfViewWidgetAction(params)),
    updateWidget: params => dispatch(updateAfViewWidgetAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class WidgetEditor extends React.PureComponent {
    static propTypes = propTypes;

    static keySelector = widget => widget.key;

    static schema = {};
    static value = {};

    widgetMinSizeSelector = (widget) => {
        const { minSize } = fetchWidget(this.props.widgetType, widget.widgetId);
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
            widgets,
            widgetType,
            updateWidget,
            analysisFrameworkId,
        } = this.props;

        const widget = widgets.find(d => d.key === key);

        const settings = {
            properties: {
                $if: [
                    widgetType === OVERVIEW,
                    { overviewGridLayout: { $set: layout } },
                    { listGridLayout: { $set: layout } },
                ],
            },
        };

        const newWidget = update(widget, settings);
        updateWidget({
            analysisFrameworkId,
            widget: newWidget,
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

        return widgetType === OVERVIEW ? overviewGridLayout : listGridLayout;
    }

    renderWidgetHeader = (widget) => {
        const { title, widgetId, key } = widget;
        const { editComponent: Widget } = fetchWidget(this.props.widgetType, widgetId);

        const showEdit = Widget && !(
            hasWidget(OVERVIEW, widgetId) && this.props.widgetType === LIST
        );

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
                        showEdit ? (
                            <Fragment>
                                <EditButton
                                    widget={widget}
                                    renderer={Widget}
                                    onChange={this.handleItemChange}
                                />
                                <DangerConfirmButton
                                    iconName={iconNames.delete}
                                    // FIXME: use strings
                                    title="Remove widget"
                                    tabIndex="-1"
                                    confirmationMessage="Do you want to remove this widget?"
                                    transparent
                                    onClick={() => this.handleItemRemove(key)}
                                />
                            </Fragment>
                        ) : (
                            <span
                                className={`${iconNames.info} ${styles.infoIcon}`}
                                title="Widget added from overview page" // FIXME: use strings
                            />
                        )
                    }
                </div>
            </div>
        );
    }

    renderWidgetContent = (widget) => {
        const { widgetId, id } = widget;
        const { component: Widget } = fetchWidget(this.props.widgetType, widgetId);

        return (
            <div className={styles.content}>
                <FaramGroup faramElementName={String(id)}>
                    <FaramGroup faramElementName="data">
                        { Widget &&
                            <Widget
                                widgetName={widgetId}
                                widgetType={this.props.widgetType}
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
        const { widgets } = this.props;
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
                    data={widgets}
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
