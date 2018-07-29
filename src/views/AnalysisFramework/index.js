import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import BoundError from '#rs/components/General/BoundError';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import MultiViewContainer from '#rs/components/View/MultiViewContainer';
import { reverseRoute } from '#rs/utils/common';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import FixedTabs from '#rscv/FixedTabs';

import AppError from '#components/AppError';
import {
    afIdFromRoute,
    setAfViewAnalysisFrameworkAction,

    afViewCurrentAnalysisFrameworkSelector,
    activeProjectIdFromStateSelector,
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
};

const defaultProps = {
    analysisFramework: undefined,
};

const mapStateToProps = (state, props) => ({
    analysisFramework: afViewCurrentAnalysisFrameworkSelector(state, props),
    analysisFrameworkId: afIdFromRoute(state, props),
    projectId: activeProjectIdFromStateSelector(state, props),
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
                lazyMount: true,
                mount: true,
            },
            list: {
                component: () => (
                    <List
                        analysisFramework={this.props.analysisFramework}
                    />
                ),
                wrapContainer: true,
                lazyMount: true,
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

        this.frameworkGetRequest.init(analysisFrameworkId);
        this.frameworkGetRequest.start(analysisFramework);
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

        if (!analysisFramework || pendingFramework) {
            return (
                <div className={styles.analysisFramework}>
                    <LoadingAnimation large />
                </div>
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
                        >
                            { cancelButtonTitle }
                        </DangerConfirmButton>
                        <SuccessButton
                            onClick={this.handleSave}
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
