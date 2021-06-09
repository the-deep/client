import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import Faram, { FaramList } from '@togglecorp/faram';
import { randomString } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import SortableListView from '#rscv/SortableListView';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import SegmentInput from '#rsci/SegmentInput';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ListView from '#rscv/List/ListView';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import {
    afViewAnalysisFrameworkSelector,
} from '#redux';
import {
    conditions as conditionsAttributes,
    conditionsAsMap,
    compatibleWidgetIds,
} from '#widgets/conditionalWidget';

import {
    widgetGroups,
    widgetTitlesGroupMapForConditional as widgetTitles,
} from '#widgets/widgetMetadata';

import _ts from '#ts';

import WidgetPreview from '../WidgetPreview';
import InputRow from './InputRow';
import styles from './styles.scss';

const propTypes = {
    widgetTitle: PropTypes.string.isRequired,
    conditions: PropTypes.shape({
        // eslint-disable-next-line react/forbid-prop-types
        list: PropTypes.array,
        operator: PropTypes.oneOf(['AND', 'OR', 'XOR']),
    }).isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,

    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    analysisFramework: undefined,
};

const mapStateToProps = state => ({
    analysisFramework: afViewAnalysisFrameworkSelector(state),
});

const operatorOptions = [
    { key: 'AND', label: 'AND' },
    { key: 'OR', label: 'OR' },
    { key: 'XOR', label: 'XOR' },
];

class ConditionsEditModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static widgetKeySelector = widget => widget.key;
    static groupKeySelector = widget => widget.groupId;

    static operatorKeySelector = o => o.key;
    static operatorLabelSelector = o => o.label;

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
        const { conditions } = this.props;

        this.schema = {
            fields: {
                list: {
                    keySelector: ConditionsEditModal.widgetKeySelector,
                    member: {
                        fields: {
                            key: [],
                            widgetId: [],
                            widgetKey: [],
                            conditionType: [],
                            invertLogic: [],
                            attributes: [],
                        },
                        validation: this.validateCondition,
                    },
                },
                operator: [],
            },
        };

        this.state = {
            faramValues: conditions,
            faramErrors: {},
            pristine: true,
            hasError: false,
        };
    }

    getCompatibleWidget = memoize(widgets => (
        widgets.filter(w => compatibleWidgetIds.indexOf(w.widgetId) >= 0)
            .map(w => ({
                ...w,
                groupId: widgetTitles[w.widgetId].groupId,
            }))
    ));

    validateCondition = (obj) => {
        // First grab the validator for this condition
        const conditions = conditionsAsMap[obj.widgetId];
        const condition = conditions && conditions[obj.conditionType];
        const validator = condition && condition.validate;

        if (!validator) {
            return [];
        }

        // Next grab the widget data required for validation
        const { analysisFramework: { widgets = [] } = {} } = this.props;
        const widgetData = widgets.find(w => w.key === obj.widgetKey);
        const { properties: { data = {} } = {} } = widgetData;

        // Finally validate
        const validation = validator(obj.attributes || {}, data || {});
        if (validation.ok) {
            return [];
        }
        return [validation.message];
    }

    widgetListRendererParams = (key, widget) => {
        const { title } = widget;

        return ({
            title,
            widget,
            widgetKey: key,
            createNewElement: (widgetData) => {
                const conditionList = conditionsAttributes[widgetData.widgetId];
                const condition = conditionList && conditionList[0];

                return {
                    key: `condition-${randomString(16)}`,
                    widgetId: widgetData.widgetId,
                    widgetKey: widgetData.key,
                    conditionType: condition && condition.key,
                };
            },
        });
    }

    itemRendererParams = (key, item, index) => {
        const {
            analysisFramework: {
                widgets = [],
            } = {},
        } = this.props;

        const widgetData = widgets.find(w => w.key === item.widgetKey);

        return ({
            index,
            item,
            widgetData,
            conditions: conditionsAttributes[item.widgetId],
        });
    }

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
            hasError: faramInfo.hasError,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            hasError: true,
        });
    };

    handleFaramValidationSuccess = (_, faramValues) => {
        this.props.onSave(faramValues);
    };

    render() {
        const {
            analysisFramework: { widgets = [] },
            onClose,
            widgetTitle,
        } = this.props;
        const {
            faramValues,
            faramErrors,
            pristine,
            hasError,
        } = this.state;

        const widgetsTitle = _ts('widgets.editor.conditional', 'widgetsTitle');
        const conditionsTitle = _ts('widgets.editor.conditional', 'conditionsTitle');
        const editConditionsTitle = _ts('widgets.editor.conditional', 'widgetConditionsTitle', { widgetTitle });
        const cancelLabel = _ts('widgets.editor.conditional', 'cancelButtonLabel');
        const saveLabel = _ts('widgets.editor.conditional', 'saveButtonLabel');
        const operatorSelectLabel = _ts('widgets.editor.conditional', 'operatorSelectLabel');
        const cancelConfirmMessage = _ts('widgets.editor.conditional', 'cancelConfirmMessage');

        const widgetsHeaderInfo = _ts('widgets.editor.conditional', 'frameworkWidgetsInfoText');

        const compatibleWidgets = this.getCompatibleWidget(widgets);

        return (
            <Modal className={styles.conditionEditModal} >
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={editConditionsTitle} />
                    <ModalBody className={styles.modalBody} >
                        <FaramList
                            keySelector={ConditionsEditModal.widgetKeySelector}
                            faramElementName="list"
                        >
                            <div className={styles.leftContainer}>
                                <header className={styles.header}>
                                    {widgetsTitle}
                                    <Icon
                                        className={styles.headerInfo}
                                        title={widgetsHeaderInfo}
                                        name="info"
                                    />
                                </header>
                                <ListView
                                    className={styles.widgetList}
                                    data={compatibleWidgets}
                                    renderer={WidgetPreview}
                                    rendererParams={this.widgetListRendererParams}
                                    keySelector={ConditionsEditModal.widgetKeySelector}
                                    rendererClassName={styles.item}
                                    groupKeySelector={ConditionsEditModal.groupKeySelector}
                                    groupRendererParams={ConditionsEditModal.groupRendererParams}
                                    groupRendererClassName={styles.group}
                                    groupComparator={ConditionsEditModal.groupComparator}
                                />
                            </div>
                        </FaramList>
                        <div className={styles.rightContainer}>
                            <header className={styles.header}>
                                <div className={styles.heading}>
                                    {conditionsTitle}
                                </div>
                                <SegmentInput
                                    faramElementName="operator"
                                    name="operator"
                                    label={operatorSelectLabel}
                                    options={operatorOptions}
                                    keySelector={ConditionsEditModal.operatorKeySelector}
                                    labelSelector={ConditionsEditModal.operatorLabelSelector}
                                    showHintAndError={false}
                                />
                            </header>
                            <FaramList
                                keySelector={ConditionsEditModal.widgetKeySelector}
                                faramElementName="list"
                            >
                                <SortableListView
                                    className={styles.editList}
                                    dragHandleClassName={styles.dragHandle}
                                    faramElement
                                    rendererParams={this.itemRendererParams}
                                    itemClassName={styles.sortableUnit}
                                    renderer={InputRow}
                                />
                            </FaramList>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <DangerConfirmButton
                            onClick={onClose}
                            confirmationMessage={cancelConfirmMessage}
                            skipConfirmation={pristine}
                        >
                            {cancelLabel}
                        </DangerConfirmButton>
                        <PrimaryButton
                            type="submit"
                            disabled={pristine || hasError}
                        >
                            {saveLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}

export default connect(mapStateToProps)(ConditionsEditModal);
