import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import {
    reverseRoute,
} from '@togglecorp/fujs';

import Message from '#rscv/Message';
import ScrollTabs from '#rscv/ScrollTabs';
import LoadingAnimation from '#rscv/LoadingAnimation';
import AccentButton from '#rsca/Button/AccentButton';
import modalize from '#rscg/Modalize';

import {
    projectDetailsSelector,
    setProjectAfAction,
    addNewAfAction,
} from '#redux';

import { pathNames } from '#constants';
import _ts from '#ts';

import Preview from './Preview';

import UseFrameworkButton from './UseFrameworkButton';
import CloneFrameworkModal from './CloneFrameworkModal';

import FrameworkGetRequest from './requests/FrameworkGetRequest';

import styles from './styles.scss';

const AccentModalButton = modalize(AccentButton);

const propTypes = {
    className: PropTypes.string,
    frameworkId: PropTypes.number,
    addNewFramework: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectFramework: PropTypes.func.isRequired,
    setActiveFramework: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    isFrameworkListEmpty: PropTypes.bool,
};

const defaultProps = {
    className: '',
    readOnly: false,
    frameworkId: undefined,
    isFrameworkListEmpty: false,
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    addNewFramework: params => dispatch(addNewAfAction(params)),
    setProjectFramework: params => dispatch(setProjectAfAction(params)),
});

const requestFramework = memoize((frameworkId, frameworkGetRequest) => {
    if (frameworkId === undefined) {
        return;
    }
    frameworkGetRequest.stop();
    frameworkGetRequest
        .init(frameworkId)
        .start();
});

const emptyObject = {};

@connect(mapStateToProps, mapDispatchToProps)
export default class FrameworkDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const { frameworkId } = this.props;

        this.state = {
            pendingFramework: !!frameworkId,
            error: false,
            framework: undefined,
            activeView: 'overview',
        };

        this.frameworkGetRequest = new FrameworkGetRequest({
            setState: d => this.setState(d),
        });

        this.tabs = {
            overview: _ts('project.framework', 'entryOverviewTitle'),
            list: _ts('project.framework', 'entryListTitle'),
        };
    }

    componentWillUnmount() {
        this.frameworkGetRequest.stop();
    }

    handleTabClick = (tabId) => {
        this.setState({ activeView: tabId });
    }

    renderEditFrameworkButton = () => {
        const {
            framework: {
                id: frameworkId,
                isAdmin: isFrameworkAdmin,
            } = emptyObject,
        } = this.state;

        if (!isFrameworkAdmin) {
            return null;
        }

        const editFrameworkButtonTitle = _ts('project.framework', 'editFrameworkButtonTitle');

        const params = { analysisFrameworkId: frameworkId };

        return (
            <Link
                className={styles.editFrameworkLink}
                to={reverseRoute(pathNames.analysisFramework, params)}
            >
                { editFrameworkButtonTitle }
            </Link>
        );
    }

    renderHeader = () => {
        const {
            projectDetails: {
                analysisFramework: currentFrameworkId,
                id: projectId,
            } = emptyObject,
            setProjectFramework,
            addNewFramework,
            setActiveFramework,
            readOnly,
        } = this.props;

        const {
            framework: {
                id: frameworkId,
                title: frameworkTitle,
                description: frameworkDescription,
            } = emptyObject,
            pending,
            activeView,
        } = this.state;

        const EditFrameworkButton = this.renderEditFrameworkButton;

        return (
            <header className={styles.header}>
                <div className={styles.top}>
                    <h2
                        title={frameworkTitle}
                        className={styles.heading}
                    >
                        {frameworkTitle}
                    </h2>
                    <ScrollTabs
                        className={styles.tabs}
                        tabs={this.tabs}
                        onClick={this.handleTabClick}
                        active={activeView}
                    />
                    <div className={styles.actionButtons}>
                        <UseFrameworkButton
                            currentFrameworkId={currentFrameworkId}
                            disabled={pending || readOnly}
                            frameworkId={frameworkId}
                            frameworkTitle={frameworkTitle}
                            projectId={projectId}
                            setProjectFramework={setProjectFramework}
                        />

                        <EditFrameworkButton />

                        <AccentModalButton
                            disabled={pending || readOnly}
                            modal={
                                <CloneFrameworkModal
                                    projectId={projectId}
                                    frameworkId={frameworkId}
                                    addNewFramework={addNewFramework}
                                    setActiveFramework={setActiveFramework}
                                />
                            }
                        >
                            { _ts('project.framework', 'cloneButtonTitle') }
                        </AccentModalButton>

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

    render() {
        const {
            frameworkId,
            className: classNameFromProps,
            isFrameworkListEmpty,
        } = this.props;

        const {
            pendingFramework,
            error,
            framework,
            activeView,
        } = this.state;

        requestFramework(frameworkId, this.frameworkGetRequest);

        const Header = this.renderHeader;

        const className = `
            ${classNameFromProps}
            ${styles.frameworkDetails}
        `;

        if (isFrameworkListEmpty) {
            return (
                <div className={className}>
                    <Message className={styles.noFrameworkMessage}>
                        { _ts('project', 'noAfText') }
                    </Message>
                </div>
            );
        }

        if (pendingFramework) {
            return (
                <div className={className}>
                    <LoadingAnimation />
                </div>
            );
        }

        if (error) {
            return (
                <div className={className}>
                    <Message>
                        {_ts('project.framework', 'errorFrameworkLoad')}
                    </Message>
                </div>
            );
        }

        return (
            <div className={className}>
                <Header />
                <Preview
                    activeView={activeView}
                    className={styles.preview}
                    framework={framework}
                />
            </div>
        );
    }
}
