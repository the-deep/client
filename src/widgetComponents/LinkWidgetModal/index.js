import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import SelectInput from '#rsci/SelectInput';
import { TreeSelectionWithSelectors as TreeSelection } from '#rsci/TreeSelection';

import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ListView from '#rscv/List/ListView';
import ModalHeader from '#rscv/Modal/Header';
import { FaramActionElement } from '#rscg/FaramElements';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import { widgetGroups } from '#widgets/widgetMetadata';

import { afViewAnalysisFrameworkWidgetsSelector } from '#redux';

import _ts from '#ts';

import {
    getSupportedWidgets,
    getOptionsForSelectedWidget,
} from './SupportedWidgets';

import LinkItem from './LinkItem';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    widgets: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    onClick: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    widgetKey: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    widgets: afViewAnalysisFrameworkWidgetsSelector(state),
});

const emptyArray = [];
const emptyObject = {};


const getFlatItems = (params) => {
    const {
        data,
        items,
        itemValues,
        itemValue,
        treeKeySelector,
        treeLabelSelector,
        treeNodesSelector,
    } = params;

    if (items && items.length !== 0) {
        return items.reduce((selections, d) => [
            ...selections,
            ...getFlatItems({
                data: d,
                items: treeNodesSelector && treeNodesSelector(d),
                itemValue: itemValues[treeKeySelector(d)],
                itemValues: (itemValues[treeKeySelector(d)] || emptyObject).nodes,
                treeKeySelector,
                treeLabelSelector,
                treeNodesSelector,
            }),
        ], []);
    } else if (data) {
        return [{
            key: treeKeySelector(data),
            label: treeLabelSelector(data),
            selected: (itemValue || emptyObject).selected,
        }];
    }
    return emptyArray;
};

@FaramActionElement
@connect(mapStateToProps)
export default class LinkWidgetModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static widgetKeySelector = w => w.key;
    static widgetLabelSelector = w => w.title;

    static optionsKeySelector = w => w.key;
    static optionsLabelSelector = w => w.title;

    static widgetKeySelector = widget => widget.key;
    static groupKeySelector = widget => widget.groupId;

    static getSelectedWidgetOption = (id, options) => (
        options.find(o => LinkWidgetModal.optionsKeySelector(o) === id)
    );

    static getTitleOfSelectedWidget = (id, options) => (
        options.find(o => LinkWidgetModal.widgetKeySelector(o) === id).title
    );

    static getWidgetData = (id, widgets) => {
        const widget = widgets.find(w => LinkWidgetModal.widgetKeySelector(w) === id);
        if (!widget) {
            return emptyObject;
        }
        return (widget.properties || emptyObject).data;
    };

    static groupRendererParams = (groupKey) => {
        const { title } = widgetGroups[groupKey];
        const children = !title ? '' : _ts('widgetGroupTitle', title);
        return {
            children,
        };
    }

    static groupComparator = (a, b) => widgetGroups[a].order - widgetGroups[b].order;

    constructor(props) {
        super(props);
        const {
            widgets,
            widgetKey,
        } = this.props;

        this.filteredWidgets = getSupportedWidgets(widgets, widgetKey);
        const selectedWidget = this.filteredWidgets[0].key;

        const {
            items,
            selectedWidgetItem,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
        } = this.handleFilteredWidgetsChange(selectedWidget);

        this.state = {
            itemValues: emptyObject,
            items,
            selectedWidget,
            selectedWidgetItem,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
            pristine: true,
        };
    }

    handleWidgetChange = (selectedWidget) => {
        const {
            items,
            selectedWidgetItem,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
        } = this.handleFilteredWidgetsChange(selectedWidget);

        this.setState({
            items,
            itemValues: emptyObject,
            selectedWidget,
            selectedWidgetItem,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
        });
    }

    handleFilteredWidgetsChange = (selectedWidget) => {
        this.selectedWidgetOptions = getOptionsForSelectedWidget(
            selectedWidget,
            this.filteredWidgets,
        );
        const selectedWidgetItem = LinkWidgetModal.optionsKeySelector(
            this.selectedWidgetOptions[0],
        );

        const selectedWidgetOption = LinkWidgetModal.getSelectedWidgetOption(
            selectedWidgetItem,
            this.selectedWidgetOptions,
        );

        const widgetData = LinkWidgetModal.getWidgetData(selectedWidget, this.filteredWidgets);

        const treeKeySelector = selectedWidgetOption && selectedWidgetOption.keySelector;
        const treeLabelSelector = selectedWidgetOption && selectedWidgetOption.labelSelector;
        const treeNodesSelector = selectedWidgetOption && selectedWidgetOption.nodesSelector;

        const items = selectedWidgetOption ? (selectedWidgetOption.items(widgetData)) : emptyArray;

        return ({
            items,
            selectedWidgetItem,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
        });
    }

    handleWidgetOptionChange = (selectedWidgetItem) => {
        const { selectedWidget } = this.state;
        const selectedWidgetOption = LinkWidgetModal.getSelectedWidgetOption(
            selectedWidgetItem,
            this.selectedWidgetOptions,
        );

        const widgetData = LinkWidgetModal.getWidgetData(selectedWidget, this.filteredWidgets);

        const items = selectedWidgetOption ? selectedWidgetOption.items(widgetData) : emptyArray;
        const treeKeySelector = selectedWidgetOption && selectedWidgetOption.keySelector;
        const treeLabelSelector = selectedWidgetOption && selectedWidgetOption.labelSelector;
        const treeNodesSelector = selectedWidgetOption && selectedWidgetOption.nodesSelector;

        this.setState({
            items,
            itemValues: emptyObject,
            selectedWidgetItem,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
        });
    }

    handleItemValuesChange = (itemValues) => {
        this.setState({
            itemValues,
            pristine: false,
        });
    }

    handleSaveClick = () => {
        const {
            itemValues,
            items,
            selectedWidget,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
        } = this.state;

        const flatItems = getFlatItems({
            items,
            itemValues,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
        });
        const filteredItems = flatItems
            .filter(item => item.selected)
            .map(item => ({
                ...item,
                originalWidget: selectedWidget,
                originalKey: item.key,
            }));

        if (filteredItems.length > 0 && this.props.onClick) {
            this.props.onClick(filteredItems);
        } else {
            this.props.onClose();
        }
    }

    widgetListRendererParams = (key, widget) => {
        const { selectedWidget } = this.state;

        const {
            title,
            key: widgetKey,
        } = widget;

        return ({
            title,
            widget,
            widgetKey,
            active: selectedWidget === key,
            onClick: this.handleWidgetChange,
        });
    }

    render() {
        const {
            onClose,
            widgets,
            widgetKey,
            className,
        } = this.props;

        const {
            items,
            itemValues,
            pristine,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
            selectedWidget,
            selectedWidgetItem,
        } = this.state;

        this.filteredWidgets = getSupportedWidgets(widgets, widgetKey);
        this.selectedWidgetOptions = getOptionsForSelectedWidget(
            selectedWidget,
            this.filteredWidgets,
        );

        const selectedWidgetTitle = LinkWidgetModal.getTitleOfSelectedWidget(
            selectedWidget,
            this.filteredWidgets,
        );

        const modalTitle = _ts('widgets.editor.link', 'modalTitle');
        const optionsTypeSelectionLabel = _ts('widgets.editor.link', 'optionsTypeSelectionLabel');
        const listOfItemsHeader = _ts('widgets.editor.link', 'listOfItemsHeader');
        const saveButtonLabel = _ts('widgets.editor.link', 'saveButtonLabel');
        const cancelButtonLabel = _ts('widgets.editor.link', 'cancelButtonLabel');
        const rootNodeLabel = _ts('widgets.editor.link', 'rootNodeLabel');
        const cancelConfirmMessage = _ts('widgets.editor.link', 'cancelConfirmMessage');

        const areOptionTypesMultiple = this.selectedWidgetOptions.length > 1;

        return (
            <Modal className={`${styles.modal} ${className}`} >
                <ModalHeader title={modalTitle} />
                <ModalBody className={styles.modalBody} >
                    <div className={styles.leftContainer} >
                        <ListView
                            className={styles.widgetList}
                            data={this.filteredWidgets}
                            renderer={LinkItem}
                            rendererParams={this.widgetListRendererParams}
                            keySelector={LinkWidgetModal.widgetKeySelector}
                            rendererClassName={styles.item}
                            groupKeySelector={LinkWidgetModal.groupKeySelector}
                            groupRendererParams={LinkWidgetModal.groupRendererParams}
                            groupRendererClassName={styles.group}
                            groupComparator={LinkWidgetModal.groupComparator}
                        />
                    </div>
                    <div className={styles.rightContainer}>
                        <div className={styles.selectionBar} >
                            <h4>
                                {selectedWidgetTitle}
                            </h4>
                            {/*
                            <SelectInput
                                className={styles.selectInput}
                                label={widgetSelectionLabel}
                                options={this.filteredWidgets}
                                keySelector={LinkWidgetModal.widgetKeySelector}
                                labelSelector={LinkWidgetModal.widgetLabelSelector}
                                onChange={this.handleWidgetChange}
                                value={selectedWidget}
                                showHintAndError={false}
                                hideClearButton
                            />
                            */}
                            {areOptionTypesMultiple &&
                                <SelectInput
                                    className={styles.selectInput}
                                    label={optionsTypeSelectionLabel}
                                    options={this.selectedWidgetOptions}
                                    keySelector={LinkWidgetModal.optionsKeySelector}
                                    labelSelector={LinkWidgetModal.optionsLabelSelector}
                                    onChange={this.handleWidgetOptionChange}
                                    value={selectedWidgetItem}
                                    showHintAndError={false}
                                />
                            }
                        </div>
                        <div className={styles.selectionBox} >
                            <header className={styles.header}>
                                {listOfItemsHeader}
                            </header>
                            {items &&
                                <TreeSelection
                                    className={styles.tree}
                                    data={items}
                                    value={itemValues}
                                    onChange={this.handleItemValuesChange}
                                    labelSelector={treeLabelSelector}
                                    keySelector={treeKeySelector}
                                    nodesSelector={treeNodesSelector}
                                    rootKey="all"
                                    rootTitle={rootNodeLabel}
                                    withRoot
                                />
                            }
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <DangerConfirmButton
                        onClick={onClose}
                        confirmationMessage={cancelConfirmMessage}
                        skipConfirmation={pristine}
                    >
                        {cancelButtonLabel}
                    </DangerConfirmButton>
                    <PrimaryButton
                        onClick={this.handleSaveClick}
                        disabled={pristine}
                    >
                        {saveButtonLabel}
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }
}
