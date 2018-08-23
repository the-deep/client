import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import SelectInput from '#rsci/SelectInput';
import { TreeSelectionWithSelectors as TreeSelection } from '#rsci/TreeSelection';

import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import { afViewAnalysisFrameworkWidgetsSelector } from '#redux';

import {
    getSupportedWidgets,
    getOptionsForSelectedWidget,
} from './SupportedWidgets';

import styles from './styles.scss';

const propTypes = {
    widgets: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    widgets: afViewAnalysisFrameworkWidgetsSelector(state, props),
});

@connect(mapStateToProps)
export default class LinkWidgetModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static widgetKeySelector = w => w.key;
    static widgetLabelSelector = w => w.title;

    static optionsKeySelector = w => w.key;
    static optionsLabelSelector = w => w.title;

    static getSelectedWidgetOption = (id, options) => (
        options.find(o => LinkWidgetModal.optionsKeySelector(o) === id)
    );

    static getWidgetData = (id, widgets) => {
        const widget = widgets.find(w => LinkWidgetModal.widgetKeySelector(w) === id);
        if (!widget) {
            return {};
        }
        return (widget.properties || {}).data;
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedWidget: '',
            selectedWidgetItem: '',
            items: [],
        };
    }

    handleWidgetChange = (selectedWidget) => {
        this.setState({
            selectedWidget,
            selectedWidgetItem: '',
            items: [],
            treeKeySelector: undefined,
            treeLabelSelector: undefined,
            treeNodesSelector: undefined,
        });
    }

    handleWidgetOptionChange = (selectedWidgetItem) => {
        const { selectedWidget } = this.state;
        const selectedWidgetOption = LinkWidgetModal.getSelectedWidgetOption(
            selectedWidgetItem,
            this.selectedWidgetOptions,
        );

        const widgetData = LinkWidgetModal.getWidgetData(selectedWidget, this.filteredWidgets);

        let items = [];
        let treeKeySelector;
        let treeLabelSelector;
        let treeNodesSelector;

        if (selectedWidgetOption) {
            items = selectedWidgetOption.items(widgetData);
            treeKeySelector = selectedWidgetOption.keySelector;
            treeLabelSelector = selectedWidgetOption.labelSelector;
            treeNodesSelector = selectedWidgetOption.nodesSelector;
        }
        this.setState({
            items,
            selectedWidgetItem,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
        });
    }

    handleItemsChange = (items) => {
        this.setState({ items });
    }

    render() {
        const {
            onClose,
            widgets,
        } = this.props;

        const {
            items,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
            selectedWidget,
            selectedWidgetItem,
        } = this.state;

        this.filteredWidgets = getSupportedWidgets(widgets);
        this.selectedWidgetOptions = getOptionsForSelectedWidget(
            selectedWidget,
            this.filteredWidgets,
        );

        return (
            <Modal>
                <ModalHeader title="Link widgets" />
                <ModalBody>
                    <div className={styles.selectionBar} >
                        <SelectInput
                            options={this.filteredWidgets}
                            keySelector={LinkWidgetModal.widgetKeySelector}
                            labelSelector={LinkWidgetModal.widgetLabelSelector}
                            onChange={this.handleWidgetChange}
                            value={selectedWidget}
                        />
                        <SelectInput
                            options={this.selectedWidgetOptions}
                            keySelector={LinkWidgetModal.optionsKeySelector}
                            labelSelector={LinkWidgetModal.optionsLabelSelector}
                            onChange={this.handleWidgetOptionChange}
                            value={selectedWidgetItem}
                        />
                    </div>
                    <div className={styles.selectionBox} >
                        <TreeSelection
                            value={items}
                            onChange={this.onItemsChange}
                            labelSelector={treeLabelSelector}
                            keySelector={treeKeySelector}
                            nodesSelector={treeNodesSelector}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <DangerButton onClick={onClose}>
                        Cancel
                    </DangerButton>
                    <PrimaryButton>
                        Save
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }
}
