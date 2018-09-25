import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import { reverseRoute } from '#rsu/common';
import FixedTabs from '#rscv/FixedTabs';

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
import CloneFrameworkButton from './CloneFrameworkButton';

import FrameworkGetRequest from './requests/FrameworkGetRequest';

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
            framework: undefined,
            activeView: 'overview',
        };

        const setState = d => this.setState(d);
        this.frameworkGetRequest = new FrameworkGetRequest({ setState });

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
            analysisFrameworkId,
            framework,
        } = this.props;

        if (!framework.isAdmin) {
            return null;
        }

        const { pending } = this.state;
        const editFrameworkButtonTitle = _ts('project.framework', 'editFrameworkButtonTitle');

        const params = { analysisFrameworkId };

        return (
            <Link
                className={styles.editFrameworkLink}
                to={reverseRoute(pathNames.analysisFramework, params)}
                disabled={pending}
            >
                { editFrameworkButtonTitle }
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
            addNewFramework,
        } = this.props;

        const {
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
                        <CloneFrameworkButton
                            projectId={projectId}
                            frameworkId={frameworkId}
                            addNewFramework={addNewFramework}
                            disabled={pending}
                        />
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
            analysisFrameworkId,
            className: classNameFromProps,
        } = this.props;

        requestFramework(analysisFrameworkId, this.frameworkGetRequest);

        const {
            framework,
            activeView,
        } = this.state;

        const Header = this.renderHeader;

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
            </div>
        );
    }
}
