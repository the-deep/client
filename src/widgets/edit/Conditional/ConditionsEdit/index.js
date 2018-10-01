import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import Faram from '#rscg/Faram';
import FaramList from '#rscg/FaramList';
import SortableListView from '#rscv/SortableListView';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import SegmentInput from '#rsci/SegmentInput';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ListView from '#rscv/List/ListView';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import { randomString } from '#rsu/common';
import { iconNames } from '#constants';

import {
    afIdFromRoute,

    afViewAnalysisFrameworkSelector,
} from '#redux';
import {
    conditions as conditionsAttributes,
    compatibleWidgetIds,
} from '#widgets/conditionalWidget';

import _ts from '#ts';

import WidgetPreview from '../WidgetPreview';
import InputRow from './InputRow';
import styles from './styles.scss';

const propTypes = {
    widgetTitle: PropTypes.string.isRequired,
    conditions: PropTypes.shape({
        list: PropTypes.array,
        operator: PropTypes.oneOf(['AND', 'OR']),
    }).isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,

    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    analysisFramework: undefined,
};

const mapStateToProps = (state, props) => ({
    analysisFramework: afViewAnalysisFrameworkSelector(state, props),
    analysisFrameworkId: afIdFromRoute(state, props),
});

const operatorOptions = [
    { key: 'AND', label: 'AND' },
    { key: 'OR', label: 'OR' },
];

// @connect(mapStateToProps)
class ConditionsEditModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static widgetKeySelector = widget => widget.key;

    static operatorKeySelector = o => o.key;
    static operatorLabelSelector = o => o.label;

    static schema = {
        fields: {
            list: {
                keySelector: ConditionsEditModal.widgetKeySelector,
                member: {
                    fields: {
                        key: [],
                        widgetId: [],
                        widgetKey: [],
                        conditionType: [],
                        attributes: [],
                    },
                },
            },
            operator: [],
        },
    };

    constructor(props) {
        super(props);
        const { conditions } = this.props;

        this.state = {
            faramValues: conditions,
            faramErrors: {},
            pristine: true,
        };
    }

    getCompatibleWidget = memoize(widgets => (
        widgets.filter(w => compatibleWidgetIds.indexOf(w.widgetId) >= 0)
    ));

    widgetListRendererParams = (key, widget) => {
        const { title } = widget;

        return ({
            title,
            widget,
            widgetKey: key,
            createNewElement: widgetData => ({
                key: `condition-${randomString(16).toLowerCase()}`,
                widgetId: widgetData.widgetId,
                widgetKey: widgetData.key,
            }),
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

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: true,
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
        } = this.state;

        const widgetsTitle = _ts('widgets.editor.conditional', 'widgetsTitle');
        const conditionsTitle = _ts('widgets.editor.conditional', 'conditionsTitle');
        const editConditionsTitle = _ts('widgets.editor.conditional', 'widgetConditionsTitle', { widgetTitle });
        const cancelLabel = _ts('widgets.editor.conditional', 'cancelButtonLabel');
        const saveLabel = _ts('widgets.editor.conditional', 'saveButtonLabel');
        const operatorSelectLabel = _ts('widgets.editor.conditional', 'operatorSelectLabel');

        const widgetsHeaderInfo = _ts('widgets.editor.conditional', 'frameworkWidgetsInfoText');

        const compatibleWidgets = this.getCompatibleWidget(widgets);

        return (
            <Modal className={styles.conditionEditModal} >
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={ConditionsEditModal.schema}
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
                                    <span
                                        className={`${iconNames.info} ${styles.headerInfo}`}
                                        title={widgetsHeaderInfo}
                                    />
                                </header>
                                <ListView
                                    className={styles.widgetList}
                                    data={compatibleWidgets}
                                    renderer={WidgetPreview}
                                    rendererParams={this.widgetListRendererParams}
                                    keyExtractor={ConditionsEditModal.widgetKeySelector}
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
                        <DangerButton onClick={onClose}>
                            {cancelLabel}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={pristine}
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
