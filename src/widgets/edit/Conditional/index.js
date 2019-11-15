import PropTypes from 'prop-types';
import React from 'react';
import Faram, { FaramList, requiredCondition } from '@togglecorp/faram';
import { randomString } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import ListView from '#rscv/List/ListView';
import SortableListView from '#rscv/SortableListView';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import NonFieldErrors from '#rsci/NonFieldErrors';
import ModalFooter from '#rscv/Modal/Footer';
import _ts from '#ts';

import { widgetList } from '#widgets/conditionalWidget';
import { widgetGroups } from '#widgets/widgetMetadata';
import { widgetListingVisibility } from '#widgets';

import WidgetPreview from './WidgetPreview';
import SelectedWidgetItem from './SelectedWidgetItem';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    properties: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
};

export default class ConditionalWidgetEdit extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = widget => widget.widgetId;
    static groupKeySelector = widget => widget.groupId;
    static itemKeySelector = ({ widget }) => widget.key;
    static itemLabelSelector = ({ widget }) => widget.title;

    static groupRendererParams = (groupKey) => {
        const { title } = widgetGroups[groupKey];
        const children = !title ? '' : _ts('widgetGroupTitle', title);
        return {
            children,
        };
    }

    static groupComparator = (a, b) => widgetGroups[a].order - widgetGroups[b].order;

    static schema = {
        fields: {
            title: [requiredCondition],
            defaultWidget: [],
            widgets: {
                keySelector: ConditionalWidgetEdit.itemKeySelector,
                member: {
                    fields: {
                        widget: {
                            fields: {
                                title: [requiredCondition],
                                key: [requiredCondition],
                                widgetId: [requiredCondition],
                                properties: [],
                            },
                        },
                        conditions: [],
                    },
                },
            },
        },
    }

    static getDataFromFaramValues = (data) => {
        const {
            title, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            ...otherValues
        } = data;
        return otherValues;
    };

    static getTitleFromFaramValues = data => data.title;

    constructor(props) {
        super(props);

        const {
            title,
            data,
            properties: { addedFrom },
        } = this.props;

        this.state = {
            faramErrors: {},
            faramValues: {
                title,
                ...data,
            },
            pristine: true,
            hasError: false,
        };

        this.widgets = widgetList.filter(
            w => widgetListingVisibility(w.widgetId, addedFrom),
        );
    }

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
            hasError: faramInfo.hasError,
        });

        const {
            widgetKey,
            onChange,
        } = this.props;
        onChange(
            widgetKey,
            ConditionalWidgetEdit.getDataFromFaramValues(faramValues),
            ConditionalWidgetEdit.getTitleFromFaramValues(faramValues),
        );
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            hasError: true,
        });
    }

    handleFaramValidationSuccess = (_, faramValues) => {
        const {
            onSave,
            closeModal,
            widgetKey,
        } = this.props;

        onSave(
            widgetKey,
            ConditionalWidgetEdit.getDataFromFaramValues(faramValues),
            ConditionalWidgetEdit.getTitleFromFaramValues(faramValues),
        );
        closeModal();
    }

    widgetListRendererParams = (key, widget) => {
        const { title } = widget;

        return ({
            title: _ts('widgetTitle', title),
            widget,
            widgetKey: key,
            createNewElement: widgetData => ({
                widget: {
                    key: `${widgetData.widgetId}-${randomString(16)}`.toLowerCase(),
                    widgetId: widgetData.widgetId,
                    title: _ts('widgetTitle', title),
                    properties: {},
                },
                conditions: {
                    list: [],
                    operator: 'AND',
                },
            }),
        });
    }

    itemRendererParams = (key, elem, i) => ({
        index: i,
        item: elem,
    });

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
            hasError,
        } = this.state;

        const {
            closeModal,
            title,
        } = this.props;

        const titleInputLabel = _ts('widgets.editor.conditional', 'titleLabel');
        const titleInputPlaceholder = _ts('widgets.editor.conditional', 'widgetTitlePlaceholder');
        const cancelButtonLabel = _ts('widgets.editor.conditional', 'cancelButtonLabel');
        const saveButtonLabel = _ts('widgets.editor.conditional', 'saveButtonLabel');
        const widgetsTitle = _ts('widgets.editor.conditional', 'widgetsTitle');
        const addedWidgetsTitle = _ts('widgets.editor.conditional', 'addedWidgetsTitle');
        const cancelConfirmMessage = _ts('widgets.editor.conditional', 'cancelConfirmMessage');

        const widgetsHeaderInfo = _ts('widgets.editor.conditional', 'supportedWidgetsInfoText');
        const addedWidgetsHeaderInfo = _ts('widgets.editor.conditional', 'addedWidgetsHeaderInfoText');

        return (
            <Modal className={styles.modal}>
                <Faram
                    className={styles.form}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={ConditionalWidgetEdit.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody className={styles.modalBody} >
                        <NonFieldErrors faramElement />
                        <div className={styles.widgetsHeader}>
                            <TextInput
                                className={styles.textInput}
                                faramElementName="title"
                                label={titleInputLabel}
                                placeholder={titleInputPlaceholder}
                                autoFocus
                                selectOnFocus
                            />
                            <SelectInput
                                faramElementName="defaultWidget"
                                options={faramValues.widgets}
                                keySelector={ConditionalWidgetEdit.itemKeySelector}
                                labelSelector={ConditionalWidgetEdit.itemLabelSelector}
                                label={_ts('widgets.editor.conditional', 'defaultWidgetLabel')}
                                placeholder={_ts('widgets.editor.conditional', 'defaultWidgetPlaceholder')}

                            />
                        </div>
                        <div className={styles.widgetsContainer}>
                            <FaramList
                                faramElementName="widgets"
                                keySelector={ConditionalWidgetEdit.itemKeySelector}
                            >
                                <div className={styles.leftContainer}>
                                    <header className={styles.header}>
                                        {widgetsTitle}
                                        <Icon
                                            className={styles.headerInfo}
                                            name="info"
                                            title={widgetsHeaderInfo}
                                        />
                                    </header>
                                    <ListView
                                        className={styles.widgetList}
                                        data={this.widgets}
                                        renderer={WidgetPreview}
                                        keySelector={ConditionalWidgetEdit.keySelector}
                                        rendererParams={this.widgetListRendererParams}
                                        rendererClassName={styles.item}
                                        groupKeySelector={ConditionalWidgetEdit.groupKeySelector}
                                        groupRendererParams={
                                            ConditionalWidgetEdit.groupRendererParams
                                        }
                                        groupRendererClassName={styles.group}
                                        groupComparator={ConditionalWidgetEdit.groupComparator}
                                    />
                                </div>
                                <div className={styles.rightContainer}>
                                    <header className={styles.header}>
                                        {addedWidgetsTitle}
                                        <Icon
                                            className={styles.headerInfo}
                                            name="info"
                                            title={addedWidgetsHeaderInfo}
                                        />
                                    </header>
                                    <SortableListView
                                        className={styles.editList}
                                        dragHandleClassName={styles.dragHandle}
                                        faramElement
                                        rendererParams={this.itemRendererParams}
                                        itemClassName={styles.sortableUnit}
                                        renderer={SelectedWidgetItem}
                                    />
                                </div>
                            </FaramList>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <DangerConfirmButton
                            onClick={closeModal}
                            confirmationMessage={cancelConfirmMessage}
                            skipConfirmation={pristine}
                        >
                            {cancelButtonLabel}
                        </DangerConfirmButton>
                        <PrimaryButton
                            type="submit"
                            disabled={pristine || hasError}
                        >
                            {saveButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
