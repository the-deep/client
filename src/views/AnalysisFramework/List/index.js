import PropTypes from 'prop-types';
import React from 'react';
import update from 'immutability-helper';

import { connect } from 'react-redux';

import GridLayout from '#rs/components/View/GridLayout';
import Button from '#rs/components/Action/Button';
import DangerConfirmButton from '#rs/components/Action/ConfirmButton/DangerConfirmButton';
import { randomString } from '#rs/utils/common';

import { iconNames } from '#constants';
import {
    addAfViewWidgetAction,
    removeAfViewWidgetAction,
    updateAfViewWidgetAction,

    activeProjectIdFromStateSelector,
} from '#redux';
import _ts from '#ts';


import widgetStore from '../widgets';

import WidgetList from '../WidgetList';
import styles from './styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    addWidget: PropTypes.func.isRequired,
    removeWidget: PropTypes.func.isRequired,
    updateWidget: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
    addWidget: params => dispatch(addAfViewWidgetAction(params)),
    removeWidget: params => dispatch(removeAfViewWidgetAction(params)),
    updateWidget: params => dispatch(updateAfViewWidgetAction(params)),
});

const mapStateToProps = (state, props) => ({
    projectId: activeProjectIdFromStateSelector(state, props),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class List extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.items = [];
        this.gridItems = [];

        this.updateAnalysisFramework(props.analysisFramework);

        this.widgetEditActions = {};
    }

    componentWillReceiveProps(nextProps) {
        this.updateAnalysisFramework(nextProps.analysisFramework);
    }

    getUniqueKey = () => {
        let key;
        const checkExisting = () => this.items.find(item => item.key === key);

        do {
            key = randomString();
        } while (checkExisting());

        return key;
    }

    getGridItems = items => items.map((item) => {
        const {
            key,
            widgetId,
            title,
            properties: {
                listGridLayout: layout,
                data,
            },
        } = item;

        const widget = this.widgets.find(w => w.id === item.widgetId);
        const minSize = this.widgets.find(w => w.id === widgetId).listMinSize;

        const headerRightComponent = widget.overviewComponent ? (
            <span
                className={`${iconNames.info} info-icon`}
                title="Widget added from overview page" // FIXME: use strings
            />
        ) : (
            <div className="action-buttons">
                <Button
                    // FIXME: use strings
                    title="Edit widget"
                    onClick={() => this.handleWidgetEditButtonClick(key)}
                    iconName={iconNames.edit}
                    transparent
                />
                <DangerConfirmButton
                    // FIXME: use strings
                    title="Remove widget"
                    onClick={() => this.handleWidgetClose(key)}
                    iconName={iconNames.close}
                    transparent
                    // FIXME: use strings
                    confirmationTitle="Remove widget"
                    confirmationMessage={_ts('framework', 'confirmDeletewWidget')}
                />
            </div>
        );

        return {
            key,
            widgetId,
            title,
            minSize,
            layout,
            data,
            widget,
            headerRightComponent,
        };
    })

    getItemView = (item) => {
        const {
            widget: { listComponent },
            key: itemKey,
            title: itemTitle,
            data: itemData,
        } = item;
        const Component = listComponent;
        const onChange = (data, title) => {
            this.handleItemChange(itemKey, data, title);
        };
        const editAction = (handler) => {
            this.widgetEditActions[itemKey] = handler;
        };
        return (
            <Component
                title={itemTitle}
                widgetKey={itemKey}
                data={itemData}
                editAction={editAction}
                onChange={onChange}
                className={styles.component}
            />
        );
    }

    handleWidgetClose = (id) => {
        const {
            analysisFramework,
            removeWidget,
        } = this.props;

        const widgetData = {
            analysisFrameworkId: analysisFramework.id,
            widgetId: id,
        };

        removeWidget(widgetData);
    }

    handleWidgetEditButtonClick = (id) => {
        if (this.widgetEditActions[id]) {
            (this.widgetEditActions[id])();
        }
    }

    handleAddWidgetButtonClick = (id) => {
        const analysisFrameworkId = this.props.analysisFramework.id;
        const widget = this.widgets.find(w => w.id === id);

        const item = {
            analysisFramework: analysisFrameworkId,
            key: `list-${this.getUniqueKey()}`,
            widgetId: widget.id,
            title: widget.title,
            properties: {
                overviewGridLayout: widget.overviewComponent && {
                    left: 0,
                    top: 0,
                    ...widget.overviewMinSize || { width: 200, height: 50 },
                },
                listGridLayout: widget.listComponent && {
                    left: 0,
                    top: 0,
                    ...widget.listMinSize || { width: 200, height: 50 },
                },
            },
        };

        this.props.addWidget({
            analysisFrameworkId,
            widget: item,
        });
    }

    handleLayoutChange = (items) => {
        items.forEach((item) => {
            const originalItem = this.items.find(i => i.key === item.key);
            const settings = {
                properties: {
                    listGridLayout: { $set: item.layout },
                },
            };

            const analysisFrameworkId = this.props.analysisFramework.id;
            const widget = update(originalItem, settings);
            this.props.updateWidget({ analysisFrameworkId, widget });
        });
    }

    handleItemChange = (key, data, title) => {
        const originalItem = this.items.find(i => i.key === key);
        const settings = {
            title: { $set: title || originalItem.title },
            properties: {
                data: { $set: data },
            },
        };

        const analysisFrameworkId = this.props.analysisFramework.id;
        const widget = update(originalItem, settings);

        this.props.updateWidget({ analysisFrameworkId, widget });
    }

    updateAnalysisFramework(analysisFramework) {
        this.widgets = widgetStore
            .filter(widget => widget.analysisFramework.listComponent)
            .map(widget => ({
                id: widget.id,
                title: _ts('widgetTitle', widget.title),
                overviewComponent: widget.analysisFramework.overviewComponent,
                listComponent: widget.analysisFramework.listComponent,
                overviewMinSize: widget.analysisFramework.overviewMinSize,
                listMinSize: widget.analysisFramework.listMinSize,
            }));

        this.items = analysisFramework.widgets.filter(
            w => this.widgets.find(w1 => w1.id === w.widgetId),
        );

        this.gridItems = this.getGridItems(this.items);
    }

    render() {
        return (
            <div className={styles.list}>
                <div className={styles.gridLayoutWrapper}>
                    <GridLayout
                        className={styles.gridLayout}
                        modifier={this.getItemView}
                        items={this.gridItems}
                        onLayoutChange={this.handleLayoutChange}
                    />
                </div>
                <WidgetList
                    className={styles.widgetList}
                    widgets={this.widgets}
                    onAdd={this.handleAddWidgetButtonClick}
                />
            </div>
        );
    }
}
