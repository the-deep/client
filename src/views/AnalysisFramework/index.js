import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link, Prompt } from 'react-router-dom';

import BoundError from '#rscg/BoundError';
import LoadingAnimation from '#rscv/LoadingAnimation';
import MultiViewContainer from '#rscv/MultiViewContainer';
import { reverseRoute } from '#rsu/common';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import FixedTabs from '#rscv/FixedTabs';
import Message from '#rscv/Message';

import AppError from '#components/AppError';
import {
    afIdFromRoute,
    setAfViewAnalysisFrameworkAction,

    afViewAnalysisFrameworkSelector,
    activeProjectIdFromStateSelector,

    routeUrlSelector,
} from '#redux';
import {
    iconNames,
    pathNames,
} from '#constants';
import _ts from '#ts';

import FrameworkGetRequest from './requests/FrameworkGet';
import FrameworkSaveRequest from './requests/FrameworkSave';
import Overview from './Overview';
import List from './List';
import styles from './styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,
    setAnalysisFramework: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,

    routeUrl: PropTypes.string.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
};

const mapStateToProps = (state, props) => ({
    analysisFramework: afViewAnalysisFrameworkSelector(state, props),
    analysisFrameworkId: afIdFromRoute(state, props),
    projectId: activeProjectIdFromStateSelector(state, props),
    routeUrl: routeUrlSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAnalysisFramework: params => dispatch(setAfViewAnalysisFrameworkAction(params)),
});

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class AnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { pendingFramework: true };

        this.frameworkGetRequest = new FrameworkGetRequest({
            setState: params => this.setState(params),
            setAnalysisFramework: this.props.setAnalysisFramework,
            getAnalysisFramework: () => this.props.analysisFramework,
        });

        this.frameworkSaveRequest = new FrameworkSaveRequest({
            setState: params => this.setState(params),
            setAnalysisFramework: this.props.setAnalysisFramework,
        });

        this.views = {
            overview: {
                component: () => (
                    <Overview
                        analysisFramework={this.props.analysisFramework}
                    />
                ),
                wrapContainer: true,
                mount: true,
            },
            list: {
                component: () => (
                    <List
                        analysisFramework={this.props.analysisFramework}
                    />
                ),
                wrapContainer: true,
                mount: true,
            },
        };

        // FIXME: use strings
        this.tabs = {
            overview: 'Overview',
            list: 'List',
        };

        this.defaultHash = 'overview';
    }

    componentWillMount() {
        this.frameworkGetRequest.init(this.props.analysisFrameworkId);
        this.frameworkGetRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { analysisFrameworkId: oldAnalysisFrameworkId } = this.props;
        const { analysisFrameworkId: newAnalysisFrameworkId } = nextProps;

        if (oldAnalysisFrameworkId !== newAnalysisFrameworkId) {
            if (this.analysisFrameworkSaveRequest) {
                this.analysisFrameworkSaveRequest.stop();
            }

            this.frameworkGetRequest.init(newAnalysisFrameworkId);
            this.frameworkGetRequest.start();
        }
    }

    componentWillUnmount() {
        this.frameworkGetRequest.stop();
        this.frameworkSaveRequest.stop();
    }

    handleSave = () => {
        const {
            analysisFrameworkId,
            analysisFramework,
        } = this.props;

        this.frameworkSaveRequest.init(analysisFrameworkId, analysisFramework);
        this.frameworkSaveRequest.start();
    }

    handleCancel = () => {
        // The second signifies cancel operation
        this.frameworkGetRequest.init(this.props.analysisFrameworkId, true);
        this.frameworkGetRequest.start();
    }

    render() {
        const {
            analysisFramework,
            projectId,
        } = this.props;

        const { pendingFramework } = this.state;

        if (pendingFramework) {
            return (
                <div className={styles.analysisFramework}>
                    <LoadingAnimation large />
                </div>
            );
        }

        if (!analysisFramework.id) {
            return (
                <Message className={styles.analysisFramework}>
                    {_ts('framework', 'noAnalysisFramework')}
                </Message>
            );
        }

        // FIXME: add prompt

        // FIXME: Use Strings
        const cancelButtonTitle = 'Cancel';
        const saveButtonTitle = 'Save';
        const backButtonTooltip = 'Back to projects';

        const exitPath = reverseRoute(pathNames.projects, { projectId });
        const frameworkTitle = analysisFramework.title || _ts('framework', 'analysisFramework');

        return (
            <div className={styles.analysisFramework}>
                <Prompt
                    message={
                        (location) => {
                            const { routeUrl } = this.props;
                            if (location.pathname === routeUrl) {
                                return true;
                            } else if (analysisFramework.pristine) {
                                return true;
                            }
                            return _ts('common', 'youHaveUnsavedChanges');
                        }
                    }
                />
                <header className={styles.header}>
                    <Link
                        className={styles.backLink}
                        title={backButtonTooltip}
                        to={{
                            pathname: exitPath,
                            hash: '#/frameworks',
                        }}
                    >
                        <i className={iconNames.back} />
                    </Link>
                    <h4 className={styles.heading}>
                        { frameworkTitle }
                    </h4>
                    <FixedTabs
                        className={styles.tabs}
                        tabs={this.tabs}
                        useHash
                        replaceHistory
                        deafultHash={this.defaultHash}
                    />
                    <div className={styles.actionButtons}>
                        <DangerConfirmButton
                            // FIXME: use strings
                            confirmationMessage="Do you want to cancel all changes?"
                            onClick={this.handleCancel}
                            disabled={analysisFramework.pristine}
                        >
                            { cancelButtonTitle }
                        </DangerConfirmButton>
                        <SuccessButton
                            onClick={this.handleSave}
                            disabled={analysisFramework.pristine}
                        >
                            { saveButtonTitle }
                        </SuccessButton>
                    </div>
                </header>
                <MultiViewContainer
                    views={this.views}
                    useHash
                    containerClassName={styles.content}
                    activeClassName={styles.active}
                />
            </div>
        );
    }
}
