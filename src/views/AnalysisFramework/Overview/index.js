import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import update from 'immutability-helper';

import { connect } from 'react-redux';

import Modal from '#rs/components/View/Modal';
import ModalHeader from '#rs/components/View/Modal/Header';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import GridLayout from '#rs/components/View/GridLayout';
import Button from '#rs/components/Action/Button';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import WarningButton from '#rs/components/Action/Button/WarningButton';
import DangerConfirmButton from '#rs/components/Action/ConfirmButton/DangerConfirmButton';
import { randomString } from '#rs/utils/common';
import GridViewLayout from '#rs/components/View/GridViewLayout';

import { iconNames } from '#constants';
import {
    addAfViewWidgetAction,
    removeAfViewWidgetAction,
    updateAfViewWidgetAction,

    activeProjectIdFromStateSelector,
} from '#redux';
import _ts from '#ts';


import WidgetList from '../WidgetList';
import styles from './styles.scss';

import { overviewWidgets, hasWidget, fetchWidget } from '../widgets/newindex';
// import widgetStore from '../widgets';


class EditModal extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
        };
    }

    handleEditClick = () => {
        this.setState({
            showModal: true,
        });
    }

    handleCancel = () => {
        this.setState({
            showModal: false,
        });
    }

    handleSave = (data, title) => {
        const { widget } = this.props;
        const { title: originalTitle } = widget;

        const settings = {
            title: { $set: title || originalTitle },
            properties: {
                data: { $set: data },
            },
        };

        const newWidget = update(widget, settings);

        this.props.onChange(newWidget);

        this.setState({
            showModal: false,
        });
    }

    render() {
        const {
            renderer: Widget,
            widget,
        } = this.props;
        const { showModal } = this.state;

        return (
            <Fragment>
                <WarningButton
                    iconName={iconNames.edit}
                    // FIXME: use strings
                    title="Edit widget"
                    tabIndex="-1"
                    transparent
                    onClick={this.handleEditClick}
                />
                {
                    showModal &&
                    <Widget
                        title={widget.title}
                        data={widget.properties.data}
                        onSave={this.handleSave}
                        onClose={this.handleCancel}
                    />
                }
            </Fragment>
        );
    }
}

const propTypes = {
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    // addWidget: PropTypes.func.isRequired,
    // updateWidget: PropTypes.func.isRequired,
    // removeWidget: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
    addWidget: params => dispatch(addAfViewWidgetAction(params)),
    removeWidget: params => dispatch(removeAfViewWidgetAction(params)),
    updateWidget: params => dispatch(updateAfViewWidgetAction(params)),
});

// eslint-disable-next-line
@connect(undefined, mapDispatchToProps)
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;

    static widgetType = 'overview'

    static filterWidgets = widgets => widgets.filter(
        widget => hasWidget(Overview.widgetType, widget.widgetId),
    );

    static layoutSelector = (widget) => {
        const { properties: { overviewGridLayout } = {} } = widget;
        return overviewGridLayout;
    }

    static keySelector = widget => widget.key;

    constructor(props) {
        super(props);

        const { analysisFramework: { widgets = [] } = {} } = this.props;
        this.widgets = Overview.filterWidgets(widgets);

        // this.items = [];
        // this.gridItems = [];

        // this.updateAnalysisFramework(props.analysisFramework);

        // this.widgetEditActions = {};
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.analysisFramework !== nextProps.analysisFramework) {
            const { analysisFramework: { widgets = [] } = {} } = nextProps;
            this.widgets = Overview.filterWidgets(widgets);
        }
    }

    /*
    componentWillReceiveProps(nextProps) {
        if (this.props.analysisFramework !== nextProps.analysisFramework) {
            this.updateAnalysisFramework(nextProps.analysisFramework);
        }
    }
    */

    /*
    getUniqueKey = () => {
        let key;
        const checkExisting = () => this.items.find(item => item.key === key);

        do {
            key = randomString();
        } while (checkExisting());

        return key;
    }
    */

    /*
    getGridItems = () => this.items.map(item => ({
        key: item.key,
        widgetId: item.widgetId,
        title: item.title,
        layout: item.properties.overviewGridLayout,
        minSize: this.widgets.find(w => w.id === item.widgetId).overviewMinSize,
        data: item.properties.data,
        headerRightComponent: (
            <div className="action-buttons">
                <Button
                    // FIXME: use strings
                    title="Edit widget"
                    // onClick={() => this.handleWidgetEditButtonClick(item.key)}
                    transparent
                    iconName={iconNames.edit}
                />
                <DangerConfirmButton
                    // FIXME: use strings
                    title="Remove widget"
                    onClick={() => this.handleWidgetClose(item.key)}
                    transparent
                    iconName={iconNames.close}
                    // FIXME: use strings
                    confirmationTitle="Remove widget"
                    confirmationMessage={_ts('framework', 'confirmDeletewWidget')}
                />
            </div>
        ),
    }))
    */

    /*
    getItemView = (item) => {
        const Component = this.widgets.find(w => w.id === item.widgetId).overviewComponent;

        return (
            <Component
                title={item.title}
                widgetKey={item.key}
                data={item.data}
                editAction={(handler) => { this.widgetEditActions[item.key] = handler; }}
                onChange={(data, title) => {
                    this.handleItemChange(item.key, data, title);
                }}
                className={styles.component}
            />
        );
    };
    */

    /*
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
    */

    /*
    handleWidgetEditButtonClick = (id) => {
        if (this.widgetEditActions[id]) {
            (this.widgetEditActions[id])();
        }
    }
    */

    /*
    handleAddWidgetButtonClick = (id) => {
        const analysisFrameworkId = this.props.analysisFramework.id;
        const widget = this.widgets.find(w => w.id === id);

        const item = {
            key: `overview-${this.getUniqueKey()}`,
            widgetId: widget.id,
            title: widget.title,
            // TODO: calculate new position appropriately
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
    */

    /*
    handleLayoutChange = (items) => {
        items.forEach((item) => {
            const originalItem = this.items.find(i => i.key === item.key);
            const settings = {
                properties: {
                    overviewGridLayout: { $set: item.layout },
                },
            };

            const analysisFrameworkId = this.props.analysisFramework.id;
            const widget = update(originalItem, settings);
            this.props.updateWidget({ analysisFrameworkId, widget });
        });
    }
    */

    handleItemChange = (newWidget) => {
        const analysisFrameworkId = this.props.analysisFramework.id;

        this.props.updateWidget({
            analysisFrameworkId,
            widget: newWidget,
        });
    }

    /*
    updateAnalysisFramework(analysisFramework) {
        this.widgets = widgetStore
            .filter(widget => widget.analysisFramework.overviewComponent)
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

        // this.gridItems = this.getGridItems();
    }
    */

    renderWidgetHeader = (widget) => {
        const { title, widgetId } = widget;
        const overviewWidget = fetchWidget(Overview.widgetType, widgetId);
        return (
            <div className={styles.header}>
                <h5 className={styles.heading}>
                    { title }
                </h5>
                <div className={styles.actionButtons}>
                    { overviewWidget.editComponent &&
                        <EditModal
                            widget={widget}
                            renderer={overviewWidget.editComponent}
                            onChange={this.handleItemChange}
                        />
                    }
                    <DangerConfirmButton
                        iconName={iconNames.delete}
                        // FIXME: use strings
                        title="Remove widget"
                        tabIndex="-1"
                        confirmationMessage="Do you want to remove this widget?"
                        transparent
                    />
                </div>
            </div>
        );
    }

    renderWidgetContent = (widget) => {
        const { widgetId } = widget;
        const overviewWidget = fetchWidget(Overview.widgetType, widgetId);
        const { Widget } = overviewWidget;

        return (
            <div className={styles.content}>
                { Widget &&
                    <Widget
                        disabled
                    />
                }
            </div>
        );
    }

    render() {
        return (
            <div className={styles.overview}>
                <WidgetList
                    className={styles.widgetList}
                    widgets={overviewWidgets}
                    // onAdd={this.handleAddWidgetButtonClick}
                />
                <div className={styles.gridLayoutContainer}>
                    <div className={styles.scrollWrapper}>
                        <GridViewLayout
                            data={this.widgets}
                            layoutSelector={Overview.layoutSelector}
                            itemHeaderModifier={this.renderWidgetHeader}
                            itemContentModifier={this.renderWidgetContent}
                            keySelector={Overview.keySelector}
                            itemClassName={styles.widget}
                        />
                        {/*
                        <GridLayout
                            className={styles.gridLayout}
                            modifier={this.getItemView}
                            items={this.gridItems}
                            onLayoutChange={this.handleLayoutChange}
                        />
                        */}
                    </div>
                </div>
            </div>
        );
    }
}
