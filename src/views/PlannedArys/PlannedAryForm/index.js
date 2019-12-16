import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { connect } from 'react-redux';
import {
    isDefined,
} from '@togglecorp/fujs';
import Faram, {
    FaramGroup,
    requiredCondition,
} from '@togglecorp/faram';

import {
    RequestClient,
    methods,
} from '#request';
import TextInput from '#rsci/TextInput';
import NonFieldErrors from '#rsci/NonFieldErrors';
import MultiSelectInput from '#rsci/MultiSelectInput';
import Modal from '#rscv/Modal';
import List from '#rscv/List';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import OrganigramInput from '#components/input/OrganigramInput/';
import GeoInput from '#components/input/GeoInput/';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import {
    projectDetailsSelector,
} from '#redux';

import {
    isStakeholderColumn,
} from '#entities/editAry';

import _ts from '#ts';
import notify from '#notify';

import Group from './Group';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    editMode: PropTypes.bool,
    closeModal: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    onActionSuccess: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    plannedAryData: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    requests: PropTypes.object.isRequired,
    projectId: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    projectDetails: PropTypes.object,
};

const defaultProps = {
    editMode: false,
    className: undefined,
    plannedAryData: undefined,
    projectId: undefined,
    projectDetails: {},
};

const mapStateToProps = state => ({
    projectDetails: projectDetailsSelector(state),
});

const requestOptions = {
    plannedAryRequest: {
        url: ({ props: {
            editMode,
            plannedAryData: { id } = {},
        } }) => (editMode
            ? `/planned-assessments/${id}/`
            : '/planned-assessments/'
        ),
        method: ({ props: { editMode } }) => (
            editMode ? methods.PATCH : methods.POST
        ),
        body: ({ params: { body } }) => body,
        onMount: false,
        onSuccess: ({
            response,
            props: {
                onActionSuccess,
                closeModal,
            },
        }) => {
            onActionSuccess(response);
            closeModal();
        },
        onFailure: ({ error: { messageForNotification } }) => {
            notify.send({
                title: _ts('assessments.planned', 'plannedAssessmentsNotifyTitle'),
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'plannedAry',
        },
    },
    assessmentTemplateRequest: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/assessment-template/`,
        extras: {
            schemaName: 'aryTemplateGetResponse',
        },
        onMount: ({ props: { projectId } }) => !!projectId,
        onPropsChanged: ['projectId'],
    },
    geoOptionsRequest: {
        extras: {
            schemaName: 'geoOptions',
        },
        url: '/geo-options/',
        query: ({ props: { projectId } }) => ({ project: projectId }),
        onMount: ({ props: { projectId } }) => !!projectId,
        onPropsChanged: ['projectId'],
    },
};

const idSelector = d => String(d.id);
const titleSelector = d => d.title;

const orgIdSelector = organ => organ.id;
const orgLabelSelector = organ => organ.title;
const orgChildSelector = organ => organ.children;

const groupKeySelector = data => data.id;

const getPlannedAryGroupFields = (groups) => {
    if (!groups) {
        return [];
    }
    const plannedGroups = groups.map((group) => {
        const newFields = group.fields.filter(
            groupFields => groupFields.showInPlannedAssessment,
        );
        if (newFields.length === 0) {
            return undefined;
        }
        return {
            ...group,
            fields: newFields,
        };
    }).filter(mg => isDefined(mg));
    return plannedGroups;
};

@RequestClient(requestOptions)
@connect(mapStateToProps)
export default class PlannedAryForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            plannedAryData,
            editMode,
        } = this.props;

        this.state = {
            faramValues: editMode ? plannedAryData : {},
            faramErrors: {},
            pristine: true,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
            },
        };
    }

    getPlannedAryMetadataGroups = memoize(getPlannedAryGroupFields);

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    }

    handleFaramValidationSuccess = (faramValues) => {
        const {
            requests: {
                plannedAryRequest,
            },
            projectId,
        } = this.props;

        const body = {
            ...faramValues,
            project: projectId,
        };

        plannedAryRequest.do({ body });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    groupRendererParams = (key, data) => {
        const {
            requests: {
                assessmentTemplateRequest: {
                    response: {
                        sources,
                    } = {},
                },
            },
        } = this.props;

        const {
            title,
            fields,
        } = data;

        return {
            title,
            fields,
            sources,
            isStakeholder: isStakeholderColumn(data),
        };
    }

    render() {
        const {
            className,
            editMode,
            closeModal,
            requests: {
                plannedAryRequest: { pending: plannedAryPending },
                assessmentTemplateRequest: {
                    response: {
                        affectedGroups,
                        sectors,
                        metadataGroups,
                    } = {},
                    pending: assessmentTemplatePending,
                },
                geoOptionsRequest: {
                    response: geoOptions = {},
                    pending: pendingGeoOptions,
                },
            },
            projectDetails: { regions },
        } = this.props;

        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.state;

        const modalTitle = editMode
            ? _ts('assessments.planned.editForm', 'editPlannedAryModalTitle')
            : _ts('assessments.planned.editForm', 'addPlannedAryModalTitle');

        const showLoading = plannedAryPending
            || assessmentTemplatePending
            || pendingGeoOptions;

        const plannedMetadataGroups = this.getPlannedAryMetadataGroups(metadataGroups);

        return (
            <Modal className={className}>
                <ModalHeader title={modalTitle} />
                <Faram
                    value={faramValues}
                    error={faramErrors}
                    onChange={this.handleFaramChange}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    onValidationFailure={this.handleFaramValidationFailure}
                    schema={this.schema}
                    disabled={showLoading}
                >
                    <ModalBody className={styles.modalBody}>
                        {showLoading && <LoadingAnimation />}
                        <div className={styles.content}>
                            <NonFieldErrors faramElement />
                            <TextInput
                                faramElementName="title"
                                label={_ts('assessments.planned.editForm', 'plannedAryTitleInputLabel')}
                                placeholder={_ts('assessments.planned.editForm', 'plannedAryTitleInputPlacehoder')}
                            />
                            <FaramGroup faramElementName="metadata">
                                <FaramGroup faramElementName="basicInformation">
                                    <List
                                        data={plannedMetadataGroups}
                                        keySelector={groupKeySelector}
                                        renderer={Group}
                                        rendererParams={this.groupRendererParams}
                                    />
                                </FaramGroup>
                            </FaramGroup>
                            <FaramGroup faramElementName="methodology">
                                <MultiSelectInput
                                    faramElementName="sectors"
                                    options={sectors}
                                    keySelector={idSelector}
                                    labelSelector={titleSelector}
                                    label={_ts('assessments.planned.editForm', 'plannedArySectorsLabel')}
                                    placeholder={_ts('assessments.planned.editForm', 'plannedArySectorsPlaceholder')}
                                />
                                <OrganigramInput
                                    faramElementName="affectedGroups"
                                    data={affectedGroups}
                                    label={_ts('assessments.planned.editForm', 'plannedAryAffectedGroupsLabel')}
                                    childSelector={orgChildSelector}
                                    labelSelector={orgLabelSelector}
                                    idSelector={orgIdSelector}
                                    hideList
                                />
                                <GeoInput
                                    faramElementName="locations"
                                    label={_ts('assessments.planned.editForm', 'plannedAryLocationsLabel')}
                                    geoOptionsByRegion={geoOptions}
                                    regions={regions}
                                    hideList
                                />
                            </FaramGroup>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={closeModal} >
                            {_ts('assessments.planned.editForm', 'cancelButtonTitle')}
                        </DangerButton>
                        <PrimaryButton
                            disabled={pristine}
                            pending={plannedAryPending}
                            type="submit"
                        >
                            {_ts('assessments.planned.editForm', 'saveButtonTitle')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
