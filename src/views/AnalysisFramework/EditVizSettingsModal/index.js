import React from 'react';
import memoize from 'memoize-one';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Faram, { requiredCondition } from '@togglecorp/faram';
import {
    listToGroupList,
} from '@togglecorp/fujs';

import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import ModalFooter from '#rscv/Modal/Footer';
import NonFieldErrors from '#rsci/NonFieldErrors';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import SelectInput from '#rsci/SelectInput';

import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';

import {
    afViewWidgetsForVizSelector,
    setAfViewPropertiesAction,
} from '#redux';
import { getAllWidgets } from '#entities/analysisFramework';
import notify from '#notify';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    widgets: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    selectedWidgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/no-unused-prop-types
    setAfViewProperties: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    editFrameworkSettingsRequest: PropTypes.object,
    // eslint-disable-next-line react/no-unused-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,
    closeModal: PropTypes.func,
};
const defaultProps = {
    closeModal: () => {},
    editFrameworkSettingsRequest: {},
    selectedWidgets: [],
    className: '',
};

const keySelector = d => d.id;
const labelSelector = d => d.title;

const requests = {
    editFrameworkSettingsRequest: {
        url: ({ props: { analysisFrameworkId } }) => `/analysis-frameworks/${analysisFrameworkId}/`,
        body: ({ params: { body } }) => body,
        method: requestMethods.PATCH,
        onSuccess: ({
            props: {
                closeModal,
                analysisFrameworkId,
                setAfViewProperties,
            },
            response: { properties },
        }) => {
            setAfViewProperties({ analysisFrameworkId, properties });
            closeModal();
        },
        onFailure: ({
            error: { faramErrors },
            params: { handleFailure },
        }) => {
            handleFailure(faramErrors);
        },
        onFatal: () => {
            notify.send({
                title: _ts('project.framework.edit', 'afPatch'),
                type: notify.type.ERROR,
                message: _ts('project.framework.edit', 'afPatchFatal'),
                duration: notify.duration.SLOW,
            });
        },
    },
};

const mapStateToProps = state => ({
    selectedWidgets: afViewWidgetsForVizSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAfViewProperties: params => dispatch(setAfViewPropertiesAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requests)
export default class EditVizSettingsModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        fields: {
            widget1d: [requiredCondition],
            widget2d: [requiredCondition],
            geoWidget: [requiredCondition],
            severityWidget: [requiredCondition],
            reliabilityWidget: [requiredCondition],
            affectedGroupsWidget: [requiredCondition],
            specificNeedsGroupsWidget: [requiredCondition],
        },
    };

    constructor(props) {
        super(props);

        const { selectedWidgets } = this.props;

        this.state = {
            faramErrors: {},
            faramValues: selectedWidgets,
            pristine: true,
        };
    }

    getWidgets = memoize(getAllWidgets);

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
        const {
            widgets,
            editFrameworkSettingsRequest,
        } = this.props;

        const allWidgets = this.getWidgets(widgets);

        const transformedValues = Object.entries(values).map(([key, value]) => {
            const widget = allWidgets.find(w => w.id === value);
            if (widget.isConditional) {
                const {
                    conditionalId,
                    widgetIndex,
                    widgetId,
                    key: widgetKey,
                } = widget;

                return ({
                    [key]: {
                        pk: conditionalId,
                        selectors: [
                            'widgets',
                            widgetIndex,
                            'widget',
                        ],
                        widgetKey,
                        widgetType: widgetId,
                        isConditionalWidget: true,
                    },
                });
            }

            return ({ [key]: { pk: value } });
        });

        const properties = {
            statsConfig: {
                ...Object.assign({}, ...transformedValues),
            },
        };

        editFrameworkSettingsRequest.do({
            body: { properties },
            handleFailure: this.handleFaramValidationFailure,
        });
    };

    groupWidgets = memoize((widgets) => {
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
            editFrameworkSettingsRequest: {
                pending,
            },
        } = this.props;

        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.state;

        const groupedWidgets = this.groupWidgets(widgets);

        return (
            <Modal
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
                    <ModalHeader title="Edit Visualization Settings" />
                    <ModalBody>
                        <NonFieldErrors faramElement />
                        <SelectInput
                            faramElementName="widget1d"
                            label="Widget 1D"
                            options={groupedWidgets.matrix1dWidget}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                        <SelectInput
                            faramElementName="widget2d"
                            label="Widget 2D"
                            options={groupedWidgets.matrix2dWidget}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                        <SelectInput
                            faramElementName="geoWidget"
                            label="Geo Widget"
                            options={groupedWidgets.geoWidget}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                        <SelectInput
                            faramElementName="severityWidget"
                            label="Severity Widget"
                            options={groupedWidgets.scaleWidget}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                        <SelectInput
                            faramElementName="reliabilityWidget"
                            label="Reliability Widget"
                            options={groupedWidgets.scaleWidget}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                        <SelectInput
                            faramElementName="affectedGroupsWidget"
                            label="Affected Groups Widget"
                            options={groupedWidgets.multiselectWidget}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                        <SelectInput
                            faramElementName="specificNeedsGroupsWidget"
                            label="Specific Needs Groups Widget"
                            options={groupedWidgets.multiselectWidget}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={closeModal}>
                            Close
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={pristine}
                            pending={pending}
                        >
                            Submit
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
