import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    reverseRoute,
} from '@togglecorp/fujs';

import Message from '#rscv/Message';
import ScrollTabs from '#rscv/ScrollTabs';
import LoadingAnimation from '#rscv/LoadingAnimation';
import AccentButton from '#rsca/Button/AccentButton';
import WarningButton from '#rsca/Button/WarningButton';
import modalize from '#rscg/Modalize';
import Badge from '#components/viewer/Badge';

import {
    RequestClient,
    requestMethods,
} from '#request';
import {
    projectDetailsSelector,
    setProjectAfAction,
} from '#redux';

import { pathNames } from '#constants';
import _ts from '#ts';

import Preview from './Preview';

import UseFrameworkButton from './UseFrameworkButton';
import AddFrameworkModal from '../AddFrameworkModal';
import EditFrameworkModal from './EditFrameworkModal';

import styles from './styles.scss';

const AccentModalButton = modalize(AccentButton);
const WarningModalButton = modalize(WarningButton);

const propTypes = {
    className: PropTypes.string,
    frameworkId: PropTypes.number,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectFramework: PropTypes.func.isRequired,
    setActiveFramework: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    frameworkGetRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setDefaultRequestParams: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    readOnly: false,
    frameworkId: undefined,
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setProjectFramework: params => dispatch(setProjectAfAction(params)),
});

const emptyObject = {};

const requests = {
    frameworkGetRequest: {
        url: ({ props }) => `/analysis-frameworks/${props.frameworkId}`,
        method: requestMethods.GET,
        onPropsChanged: ['frameworkId'],
        onMount: ({ props }) => !!props.frameworkId,
        onSuccess: ({ params, response }) => {
            const editFrameworkDetails = {
                title: response.title,
                description: response.description,
            };
            params.handleDetailsChange(editFrameworkDetails);
        },
        schemaName: 'analysisFramework',
    },
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requests)
export default class FrameworkDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            activeView: 'overview',
            editFrameworkDetails: {
                title: '',
                description: '',
            },
        };

        this.tabs = {
            overview: _ts('project.framework', 'entryOverviewTitle'),
            list: _ts('project.framework', 'entryListTitle'),
        };

        this.props.setDefaultRequestParams({
            handleDetailsChange: this.handleDetailsChange,
        });
    }

    handleTabClick = (tabId) => {
        this.setState({ activeView: tabId });
    }

    handleDetailsChange = (editFrameworkDetails) => {
        this.setState({ editFrameworkDetails });
    }

    renderHeader = ({ framework }) => {
        // FIXME: Remove this check after pending from request is consistent
        if (!framework) {
            return null;
        }

        const {
            id: analysisFrameworkId,
            role: {
                canCloneFramework = false,
                canEditFramework = false,
                canUseInOtherProjects = false,
            } = {},
            isPrivate,
        } = framework;

        const {
            projectDetails: {
                analysisFramework: currentFrameworkId,
                id: projectId,
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

        const canUse = canUseInOtherProjects && (currentFrameworkId !== analysisFrameworkId);

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
                            {canUse &&
                                <UseFrameworkButton
                                    disabled={pending || readOnly}
                                    frameworkId={analysisFrameworkId}
                                    frameworkTitle={frameworkTitle}
                                    projectId={projectId}
                                    setProjectFramework={setProjectFramework}
                                />
                            }

                            {canEditFramework &&
                                <WarningModalButton
                                    disabled={pending || readOnly}
                                    modal={
                                        <EditFrameworkModal
                                            frameworkId={analysisFrameworkId}
                                            frameworkDetails={editFrameworkDetails}
                                            onFrameworkDetailsChange={this.handleDetailsChange}
                                        />
                                    }
                                >
                                    { _ts('project.framework', 'editFrameworkButtonTitle') }
                                </WarningModalButton>
                            }

                            {canEditFramework &&
                                <Link
                                    className={styles.editFrameworkLink}
                                    to={reverseRoute(
                                        pathNames.analysisFramework,
                                        { analysisFrameworkId },
                                    )}
                                >
                                    { _ts('project.framework', 'editWidgetsButtonTitle') }
                                </Link>
                            }

                            {canCloneFramework &&
                                <AccentModalButton
                                    disabled={pending || readOnly}
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
            </header>
        );
    }

    render() {
        const {
            className: classNameFromProps,
            frameworkGetRequest: {
                pending: pendingFramework,
                responseError: errorFramework,
            },
            frameworkId,
        } = this.props;

        const {
            activeView,
        } = this.state;

        const className = `
            ${classNameFromProps}
            ${styles.frameworkDetails}
        `;

        if (!frameworkId) {
            return (
                <div className={className}>
                    <Message>
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
            frameworkGetRequest: {
                response: framework,
            },
        } = this.props;

        const Header = this.renderHeader;

        return (
            <div className={className}>
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
