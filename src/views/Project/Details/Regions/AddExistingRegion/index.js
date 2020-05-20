import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Faram, {
    requiredCondition,
} from '@togglecorp/faram';
import {
    _cs,
    compareString,
    compareNumber,
} from '@togglecorp/fujs';
import notify from '#notify';

import {
    RequestClient,
    methods,
    notifyOnFailure,
} from '#request';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TabularSelectInput from '#rsci/TabularSelectInput';

import {
    projectDetailsSelector,
    setProjectAction,
} from '#redux';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onModalClose: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/no-unused-prop-types
    projectId: PropTypes.number,
    // eslint-disable-next-line react/no-unused-prop-types
    setProject: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    onRegionsAdd: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    requests: PropTypes.object.isRequired,
};

const defaultProps = {
    className: '',
    projectId: undefined,
    onRegionsAdd: undefined,
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setProject: params => dispatch(setProjectAction(params)),
});

const requestOptions = {
    projectOptionsGet: {
        url: '/project-options/',
        method: methods.GET,
        onMount: true,
        query: ({ props: { projectId } }) => ({
            project: projectId,
            fields: ['regions', 'status', 'involvement'],
        }),
        onPropsChanged: ['projectId'],
        onFailure: notifyOnFailure(_ts('project', 'projectOptions')),
        onFatal: () => {
            notify.send({
                title: _ts('project', 'projectOptions'),
                type: notify.type.ERROR,
                message: _ts('project', 'projectOptionsGetFailure'),
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'projectOptionsGetResponse',
        },
    },
    projectPatchRequest: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/`,
        method: methods.PATCH,
        body: ({ params: { body } }) => body,
        onSuccess: ({
            response,
            props: {
                setProject,
                onRegionsAdd,
                onModalClose,
            },
            params: { addedRegions },
        }) => {
            if (setProject) {
                setProject({ project: response });
            }
            if (onRegionsAdd) {
                onRegionsAdd(addedRegions);
            }
            notify.send({
                title: _ts('project', 'countryCreate'),
                type: notify.type.SUCCESS,
                message: _ts('project', 'countryCreateSuccess'),
                duration: notify.duration.MEDIUM,
            });
            if (onModalClose) {
                onModalClose();
            }
        },
        onFailure: ({
            faramErrors,
            params: { setFaramErrors },
        }) => {
            notify.send({
                title: _ts('project', 'countryCreate'),
                type: notify.type.ERROR,
                message: _ts('project', 'countryCreateFailure'),
                duration: notify.duration.MEDIUM,
            });
            if (setFaramErrors) {
                setFaramErrors(faramErrors);
            }
        },
        onFatal: ({ params: { setFaramErrors } }) => {
            notify.send({
                title: _ts('project', 'countryCreate'),
                type: notify.type.ERROR,
                message: _ts('project', 'countryCreateFatal'),
                duration: notify.duration.MEDIUM,
            });
            if (setFaramErrors) {
                setFaramErrors({ $internal: [_ts('project', 'projectSaveFailure')] });
            }
        },
    },
};

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requestOptions)
export default class AddExistingRegion extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    constructor(props) {
        super(props);

        const {
            projectDetails,
            requests: {
                projectPatchRequest,
            },
        } = props;
        projectPatchRequest.setDefaultParams({ setFaramErrors: this.handleValidationFailure });

        const faramValues = {
            regions: [],
        };

        this.state = {
            faramErrors: {},
            faramValues,
            pristine: false,
            regionsBlackList: (projectDetails.regions || []).map(region => region.id),
        };

        this.regionsHeader = [
            {
                key: 'value',
                label: _ts('project', 'tableHeaderName'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.value, b.value),
            },
            {
                key: 'key',
                label: _ts('project', 'tableHeaderId'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareNumber(a.key, b.key),
            },
        ];

        this.schema = {
            fields: {
                regions: [requiredCondition],
            },
        };
    }

    // faram RELATED
    handleFaramChange = (values, faramErrors) => {
        this.setState({
            faramValues: values,
            faramErrors,
            pristine: true,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleValidationSuccess = (values) => {
        const {
            projectDetails,
            requests: { projectPatchRequest },
        } = this.props;

        const regionsFromValues = values.regions.map(region => ({ id: region.key }));

        const regions = [...new Set([...projectDetails.regions, ...regionsFromValues])];
        const regionsKeys = values.regions.map(r => r.key);

        const newProjectDetails = {
            ...values,
            regions,
        };
        projectPatchRequest.do({
            body: newProjectDetails,
            addedRegions: regionsKeys,
        });
    };

    render() {
        const {
            faramErrors,
            faramValues,

            pristine,
            regionsBlackList,
        } = this.state;

        const {
            className,
            requests: {
                projectPatchRequest: {
                    pending: projectPatchPending,
                },
                projectOptionsGet: {
                    response,
                    pending: projectOptionsPending,
                },
            },
        } = this.props;

        const regionOptions = (response && response.regions) || emptyList;

        const pending = projectOptionsPending || projectPatchPending;

        return (
            <Faram
                className={_cs(className, styles.addRegionForm)}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={this.schema}
                value={faramValues}
                faramErrors={faramErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <TabularSelectInput
                    faramElementName="regions"
                    className={styles.tabularSelect}
                    blackList={regionsBlackList}
                    options={regionOptions}
                    labelSelector={AddExistingRegion.optionLabelSelector}
                    keySelector={AddExistingRegion.optionKeySelector}
                    tableHeaders={this.regionsHeader}
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.props.onModalClose}>
                        {_ts('project', 'modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        disabled={pending || !pristine}
                        type="submit"
                    >
                        {_ts('project', 'modalUpdate')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
