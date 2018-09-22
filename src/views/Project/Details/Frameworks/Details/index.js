import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import { reverseRoute } from '#rsu/common';
import FixedTabs from '#rscv/FixedTabs';
import AccentButton from '#rsca/Button/AccentButton';
import Confirm from '#rscv/Modal/Confirm';

import {
    analysisFrameworkDetailSelector,
    projectDetailsSelector,
    setProjectAfAction,
    addNewAfAction,
} from '#redux';

import { pathNames } from '#constants';
import _ts from '#ts';

import Preview from './Preview';

import UseFrameworkButton from './UseFrameworkButton';

import FrameworkGetRequest from './requests/FrameworkGetRequest';
import FrameworkCloneRequest from './requests/FrameworkCloneRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    framework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,
    addNewFramework: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectFramework: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    framework: analysisFrameworkDetailSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    addNewFramework: params => dispatch(addNewAfAction(params)),
    setProjectFramework: params => dispatch(setProjectAfAction(params)),
});

const requestFramework = memoize((frameworkId, frameworkGetRequest) => {
    frameworkGetRequest.stop();
    frameworkGetRequest
        .init(frameworkId)
        .start();
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Details extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showCloneFrameworkConfirm: false,
            showUseFrameworkConfirm: false,
            framework: undefined,
            activeView: 'overview',
        };

        const setState = d => this.setState(d);

        // Requests
        this.frameworkCloneRequest = new FrameworkCloneRequest({
            setState,
            addNewFramework: this.props.addNewFramework,
        });

        this.frameworkGetRequest = new FrameworkGetRequest({ setState });

        this.tabs = {
            overview: 'Overview',
            list: 'List',
        };
    }

    componentWillUnmount() {
        this.frameworkCloneRequest.stop();
        this.frameworkGetRequest.stop();
    }

    handleFrameworkClone = (cloneConfirm, afId, projectId) => {
        if (cloneConfirm) {
            this.frameworkCloneRequest
                .init(afId, projectId)
                .start();
        }
        this.setState({ showCloneFrameworkConfirm: false });
    }

    handleAfUse = (useConfirm, afId, projectId) => {
        if (useConfirm) {
            this.projectPatchRequest.init(afId, projectId).start();
        }
        this.setState({ showUseFrameworkConfirm: false });
    }

    handleCloneFrameworkButtonClick = () => {
        this.setState({ showCloneFrameworkConfirm: true });
    }

    handleUseFrameworkButtonClick = () => {
        this.setState({ showUseFrameworkConfirm: true });
    }

    handleTabClick = (tabId) => {
        this.setState({ activeView: tabId });
    }

    renderEditFrameworkButton = () => {
        const {
            analysisFrameworkId,
            framework,
        } = this.props;

        if (!framework.isAdmin) {
            return null;
        }

        const { pending } = this.state;
        const editFrameworkButtonLabel = _ts('project', 'editAfButtonLabel');

        const params = { analysisFrameworkId };

        return (
            <Link
                className={styles.editFrameworkLink}
                to={reverseRoute(pathNames.analysisFramework, params)}
                disabled={pending}
            >
                { editFrameworkButtonLabel }
            </Link>
        );
    }

    renderHeader = () => {
        const {
            framework: {
                id: frameworkId,
                title: frameworkTitle,
                description: frameworkDescription,
            },
            projectDetails: {
                analysisFramework: currentFrameworkId,
                id: projectId,
            },
            setProjectFramework,
        } = this.props;

        const {
            pending,
            activeView,
        } = this.state;

        const EditFrameworkButton = this.renderEditFrameworkButton;

        const cloneAndEditFrameworkButtonLabel = _ts('project', 'cloneEditAfButtonLabel');

        return (
            <header className={styles.header}>
                <div className={styles.top}>
                    <h2
                        title={frameworkTitle}
                        className={styles.heading}
                    >
                        {frameworkTitle}
                    </h2>
                    <FixedTabs
                        className={styles.tabs}
                        tabs={this.tabs}
                        onClick={this.handleTabClick}
                        active={activeView}
                    />

                    <div className={styles.actionButtons}>
                        <UseFrameworkButton
                            currentFrameworkId={currentFrameworkId}
                            disabled={pending}
                            frameworkId={frameworkId}
                            frameworkTitle={frameworkTitle}
                            projectId={projectId}
                            setProjectFramework={setProjectFramework}
                        />
                        <EditFrameworkButton />
                        <AccentButton
                            onClick={this.handleCloneFrameworkButtonClick}
                            disabled={pending}
                        >
                            { cloneAndEditFrameworkButtonLabel }
                        </AccentButton>
                    </div>
                </div>
                { frameworkDescription && (
                    <div
                        className={styles.description}
                        title={frameworkDescription}
                    >
                        { frameworkDescription }
                    </div>
                )}
            </header>
        );
    }

    renderUseFrameworkConfirm = () => {
        const {
            analysisFrameworkId,
            projectDetails: {
                id: projectId,
            },
            framework: {
                title: frameworkTitle,
            },
        } = this.props;

        const { showUseFrameworkConfirm } = this.state;

        return (
            <Confirm
                show={showUseFrameworkConfirm}
                onClose={useConfirm => this.handleAfUse(
                    useConfirm,
                    analysisFrameworkId,
                    projectId,
                )}
            >
                <p>
                    { _ts('project', 'confirmUseAf', { title: frameworkTitle }) }
                </p>
                <p>
                    { _ts('project', 'confirmUseAfText') }
                </p>
            </Confirm>
        );
    }

    renderCloneFrameworkConfirm = () => {
        const {
            framework,
            analysisFrameworkId,
            projectDetails,
        } = this.props;
        const { showCloneFrameworkConfirm } = this.state;

        return (
            <Confirm
                show={showCloneFrameworkConfirm}
                onClose={cloneConfirm => this.handleFrameworkClone(
                    cloneConfirm,
                    analysisFrameworkId,
                    projectDetails.id,
                )}
            >
                <p>
                    { _ts('project', 'confirmCloneAf', { title: framework.title }) }
                </p>
            </Confirm>
        );
    }

    render() {
        const {
            analysisFrameworkId,
            className: classNameFromProps,
        } = this.props;

        requestFramework(analysisFrameworkId, this.frameworkGetRequest);

        const {
            framework,
            activeView,
        } = this.state;

        const Header = this.renderHeader;
        const CloneFrameworkConfirm = this.renderCloneFrameworkConfirm;

        const className = `
            ${classNameFromProps}
            ${styles.frameworkDetails}
        `;

        return (
            <div className={className}>
                <Header />
                <Preview
                    activeView={activeView}
                    className={styles.preview}
                    framework={framework}
                />
                <CloneFrameworkConfirm />
            </div>
        );
    }
}
