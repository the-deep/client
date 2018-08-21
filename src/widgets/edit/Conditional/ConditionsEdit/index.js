import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Faram from '#rsci/Faram';
import FaramList from '#rsci/Faram/FaramList';
import SortableListView from '#rscv/SortableListView';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ListView from '#rscv/List/ListView';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import { randomString } from '#rsu/common';

import {
    afIdFromRoute,

    afViewAnalysisFrameworkSelector,
} from '#redux';
import { conditions as conditionsAttributes } from '#widgets/conditionalWidget';

import _ts from '#ts';

import WidgetPreview from '../WidgetPreview';
import InputRow from './InputRow';
import styles from './styles.scss';

const propTypes = {
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

@connect(mapStateToProps)
export default class ConditionsEditModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static itemKeyExtractor = widget => widget.key;

    static schema = {
        fields: {
            list: {
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

    static keyExtractor = widget => widget.key;

    constructor(props) {
        super(props);
        const { conditions } = this.props;

        this.state = {
            faramValues: conditions,
            faramErrors: {},
            pristine: false,
        };
    }

    widgetListRendererParams = (key, widget) => {
        const {
            widgetId,
            key: widgetKey,
            title,
        } = widget;

        return ({
            title,
            faramInfoForAdd: {
                newElement: () => ({
                    key: `condition-${randomString(16).toLowerCase()}`,
                    widgetId,
                    widgetKey,
                }),
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

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: false,
        });
    };

    handleFaramValidationSuccess = (_, faramValues) => {
        this.props.onSave(faramValues);
    };

    render() {
        const {
            analysisFramework: { widgets = [] },
            onClose,
        } = this.props;
        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.state;

        const widgetsTitle = _ts('widgets.editor.conditional', 'widgetsTitle');
        const conditionsTitle = _ts('widgets.editor.conditional', 'conditionsTitle');
        const editConditionsTitle = _ts('widgets.editor.conditional', 'conditionsTitle');
        const cancelLabel = _ts('widgets.editor.conditional', 'cancelButtonLabel');
        const saveLabel = _ts('widgets.editor.conditional', 'saveButtonLabel');

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
                        <FaramList faramElementName="list">
                            <div className={styles.leftContainer}>
                                <header className={styles.header}>
                                    {widgetsTitle}
                                </header>
                                <ListView
                                    className={styles.widgetList}
                                    data={widgets}
                                    renderer={WidgetPreview}
                                    keyExtractor={ConditionsEditModal.keyExtractor}
                                    rendererParams={this.widgetListRendererParams}
                                />
                            </div>
                            <div className={styles.rightContainer}>
                                <header className={styles.header}>
                                    {conditionsTitle}
                                </header>
                                <SortableListView
                                    className={styles.editList}
                                    dragHandleClassName={styles.dragHandle}
                                    faramElement
                                    keyExtractor={ConditionsEditModal.itemKeyExtractor}
                                    rendererParams={this.itemRendererParams}
                                    itemClassName={styles.sortableUnit}
                                    renderer={InputRow}
                                />
                            </div>
                        </FaramList>
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={onClose}>
                            {cancelLabel}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!pristine}
                        >
                            {saveLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
