import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import ButtonLikeLink from '#components/general/ButtonLikeLink';

import Cloak from '#components/general/Cloak';
import Message from '#rscv/Message';
import ScrollTabs from '#rscv/ScrollTabs';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ListView from '#rscv/List/ListView';
import List from '#rscv/List';
import Button from '#rsca/Button';
import AccentButton from '#rsca/Button/AccentButton';
import modalize from '#rscg/Modalize';
import Badge from '#components/viewer/Badge';

import {
    RequestClient,
    methods,
} from '#request';
import {
    projectDetailsSelector,
    setProjectAfAction,
    patchAnalysisFrameworkAction,
} from '#redux';

import { pathNames } from '#constants';
import _ts from '#ts';

import Preview from './Preview';

import UseFrameworkButton from './UseFrameworkButton';
import AddFrameworkModal from '../AddFrameworkModal';
import EditFrameworkModal from './EditFrameworkModal';

import styles from './styles.scss';

const ModalButton = modalize(Button);
const AccentModalButton = modalize(AccentButton);

const propTypes = {
    className: PropTypes.string,
    frameworkId: PropTypes.number,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectFramework: PropTypes.func.isRequired,
    setActiveFramework: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    frameworkList: PropTypes.array,
    patchAnalysisFramework: PropTypes.func.isRequired,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setDefaultRequestParams: PropTypes.func.isRequired,
};

const defaultProps = {
    frameworkList: [],
    className: '',
    readOnly: false,
    frameworkId: undefined,
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setProjectFramework: params => dispatch(setProjectAfAction(params)),
    patchAnalysisFramework: params => dispatch(patchAnalysisFrameworkAction(params)),
});

const emptyObject = {};

const requestOptions = {
    frameworkGetRequest: {
        url: ({ props }) => `/analysis-frameworks/${props.frameworkId}/`,
        method: methods.GET,
        query: {
            fields: [
                'id',
                'title',
                'description',
                'widgets',
                // 'questions',
                'members',
                'role',
                'is_private',
                'entries_count',
                'users_with_add_permission',
                'visible_projects',
                'all_projects_count',
            ],
        },
        onPropsChanged: ['frameworkId'],
        onMount: ({ props }) => !!props.frameworkId,
        onSuccess: ({ params, response }) => {
            const editFrameworkDetails = {
                title: response.title,
                description: response.description,
            };
            params.handleDetailsChange(editFrameworkDetails);
        },
        extras: {
            schemaName: 'analysisFrameworkView',
        },
    },
};

const keySelector = u => u.id;
const userRendererParams = (_, u) => ({
    className: styles.badge,
    title: u.displayName,
    tooltip: u.email,
});

const projectRendererParams = (_, p) => ({
    className: styles.badge,
    title: p.title,
    icon: p.isPrivate ? 'locked' : undefined,
});

const hideQuestionnaire = ({ accessQuestionnaire }) => !accessQuestionnaire;

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requestOptions)
export default class FrameworkDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            activeView: 'overview',
            // activeView: 'questions',
            editFrameworkDetails: {
                title: '',
                description: '',
            },
        };

        this.tabs = {
            overview: _ts('project.framework', 'entryOverviewTitle'),
            list: _ts('project.framework', 'entryListTitle'),

            // TODO: entryQuestionTitle --> entryQuestionsTitle
            // *Question__s
            // questions: _ts('project.framework', 'entryQuestionTitle'),
        };

        this.props.setDefaultRequestParams({
            handleDetailsChange: this.handleDetailsChange,
        });
    }

    handleTabClick = (tabId) => {
        this.setState({ activeView: tabId });
    }

    handleDetailsChange = (editFrameworkDetails, isPatch = false) => {
        const {
            patchAnalysisFramework,
            frameworkId,
        } = this.props;

        this.setState({ editFrameworkDetails }, () => {
            if (isPatch) {
                const analysisFramework = {
                    id: frameworkId,
                    title: editFrameworkDetails.title,
                };
                patchAnalysisFramework({ analysisFramework });
            }
        });
    }

    renderHeader = ({ framework }) => {
        // FIXME: Remove this check after pending from request is consistent
        if (!framework) {
            return null;
        }

        const {
            id: analysisFrameworkId,
            role: {
                canCloneFramework,
                canEditFramework,
                canAddUser,
                canUseInOtherProjects,
            } = {},
            isPrivate,
            usersWithAddPermission,
            visibleProjects,
            allProjectsCount,
        } = framework;

        const {
            projectDetails: {
                analysisFramework: currentFrameworkId,
                id: projectId,
                isPrivate: isProjectPrivate,
            } = emptyObject,
            setProjectFramework,
            setActiveFramework,
            readOnly,
        } = this.props;

        const {
            editFrameworkDetails,
            pending,
            activeView,
        } = this.state;

        const {
            title: frameworkTitle,
            description: frameworkDescription,
        } = editFrameworkDetails;

        // NOTE: This is to allow usuage of private framework in private project only
        const canUseFrameworkInProject = isProjectPrivate || !isPrivate;

        const canUse = !!canUseInOtherProjects
            && (currentFrameworkId !== analysisFrameworkId)
            && canUseFrameworkInProject;

        return (
            <header className={styles.header}>
                <div className={styles.top}>
                    <div className={styles.leftContainer} >
                        <h2
                            title={frameworkTitle}
                            className={styles.heading}
                        >
                            {frameworkTitle}
                        </h2>
                        { isPrivate &&
                            <Badge
                                className={styles.badge}
                                icon="locked"
                                title={_ts('framework', 'privateFrameworkBadgeTitle')}
                                tooltip={_ts('framework', 'privateFrameworkBadgeTooltip')}
                            />
                        }
                    </div>
                    <div className={styles.rightContainer} >
                        <ScrollTabs
                            className={styles.tabs}
                            tabs={this.tabs}
                            onClick={this.handleTabClick}
                            active={activeView}
                        />
                        <div className={styles.actionButtons}>
                            {canEditFramework &&
                                <ModalButton
                                    disabled={pending}
                                    modal={
                                        <EditFrameworkModal
                                            frameworkId={analysisFrameworkId}
                                            frameworkDetails={editFrameworkDetails}
                                            isPrivate={isPrivate}
                                            onFrameworkDetailsChange={this.handleDetailsChange}
                                            canEditMemberships={canAddUser}
                                        />
                                    }
                                >
                                    { _ts('project.framework', 'editFrameworkButtonTitle') }
                                </ModalButton>
                            }
                            {canEditFramework &&
                                <ButtonLikeLink
                                    className={styles.editFrameworkLink}
                                    to={reverseRoute(
                                        pathNames.analysisFramework,
                                        { analysisFrameworkId },
                                    )}
                                >
                                    { _ts('project.framework', 'editWidgetsButtonTitle') }
                                </ButtonLikeLink>
                            }
                            {canEditFramework && (
                                <Cloak
                                    hide={hideQuestionnaire}
                                    render={(
                                        <ButtonLikeLink
                                            className={styles.editQuestionsLink}
                                            to={reverseRoute(
                                                pathNames.frameworkQuestions,
                                                { analysisFrameworkId },
                                            )}
                                        >
                                            Edit questions
                                        </ButtonLikeLink>
                                    )}
                                />
                            )}
                            {(canUse && !readOnly) &&
                                <UseFrameworkButton
                                    className={styles.button}
                                    disabled={pending}
                                    frameworkId={analysisFrameworkId}
                                    frameworkTitle={frameworkTitle}
                                    projectId={projectId}
                                    setProjectFramework={setProjectFramework}
                                />
                            }
                            {canCloneFramework &&
                                <AccentModalButton
                                    className={styles.button}
                                    disabled={pending}
                                    modal={
                                        <AddFrameworkModal
                                            frameworkId={analysisFrameworkId}
                                            setActiveFramework={setActiveFramework}
                                            isClone
                                        />
                                    }
                                >
                                    { _ts('project.framework', 'cloneButtonTitle') }
                                </AccentModalButton>
                            }
                        </div>
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
                {usersWithAddPermission.length > 0 && (
                    <div className={styles.labelValuesPair}>
                        <h4 className={styles.label}>
                            {_ts('framework', 'frameworkOwnersLabel')}:
                        </h4>
                        <ListView
                            className={styles.values}
                            data={usersWithAddPermission}
                            keySelector={keySelector}
                            rendererParams={userRendererParams}
                            renderer={Badge}
                        />
                    </div>
                )}
                {visibleProjects.length > 0 && (
                    <div className={styles.labelValuesPair}>
                        <h4 className={styles.label}>
                            {_ts('framework', 'projectsLabel')}:
                        </h4>
                        <div className={styles.values}>
                            <List
                                data={visibleProjects}
                                keySelector={keySelector}
                                rendererParams={projectRendererParams}
                                renderer={Badge}
                            />
                            {allProjectsCount > visibleProjects.length && (
                                <Badge
                                    className={styles.badge}
                                    title={_ts(
                                        'framework',
                                        'privateProjectUsesFrameworkTitle',
                                        {
                                            privateProjects: (
                                                allProjectsCount - visibleProjects.length
                                            ),
                                        },
                                    )}
                                    tooltip={_ts('framework', 'privateProjectUsesFrameworkTooltip')}
                                />
                            )}
                        </div>
                    </div>
                )}
            </header>
        );
    }

    render() {
        const {
            className,
            requests: {
                frameworkGetRequest: {
                    pending: pendingFramework,
                    responseError: errorFramework,
                },
            },
            frameworkId,
            frameworkList,
        } = this.props;

        const { activeView } = this.state;

        if (!frameworkId && frameworkList.length === 0) {
            return (
                <div className={className}>
                    <Message>
                        { _ts('project', 'noAfText') }
                    </Message>
                </div>
            );
        }

        if (!frameworkId && frameworkList.length > 0) {
            return (
                <div className={className}>
                    <Message>
                        { _ts('project', 'noAfSelectedText') }
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

        if (errorFramework) {
            return (
                <div className={className}>
                    <Message>
                        {_ts('project.framework', 'errorFrameworkLoad')}
                    </Message>
                </div>
            );
        }

        const {
            requests: {
                frameworkGetRequest: { response: framework },
            },
        } = this.props;

        const Header = this.renderHeader;

        return (
            <div className={_cs(className, styles.frameworkDetails)}>
                <Header framework={framework} />
                <Preview
                    activeView={activeView}
                    className={styles.preview}
                    framework={framework}
                />
            </div>
        );
    }
}
