import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { compareString, compareNumber } from '#rsu/common';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TabularSelectInput from '#rsci/TabularSelectInput';
import Faram, {
    requiredCondition,
} from '#rscg/Faram';

import {
    projectDetailsSelector,
    projectOptionsSelector,

    setProjectAction,
} from '#redux';
import _ts from '#ts';

import ProjectPatchRequest from './requests/ProjectPatchRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onModalClose: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number,
    setProject: PropTypes.func.isRequired,
    onRegionsAdd: PropTypes.func,
};

const defaultProps = {
    className: '',
    projectId: undefined,
    onRegionsAdd: undefined,
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    projectOptions: projectOptionsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setProject: params => dispatch(setProjectAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
export default class AddExistingRegion extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    constructor(props) {
        super(props);

        const {
            projectDetails,
            projectOptions,
        } = props;

        const faramValues = {
            regions: [],
        };

        this.state = {
            faramErrors: {},
            faramValues,

            pending: false,
            pristine: false,
            regionOptions: projectOptions.regions || emptyList,
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

        this.projectPatchRequest = new ProjectPatchRequest({
            setState: v => this.setState(v),
            setProject: this.props.setProject,
            onModalClose: this.props.onModalClose,
            onRegionsAdd: this.props.onRegionsAdd,
        });
    }

    componentWillUnmount() {
        this.projectPatchRequest.stop();
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
            projectId,
            projectDetails,
        } = this.props;

        const regionsFromValues = values.regions.map(region => ({ id: region.key }));

        const regions = [...new Set([...projectDetails.regions, ...regionsFromValues])];
        const regionsKeys = values.regions.map(r => r.key);

        const newProjectDetails = {
            ...values,
            regions,
        };

        this.projectPatchRequest.init(
            newProjectDetails,
            projectId,
            regionsKeys,
        ).start();
    };

    render() {
        const {
            faramErrors,
            faramValues,

            pending,
            pristine,
            regionOptions,
            regionsBlackList,
        } = this.state;

        const { className } = this.props;

        return (
            <Faram
                className={`${className} ${styles.addRegionForm}`}
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
