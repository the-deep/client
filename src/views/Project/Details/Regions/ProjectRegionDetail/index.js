import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import PrimaryConfirmButton from '#rsca/ConfirmButton/PrimaryConfirmButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import WarningButton from '#rsca/Button/WarningButton';
import Faram, {
    requiredCondition,
} from '#rscg/Faram';
import LoadingAnimation from '#rscv/LoadingAnimation';

import RegionAdminLevel from '#components/RegionAdminLevel';
import RegionDetail from '#components/RegionDetail';
import RegionDetailView from '#components/RegionDetailView';
import RegionMap from '#components/RegionMap';
import {
    activeProjectIdFromStateSelector,
    addNewRegionAction,
    changeRegionDetailsAction,
    projectDetailsSelector,
    regionDetailSelector,
    removeProjectRegionAction,
    setRegionDetailsAction,
    setRegionDetailsErrorsAction,
} from '#redux';
import _ts from '#ts';

import ProjectPatchRequest from '../../../requests/ProjectPatchRequest';
import RegionCloneRequest from '../../../requests/RegionCloneRequest';
import RegionDetailPatchRequest from '../../../requests/RegionDetailPatchRequest';
import RegionGetRequest from '../../../requests/RegionGetRequest';

import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    countryId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    regionDetail: PropTypes.shape({
        id: PropTypes.number,
        faramValues: PropTypes.object,
        faramErrors: PropTypes.object,
        pristine: PropTypes.bool,
    }),
    addNewRegion: PropTypes.func.isRequired,
    setRegionDetails: PropTypes.func.isRequired,
    changeRegionDetails: PropTypes.func.isRequired,
    setRegionDetailsErrors: PropTypes.func.isRequired,
    removeProjectRegion: PropTypes.func.isRequired,
    onRegionClone: PropTypes.func,
    disabled: PropTypes.bool.isRequired,
};

const defaultProps = {
    activeProject: undefined,
    onRegionClone: undefined,
    regionDetail: {
        faramValues: {},
        faramErrors: {},
        pristine: false,
    },
    disabled: false,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectIdFromStateSelector(state),
    projectDetails: projectDetailsSelector(state, props),
    regionDetail: regionDetailSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    addNewRegion: params => dispatch(addNewRegionAction(params)),
    setRegionDetails: params => dispatch(setRegionDetailsAction(params)),
    changeRegionDetails: params => dispatch(changeRegionDetailsAction(params)),
    setRegionDetailsErrors: params => dispatch(setRegionDetailsErrorsAction(params)),
    removeProjectRegion: params => dispatch(removeProjectRegionAction(params)),
    dispatch,
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectRegionDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            dataLoading: true,
            projectPatchPending: false,
            regionClonePending: false,
            regionDetailPatchPending: false,
        };

        this.schema = {
            fields: {
                code: [requiredCondition],
                title: [requiredCondition],
                regionalGroups: {
                    fields: {
                        wbRegion: [],
                        wbIncomeRegion: [],
                        ochaRegion: [],
                        echoRegion: [],
                        unGeoRegion: [],
                        unGeoSubregion: [],
                    },
                },
            },
        };

        // Requests
        this.requestForRegion = new RegionGetRequest({
            setState: v => this.setState(v),
            regionDetail: this.props.regionDetail || {},
            setRegionDetails: this.props.setRegionDetails,
        });
        this.requestForRegionClone = new RegionCloneRequest({
            setState: v => this.setState(v),
            onRegionClone: this.props.onRegionClone,
            addNewRegion: this.props.addNewRegion,
            removeProjectRegion: this.props.removeProjectRegion,
        });
        this.regionDetailPatchRequest = new RegionDetailPatchRequest({
            setState: v => this.setState(v),
            setRegionDetails: this.props.setRegionDetails,
            setRegionDetailsErrors: this.props.setRegionDetailsErrors,
        });
        this.projectPatchRequest = new ProjectPatchRequest({
            setState: v => this.setState(v),
            removeProjectRegion: this.props.removeProjectRegion,
        });
    }

    componentWillMount() {
        this.requestForRegion.init(this.props.countryId, false).start();
    }

    componentWillUnmount() {
        this.projectPatchRequest.stop();
        this.regionDetailPatchRequest.stop();
        this.requestForRegionClone.stop();
        this.requestForRegion.stop();
    }

    handleRegionClone = (regionId, projectId) => {
        this.requestForRegionClone.init(regionId, projectId).start();
    }

    handleRegionRemove = (projectDetails, removedRegionId) => {
        const projectId = projectDetails.id;
        const regions = [...projectDetails.regions];
        const index = regions.findIndex(d => (d.id === removedRegionId));
        regions.splice(index, 1);
        this.projectPatchRequest.init(projectId, removedRegionId, regions).start();
    }

    handleDiscardButtonClick = () => {
        this.requestForRegion.init(this.props.countryId, true).start();
    }

    handleValidationFailure = (faramErrors) => {
        this.props.setRegionDetailsErrors({
            faramErrors,
            regionId: this.props.regionDetail.id,
        });
    };

    handleValidationSuccess = (values) => {
        const { activeProject, regionDetail } = this.props;
        this.regionDetailPatchRequest.init(
            activeProject, regionDetail.id, values,
        ).start();
    };

    handleFaramChange = (faramValues, faramErrors) => {
        this.props.changeRegionDetails({
            faramValues,
            faramErrors,
            regionId: this.props.regionDetail.id,
            projectId: this.props.projectId,
        });
    };

    renderCloneAndEditButton = () => {
        const {
            countryId,
            activeProject,
            disabled,
        } = this.props;
        const { faramValues = {} } = this.props.regionDetail;

        const {
            dataLoading,
            regionClonePending,
        } = this.state;

        const cloneAndEditButtonLabel = _ts('project', 'cloneEditButtonLabel');

        return (
            <PrimaryConfirmButton
                disabled={dataLoading || regionClonePending || disabled}
                onClick={() => this.handleRegionClone(countryId, activeProject)}
                confirmationMessage={_ts('project', 'confirmCloneText', { title: <b>{faramValues.title}</b> })}
            >
                {cloneAndEditButtonLabel}
            </PrimaryConfirmButton>
        );
    }

    renderHeader = () => {
        const {
            regionDetail,
            projectDetails,
            countryId,
            disabled,
        } = this.props;

        const {
            faramValues = {},
            pristine = false,
        } = regionDetail;

        const {
            dataLoading,
            projectPatchPending,
            regionClonePending,
            regionDetailPatchPending,
        } = this.state;

        const pending = dataLoading ||
            regionClonePending ||
            projectPatchPending ||
            regionDetailPatchPending;

        const removeRegionButtonLabel = _ts('project', 'removeRegionButtonLabel');
        const CloneAndEditButton = this.renderCloneAndEditButton;
        const isPublic = regionDetail.public;

        return (
            <header className={styles.header}>
                <h2>
                    {faramValues.title}
                </h2>
                <div className={styles.actionButtons}>
                    { isPublic ? (
                        <CloneAndEditButton />
                    ) : (
                        <Fragment>
                            <WarningButton
                                disabled={!pristine || disabled}
                                onClick={this.handleDiscardButtonClick}
                            >
                                {_ts('project', 'discardButtonLabel')}
                            </WarningButton>
                            <SuccessButton
                                type="submit"
                                disabled={!pristine || disabled}
                            >
                                {_ts('project', 'saveButtonLabel')}
                            </SuccessButton>
                        </Fragment>
                    ) }
                    <DangerConfirmButton
                        disabled={pending || disabled}
                        onClick={() => this.handleRegionRemove(projectDetails, countryId)}
                        confirmationMessage={
                            _ts('project', 'confirmRemoveText', {
                                title: faramValues.title,
                                projectTitle: projectDetails.title,
                            })
                        }
                    >
                        { removeRegionButtonLabel }
                    </DangerConfirmButton>
                </div>
            </header>
        );
    }

    renderContent = () => {
        const {
            countryId,
            activeProject,
            regionDetail,
            disabled,
        } = this.props;
        const { dataLoading } = this.state;

        const isEditable = regionDetail.public !== undefined && !regionDetail.public;

        const classNames = [styles.content];

        if (isEditable) {
            return (
                <div className={classNames.join(' ')}>
                    <div className={styles.top}>
                        <RegionMap
                            className={styles.regionMap}
                            regionId={countryId}
                        />
                        <RegionDetail
                            dataLoading={dataLoading}
                            projectId={activeProject}
                            countryId={countryId}
                            className={styles.regionDetailForm}
                        />
                    </div>
                    <RegionAdminLevel
                        countryId={countryId}
                        disabled={disabled}
                    />
                </div>
            );
        }

        classNames.push(styles.viewOnly);
        return (
            <div className={classNames.join(' ')}>
                <RegionMap
                    className={styles.regionMap}
                    regionId={countryId}
                />
                <RegionDetailView countryId={countryId} />
            </div>
        );
    }

    render() {
        const {
            projectPatchPending,
            regionClonePending,
            regionDetailPatchPending,
        } = this.state;

        const Header = this.renderHeader;
        const Content = this.renderContent;

        const {
            disabled,
            regionDetail: {
                faramErrors = {},
                faramValues = {},
            },
        } = this.props;

        const loading = projectPatchPending ||
            regionClonePending ||
            regionDetailPatchPending;

        return (
            <Faram
                className={styles.regionDetailsContainer}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={loading || disabled}
            >
                { loading && <LoadingAnimation /> }
                <Header />
                <Content />
            </Faram>
        );
    }
}
