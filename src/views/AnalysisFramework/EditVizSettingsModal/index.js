import React from 'react';
import memoize from 'memoize-one';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Faram, { requiredCondition } from '@togglecorp/faram';
import {
    _cs,
    mapToMap,
    listToGroupList,
    listToMap,
} from '@togglecorp/fujs';

import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import ModalFooter from '#rscv/Modal/Footer';
import NonFieldErrors from '#rsci/NonFieldErrors';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import SelectInput from '#rsci/SelectInput';
import MultiSelectInput from '#rsci/MultiSelectInput';

import {
    afViewAnalysisFrameworkWidgetsSelector,
    afViewAnalysisFrameworkStatsConfigSelector,
    setAfViewStatsConfigAction,
} from '#redux';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,

    className: PropTypes.string,

    closeModal: PropTypes.func,

    // eslint-disable-next-line react/forbid-prop-types
    widgets: PropTypes.array,

    // eslint-disable-next-line react/forbid-prop-types
    statsConfig: PropTypes.object.isRequired,

    setAfViewStatsConfig: PropTypes.func.isRequired,
};
const defaultProps = {
    className: '',
    closeModal: undefined,
    widgets: undefined,
    statsConfig: undefined,
};

const keySelector = d => d.id;
const labelSelector = d => d.title;

const mapStateToProps = state => ({
    widgets: afViewAnalysisFrameworkWidgetsSelector(state),
    statsConfig: afViewAnalysisFrameworkStatsConfigSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAfViewStatsConfig: params => dispatch(setAfViewStatsConfigAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class EditVizSettingsModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        fields: {
            widget1d: [requiredCondition],
            widget2d: [requiredCondition],
            geoWidget: [requiredCondition],
            severityWidget: [],
            reliabilityWidget: [],
            affectedGroupsWidget: [requiredCondition],
            specificNeedsGroupsWidget: [],
        },
    };

    constructor(props) {
        super(props);

        const { statsConfig } = this.props;

        const faramValues = mapToMap(
            statsConfig,
            key => key,
            v => (v.isConditionalWidget ? v.widgetKey : v.pk),
        );

        this.state = {
            faramErrors: {},
            faramValues,
            pristine: true,
        };
    }

    getWidgets = memoize((widgets = []) => {
        // Only work for widgets with id (widgets that are saved in server)
        const widgetsWithId = widgets.filter(widget => widget.id);

        const conditionalWidgets = widgetsWithId
            .filter(widget => widget.widgetId === 'conditionalWidget')
            .map((conditional) => {
                const {
                    title,
                    id,
                    properties: {
                        data: {
                            widgets: widgetsInsideConditional = [],
                        } = {},
                    } = {},
                } = conditional;

                return widgetsInsideConditional.map(({ widget }) => (
                    {
                        ...widget,

                        // doesn't matter if id is number or string (only needs to be unique)
                        id: widget.key,
                        title: `${title} › ${widget.title}`,
                        conditionalId: id,
                        isConditional: true,
                    }
                ));
            })
            .flat();

        return [...widgetsWithId, ...conditionalWidgets];
    })

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = (values) => {
        const { widgets } = this.props;

        const allWidgets = this.getWidgets(widgets);

        const mapping = listToMap(
            allWidgets,
            widget => widget.id,
            widget => widget,
        );

        const transformedValues = mapToMap(
            values,
            k => k,
            (d) => {
                const widget = mapping[d];
                if (!widget) {
                    return undefined;
                }

                if (!widget.isConditional) {
                    return { pk: d };
                }

                const {
                    conditionalId,
                    widgetId,
                    key: widgetKey,
                } = widget;

                return ({
                    pk: conditionalId,
                    widgetKey,
                    widgetType: widgetId,
                    isConditionalWidget: true,
                });
            },
        );

        const {
            analysisFrameworkId,
            setAfViewStatsConfig,
            closeModal,
        } = this.props;

        setAfViewStatsConfig({ analysisFrameworkId, statsConfig: transformedValues });

        if (closeModal) {
            closeModal();
        }
    };

    groupWidgets = memoize((widgets = []) => {
        const allWidgets = this.getWidgets(widgets);

        return listToGroupList(
            allWidgets,
            widget => widget.widgetId,
        );
    });

    render() {
        const {
            closeModal,
            className,
            widgets,
        } = this.props;

        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.state;

        const groupedWidgets = this.groupWidgets(widgets);

        return (
            <Modal
                className={_cs(className, styles.modal)}
                onClose={closeModal}
                closeOnEscape
            >
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    onValidationFailure={this.handleFaramValidationFailure}
                    schema={EditVizSettingsModal.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={_ts('framework.editVizSettings', 'editVizSettingsModalTitle')} />
                    <ModalBody>
                        <NonFieldErrors faramElement />
                        <MultiSelectInput
                            className={styles.input}
                            faramElementName="widget1d"
                            label={_ts('framework.editVizSettings', 'widget1dLabel')}
                            options={groupedWidgets.matrix1dWidget}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                        <MultiSelectInput
                            className={styles.input}
                            faramElementName="widget2d"
                            label={_ts('framework.editVizSettings', 'widget2dLabel')}
                            options={groupedWidgets.matrix2dWidget}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                        <SelectInput
                            className={styles.input}
                            faramElementName="geoWidget"
                            label={_ts('framework.editVizSettings', 'geoWidgetLabel')}
                            options={groupedWidgets.geoWidget}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                        <SelectInput
                            className={styles.input}
                            faramElementName="severityWidget"
                            label={_ts('framework.editVizSettings', 'severityWidgetLabel')}
                            options={groupedWidgets.scaleWidget}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                        <SelectInput
                            className={styles.input}
                            faramElementName="reliabilityWidget"
                            label={_ts('framework.editVizSettings', 'reliabilityWidgetLabel')}
                            options={groupedWidgets.scaleWidget}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                        <SelectInput
                            className={styles.input}
                            faramElementName="affectedGroupsWidget"
                            label={_ts('framework.editVizSettings', 'affectedGroupsWidgetLabel')}
                            options={groupedWidgets.organigramWidget}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                        <SelectInput
                            className={styles.input}
                            faramElementName="specificNeedsGroupsWidget"
                            label={_ts('framework.editVizSettings', 'specificNeedsWidgetLabel')}
                            options={groupedWidgets.multiselectWidget}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={closeModal}>
                            {_ts('framework.editVizSettings', 'closeModalLabel')}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={pristine}
                        >
                            {_ts('framework.editVizSettings', 'saveModalLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
