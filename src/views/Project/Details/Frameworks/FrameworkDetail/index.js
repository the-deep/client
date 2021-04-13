import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import html2canvas from 'html2canvas';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import ButtonLikeLink from '#components/general/ButtonLikeLink';

import Message from '#rscv/Message';
import ScrollTabs from '#rscv/ScrollTabs';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ListView from '#rscv/List/ListView';
import List from '#rscv/List';
import Button from '#rsca/Button';
import AccentButton from '#rsca/Button/AccentButton';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import modalize from '#rscg/Modalize';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalFooter from '#rscv/Modal/Footer';
import ModalBody from '#rscv/Modal/Body';

import Cloak from '#components/general/Cloak';
import Badge from '#components/viewer/Badge';
import EntityLink from '#components/viewer/EntityLink';

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
    className: styles.link,
    title: u.displayName,
    link: reverseRoute(pathNames.userProfile, { userId: u.id }),
});

const projectRendererParams = (_, p) => ({
    className: styles.badge,
    title: p.title,
    icon: p.isPrivate ? 'locked' : undefined,
});

const hideQuestionnaire = ({ accessQuestionnaire }) => !accessQuestionnaire;

function saveAs(uri, filename) {
    const link = document.createElement('a');
    if (typeof link.download === 'string') {
        link.href = uri;
        link.download = filename;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    } else {
        window.open(uri);
    }
}

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requestOptions)
export default class FrameworkDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            activeView: 'overview',
            detailsVisibility: false,
            // activeView: 'questions',
            editFrameworkDetails: {
                title: '',
                description: '',
            },
            isExporting: false,
        };

        this.exportSectionRef = React.createRef();

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

    handleDetailsViewClick = () => {
        const { detailsVisibility } = this.state;

        this.setState({ detailsVisibility: !detailsVisibility });
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

    handleExportPreviewButtonClick = () => {
        this.setState({ isExporting: true });
    }

    handleExportModalClose = () => {
        this.setState({ isExporting: false });
    }

    handleExportButtonClick = () => {
        const {
            requests: {
                frameworkGetRequest: { response: framework },
            },
        } = this.props;

        if (this.exportSectionRef.current) {
            html2canvas(this.exportSectionRef.current).then((canvas) => {
                saveAs(canvas.toDataURL(), `DEEP Framework - ${framework.title}.png`);
                this.setState({ isExporting: false });
            });
        }
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
            detailsVisibility,
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
                        <div className={styles.actionButtons}>
                            <Button
                                transparent
                                iconName={detailsVisibility ? 'chevronUp' : 'chevronDown'}
                                onClick={this.handleDetailsViewClick}
                            >
                                {_ts('framework', 'viewDetailsButtonLabel')}
                            </Button>
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
                {detailsVisibility && (
                    <>
                        <div className={styles.descriptionContainer}>
                            { frameworkDescription && (
                                <div
                                    className={styles.description}
                                    title={frameworkDescription}
                                >
                                    { frameworkDescription }
                                </div>
                            )}
                        </div>
                        {usersWithAddPermission.length > 0 && (
                            <div className={styles.labelValuesPair}>
                                <h4 className={styles.label}>
                                    {_ts('framework', 'frameworkOwnersLabel')}:
                                </h4>
                                <ListView
                                    className={styles.userValues}
                                    data={usersWithAddPermission}
                                    keySelector={keySelector}
                                    rendererParams={userRendererParams}
                                    renderer={EntityLink}
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
                        <div className={styles.buttonContainer}>
                            {canEditFramework &&
                                <ModalButton
                                    className={styles.editDetailsButton}
                                    iconName="edit"
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
                            <Button
                                iconName="archive"
                                onClick={this.handleExportPreviewButtonClick}
                            >
                                { _ts('project.framework', 'exportButtonTitle') }
                            </Button>
                        </div>
                    </>
                )}
                <div className={styles.widgetPreviewBar}>
                    <h3 className={styles.widgetPreviewHeading}>
                        {_ts('framework', 'widgetsPreviewTitle')}
                    </h3>
                    <div className={styles.widgetRightContainer}>
                        <ScrollTabs
                            className={styles.tabs}
                            tabs={this.tabs}
                            onClick={this.handleTabClick}
                            active={activeView}
                        />
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
                    </div>
                </div>
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

        const { isExporting } = this.state;

        const Header = this.renderHeader;

        return (
            <div className={_cs(className, styles.frameworkDetails)}>
                <Header framework={framework} />
                <Preview
                    activeView={activeView}
                    className={styles.preview}
                    framework={framework}
                />
                { isExporting && (
                    <Modal className={styles.exportModal}>
                        <ModalHeader
                            title={_ts('project.framework', 'exportModalTitle')}
                            rightComponent={
                                <DangerButton
                                    onClick={this.handleExportModalClose}
                                    transparent
                                    iconName="close"
                                />
                            }
                        />
                        <ModalBody className={styles.modalBody}>
                            <div ref={this.exportSectionRef}>
                                <h3 className={styles.tabHeading}>
                                    {_ts('project.framework', 'overviewTabTitle')}
                                </h3>
                                <Preview
                                    className={styles.printPreview}
                                    activeView="overview"
                                    framework={framework}
                                />
                                <h3 className={styles.tabHeading}>
                                    {_ts('project.framework', 'listTabTitle')}
                                </h3>
                                <Preview
                                    className={styles.printPreview}
                                    activeView="list"
                                    framework={framework}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <PrimaryButton
                                onClick={this.handleExportButtonClick}
                                transparent
                            >
                                {_ts('project.framework', 'exportModalExportTitle')}
                            </PrimaryButton>
                        </ModalFooter>
                    </Modal>
                )}
            </div>
        );
    }
}
