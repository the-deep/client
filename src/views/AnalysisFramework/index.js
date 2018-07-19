import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import BoundError from '#rs/components/General/BoundError';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import MultiViewContainer from '#rs/components/View/MultiViewContainer';
import { reverseRoute, checkVersion } from '#rs/utils/common';
import { FgRestBuilder } from '#rs/utils/rest';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import FixedTabs from '#rscv/FixedTabs';

import AppError from '#components/AppError';
import {
    createParamsForGet,
    createParamsForAnalysisFrameworkEdit,
    createUrlForAnalysisFramework,
} from '#rest';
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
import notify from '#notify';
import schema from '#schema';
import _ts from '#ts';

import Overview from './Overview';
// import List from './List';
import styles from './styles.scss';

// FIXME: remove this
const List = () => <div />;

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
        this.analysisFrameworkRequest = this.createRequestForAnalysisFramework(
            this.props.analysisFrameworkId,
        );
        this.analysisFrameworkRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.analysisFrameworkId !== nextProps.analysisFrameworkId) {
            if (this.analysisFrameworkRequest) {
                this.analysisFrameworkRequest.stop();
            }
            if (this.analysisFrameworkSaveRequest) {
                this.analysisFrameworkSaveRequest.stop();
            }

            this.analysisFrameworkRequest = this.createRequestForAnalysisFramework(
                this.props.analysisFrameworkId,
            );
            this.analysisFrameworkRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.analysisFrameworkRequest) {
            this.analysisFrameworkRequest.stop();
        }
        if (this.analysisFrameworkSaveRequest) {
            this.analysisFrameworkSaveRequest.stop();
        }
    }

    createRequestForAnalysisFramework = (analysisFrameworkId) => {
        const urlForAnalysisFramework = createUrlForAnalysisFramework(
            analysisFrameworkId,
        );
        const analysisFrameworkRequest = new FgRestBuilder()
            .url(urlForAnalysisFramework)
            .params(createParamsForGet)
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    const { analysisFramework = {} } = this.props;

                    const {
                        shouldSetValue,
                        isValueOverriden,
                    } = checkVersion(analysisFramework.versionId, response.versionId);

                    if (shouldSetValue) {
                        this.props.setAnalysisFramework({
                            analysisFramework: response,
                        });
                    }
                    if (isValueOverriden) {
                        notify.send({
                            type: notify.type.WARNING,
                            title: _ts('framework', 'afUpdate'),
                            message: _ts('framework', 'afUpdateOverridden'),
                            duration: notify.duration.SLOW,
                        });
                    }
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return analysisFrameworkRequest;
    }

    createRequestForAnalysisFrameworkSave = ({ analysisFramework }) => {
        const urlForAnalysisFramework = createUrlForAnalysisFramework(
            analysisFramework.id,
        );
        const analysisFrameworkSaveRequest = new FgRestBuilder()
            .url(urlForAnalysisFramework)
            .params(() => createParamsForAnalysisFrameworkEdit(analysisFramework))
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.setAnalysisFramework({
                        analysisFramework: response,
                    });
                    notify.send({
                        title: _ts('framework', 'afTitle'),
                        type: notify.type.SUCCESS,
                        message: _ts('framework', 'afSaveSuccess'),
                        duration: notify.duration.SLOW,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return analysisFrameworkSaveRequest;
    }

    handleSave = () => {
        this.analysisFrameworkSaveRequest = this.createRequestForAnalysisFrameworkSave({
            analysisFramework: this.props.analysisFramework,
        });
        this.analysisFrameworkSaveRequest.start();
    }

    render() {
        const {
            analysisFramework,
            projectId,
        } = this.props;

        if (!analysisFramework) {
            return (
                <div className={styles.analysisFramework}>
                    <LoadingAnimation large />
                </div>
            );
        }

        // FIXME: add prompt

        const cancelButtonTitle = 'Cancel';
        const saveButtonTitle = 'Save';
        const backButtonTooltip = 'Back to projects';

        const exitPath = `${reverseRoute(pathNames.projects, { projectId })}#/frameworks`;
        const frameworkTitle = analysisFramework.title || _ts('framework', 'analysisFramework');

        return (
            <div className={styles.analysisFramework}>
                <header className={styles.header}>
                    <Link
                        className={styles.backLink}
                        title={backButtonTooltip}
                        to={exitPath}
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
