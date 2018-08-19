import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { reverseRoute } from '#rsu/common';
import AccentButton from '#rsca/Button/AccentButton';
import WarningButton from '#rsca/Button/WarningButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import Message from '#rscv/Message';
import Confirm from '#rscv/Modal/Confirm';

import {
    analysisFrameworkDetailSelector,
    projectDetailsSelector,
    setProjectAfAction,
    addNewAfAction,
} from '#redux';
import {
    iconNames,
    pathNames,
} from '#constants';
import _ts from '#ts';

import EditFramework from '../EditFramework';

import ProjectPatchRequest from './requests/ProjectPatchRequest';
import AfCloneRequest from './requests/AfCloneRequest';

import styles from './styles.scss';

const propTypes = {
    frameworkDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,
    addNewAf: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectFramework: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    frameworkDetails: analysisFrameworkDetailSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    addNewAf: params => dispatch(addNewAfAction(params)),
    setProjectFramework: params => dispatch(setProjectAfAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectAfDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            cloneConfirmModalShow: false,
            useConfirmModalShow: false,
            showEditFrameworkModal: false,
        };

        // Requests
        this.projectPatchRequest = new ProjectPatchRequest({
            setState: v => this.setState(v),
            setProjectFramework: this.props.setProjectFramework,
        });
        this.afCloneRequest = new AfCloneRequest({
            setState: v => this.setState(v),
            addNewAf: this.props.addNewAf,
        });
    }

    componentWillUnmount() {
        this.projectPatchRequest.stop();
        this.afCloneRequest.stop();
    }

    handleAfClone = (cloneConfirm, afId, projectId) => {
        if (cloneConfirm) {
            this.afCloneRequest.init(afId, projectId).start();
        }
        this.setState({ cloneConfirmModalShow: false });
    }

    handleAfUse = (useConfirm, afId, projectId) => {
        if (useConfirm) {
            this.projectPatchRequest.init(afId, projectId).start();
        }
        this.setState({ useConfirmModalShow: false });
    }

    handleAfCloneClick = () => {
        this.setState({ cloneConfirmModalShow: true });
    }

    handleAfUseClick = () => {
        this.setState({ useConfirmModalShow: true });
    }

    handleEditFrameworButtonClick = () => {
        this.setState({ showEditFrameworkModal: true });
    }

    handleEditFrameworkModalClose = () => {
        this.setState({ showEditFrameworkModal: false });
    }

    renderUseFrameworkButton = () => {
        const {
            analysisFrameworkId,
            projectDetails,
        } = this.props;

        if (analysisFrameworkId === projectDetails.analysisFramework) {
            return null;
        }

        const { pending } = this.state;
        const useFrameworkButtonLabel = _ts('project', 'useAfButtonLabel');

        return (
            <WarningButton
                iconName={iconNames.check}
                onClick={this.handleAfUseClick}
                disabled={pending}
            >
                { useFrameworkButtonLabel }
            </WarningButton>
        );
    }

    renderEditFrameworkButton = () => {
        const {
            analysisFrameworkId,
            frameworkDetails,
        } = this.props;

        if (!frameworkDetails.isAdmin) {
            return null;
        }

        const { pending } = this.state;
        const editFrameworkButtonLabel = _ts('project', 'editAfButtonLabel');

        const params = {
            analysisFrameworkId,
        };

        return (
            <Fragment>
                <Link
                    className={styles.editFrameworkLink}
                    to={reverseRoute(pathNames.analysisFramework, params)}
                    disabled={pending}
                >
                    { editFrameworkButtonLabel }
                </Link>
                <SuccessButton
                    onClick={this.handleEditFrameworButtonClick}
                    disabled={pending}
                    type="submit"
                >
                    {_ts('project', 'quickEditAfButtonLabel')}
                </SuccessButton>
            </Fragment>
        );
    }

    renderFrameworkPreview = () => {
        const { frameworkDetails } = this.props;

        // TODO: Complete Framework Preview
        return (
            <Message>
                {frameworkDetails.title}<br />
                {frameworkDetails.description}
            </Message>
        );
    }

    renderHeader = () => {
        const { frameworkDetails } = this.props;
        const { pending } = this.state;

        const UseFrameworkButton = this.renderUseFrameworkButton;
        const EditFrameworkButton = this.renderEditFrameworkButton;

        const cloneAndEditFrameworkButtonLabel = _ts('project', 'cloneEditAfButtonLabel');

        return (
            <header className={styles.header}>
                <h2>
                    {frameworkDetails.title}
                </h2>
                <div className={styles.actionButtons}>
                    <UseFrameworkButton />
                    <EditFrameworkButton />
                    <AccentButton
                        onClick={this.handleAfCloneClick}
                        disabled={pending}
                    >
                        { cloneAndEditFrameworkButtonLabel }
                    </AccentButton>
                </div>
            </header>
        );
    }

    render() {
        const {
            frameworkDetails,
            analysisFrameworkId,
            projectDetails,
        } = this.props;

        const {
            cloneConfirmModalShow,
            useConfirmModalShow,
            showEditFrameworkModal,
        } = this.state;

        const Header = this.renderHeader;
        const FrameworkPreview = this.renderFrameworkPreview;

        return (
            <div className={styles.analysisFrameworkDetail}>
                <Header />
                <FrameworkPreview />
                {
                    showEditFrameworkModal &&
                    <EditFramework
                        analysisFrameworkId={analysisFrameworkId}
                        onModalClose={this.handleEditFrameworkModalClose}
                    />
                }
                <Confirm
                    show={useConfirmModalShow}
                    onClose={useConfirm => this.handleAfUse(
                        useConfirm, analysisFrameworkId, projectDetails.id,
                    )}
                >
                    <p>
                        { _ts('project', 'confirmUseAf', { title: frameworkDetails.title }) }
                    </p>
                    <p>
                        { _ts('project', 'confirmUseAfText') }
                    </p>
                </Confirm>
                <Confirm
                    show={cloneConfirmModalShow}
                    onClose={cloneConfirm => this.handleAfClone(
                        cloneConfirm, analysisFrameworkId, projectDetails.id,
                    )}
                >
                    <p>
                        { _ts('project', 'confirmCloneAf', { title: frameworkDetails.title }) }
                    </p>
                </Confirm>
            </div>
        );
    }
}
