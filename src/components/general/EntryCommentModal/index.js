import PropTypes from 'prop-types';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
    compareDate,
} from '@togglecorp/fujs';
import { connect } from 'react-redux';
import React from 'react';

import FloatingContainer from '#rscv/FloatingContainer';
import ScrollTabs from '#rscv/ScrollTabs';
import Button from '#rsca/Button';
import ListView from '#rscv/List/ListView';
import {
    projectIdFromRouteSelector,
} from '#redux';
import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';
import _ts from '#ts';

import Thread from './Thread';
import CommentFaram from './CommentFaram';

import styles from './styles.scss';

const EmptyComponent = () => null;

const mapStateToProps = state => ({
    projectId: projectIdFromRouteSelector(state),
});

const propTypes = {
    className: PropTypes.string,
    closeModal: PropTypes.func,
    projectId: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    entryServerId: PropTypes.number,
    entryCommentsGet: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectMembersGet: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/forbid-prop-types
    commentCreateRequest: PropTypes.object.isRequired,
    onCommentsCountChange: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
    projectId: undefined,
    entryServerId: undefined,
    closeModal: () => {},
};

const RESOLVED = 'resolved';
const UNRESOLVED = 'unresolved';

const WINDOW_PADDING = 24;

const requests = {
    entryCommentsGet: {
        url: '/entry-comments/',
        method: requestMethods.GET,
        query: ({ props: { entryServerId } }) => ({
            entry: entryServerId,
        }),
        onMount: true,
        onSuccess: ({ params: { onCommentsGet }, response }) => {
            onCommentsGet(response.results);
        },
        onPropsChanged: ['entryServerId'],
        schemaName: 'entryComments',
    },
    commentCreateRequest: {
        url: '/entry-comments/',
        method: requestMethods.POST,
        body: ({ params: { body } }) => body,
        onSuccess: ({
            response,
            params: { onAddSuccess },
        }) => {
            onAddSuccess(response);
        },
        schemaName: 'entryComment',
    },
    projectMembersGet: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/members/`,
        method: requestMethods.GET,
        query: {
            fields: ['id', 'display_name'],
        },
        onMount: true,
        onPropsChanged: ['project'],
        schemaName: 'projectMembers',
    },
};

const threadsKeySelector = d => d.key;

const emptyObject = {};
const emptyList = [];

const getParentDate = (thread = emptyObject) =>
    (((thread.parent || emptyObject)
        .textHistory || emptyList)[0] || emptyObject)
        .createdAt;

@connect(mapStateToProps)
@RequestCoordinator
@RequestClient(requests)
export default class EntryCommentModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            entryCommentsGet,
        } = this.props;

        entryCommentsGet.setDefaultParams({
            onCommentsGet: this.handleCommentsGet,
        });

        this.state = {
            activeTabKey: UNRESOLVED,
            comments: [],
            currentEdit: undefined,
            faramValues: {},
            faramErrors: {},
            pristine: true,
        };
    }

    getTabs = (resolvedThreads, unresolvedThreads) => {
        const tabs = {
            [UNRESOLVED]: _ts('entryComments', 'unresolvedTitle', { count: unresolvedThreads.length }),
        };

        if (resolvedThreads.length > 0) {
            tabs[RESOLVED] = _ts('entryComments', 'resolvedTitle', { count: resolvedThreads.length });
        }

        return tabs;
    }

    getCommentsByThreads = (allComments) => {
        const parentList = allComments.filter(c => isNotDefined(c.parent));
        const childrenList = allComments.filter(c => isDefined(c.parent));

        const childrenGroup = listToGroupList(
            childrenList,
            d => d.parent,
        );

        const threads = parentList.map(p => ({
            key: p.id,
            isResolved: p.isResolved,
            parent: p,
            children: childrenGroup[p.id],
        }));

        const resolvedThreads = threads
            .filter(t => t.isResolved)
            .sort((a, b) => compareDate(getParentDate(a), getParentDate(b)));

        const unresolvedThreads = threads
            .filter(t => !t.isResolved)
            .sort((a, b) => compareDate(getParentDate(a), getParentDate(b)));

        return { resolvedThreads, unresolvedThreads };
    }

    handleTabClick = (tab) => {
        this.setState({ activeTabKey: tab });
    }

    handleInvalidate = (container) => {
        const {
            // eslint-disable-next-line react/prop-types
            parentBCR: {
                // eslint-disable-next-line react/prop-types
                top: parentBCRTop,
                // eslint-disable-next-line react/prop-types
                left: parentBCRLeft,
            },
        } = this.props;

        const contentRect = container.getBoundingClientRect();

        const windowRect = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        let topCalc = parentBCRTop;
        let leftCalc = parentBCRLeft - contentRect.width;

        if (leftCalc < 0) {
            leftCalc = WINDOW_PADDING;
        }

        if ((topCalc + contentRect.height) > (windowRect.height - WINDOW_PADDING)) {
            topCalc -= ((contentRect.height + topCalc + WINDOW_PADDING) - windowRect.height);
        }

        const optionsContainerPosition = {
            top: `${topCalc}px`,
            left: `${leftCalc}px`,
        };

        return optionsContainerPosition;
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    }

    handleFaramValidationSuccess = (values) => {
        const {
            entryServerId,
            commentCreateRequest,
        } = this.props;

        const body = {
            ...values,
            entry: entryServerId,
        };

        commentCreateRequest.do({
            body,
            onAddSuccess: this.handleCommentAdd,
        });

        this.setState({
            currentEdit: undefined,
            pristine: true,
        });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    handleClearClick = () => {
        const { comments } = this.state;
        const { unresolvedThreads } = this.getCommentsByThreads(comments);

        if (unresolvedThreads.length === 0) {
            this.setState({
                faramValues: {},
                pristine: true,
            });
        } else {
            this.setState({ currentEdit: undefined });
        }
    }

    handleNewThreadClick = () => {
        this.setState({
            currentEdit: 'new-thread',
            activeTabKey: UNRESOLVED,
        });
    }

    handleCommentsGet = (comments) => {
        this.setState({ comments });
    }

    handleEditComment = (commentId, values) => {
        const { comments } = this.state;
        const {
            onCommentsCountChange,
            entryServerId,
        } = this.props;

        const newComments = [
            ...comments.filter(c => c.id !== commentId),
            values,
        ];

        this.setState({ comments: newComments });

        const {
            resolvedThreads,
            unresolvedThreads,
        } = this.getCommentsByThreads(newComments);

        onCommentsCountChange(unresolvedThreads.length, resolvedThreads.length, entryServerId);
    }

    handleDeleteComment = (commentId) => {
        const { comments } = this.state;
        const {
            onCommentsCountChange,
            entryServerId,
        } = this.props;

        const newComments = comments.filter(c => c.id !== commentId);
        this.setState({ comments: newComments });

        const {
            resolvedThreads,
            unresolvedThreads,
        } = this.getCommentsByThreads(newComments);

        onCommentsCountChange(unresolvedThreads.length, resolvedThreads.length, entryServerId);
    }

    handleCommentAdd = (comment) => {
        const { comments } = this.state;
        const {
            onCommentsCountChange,
            entryServerId,
        } = this.props;

        const newComments = [
            ...comments,
            comment,
        ];

        this.setState({
            comments: newComments,
            faramValues: {},
            faramErrors: {},
            pristine: true,
        });

        const {
            resolvedThreads,
            unresolvedThreads,
        } = this.getCommentsByThreads(newComments);

        onCommentsCountChange(unresolvedThreads.length, resolvedThreads.length, entryServerId);
    }

    handleCurrentEditChange = (currentEdit) => {
        this.setState({ currentEdit });
    }

    threadRendererParams = (key, thread) => {
        const { currentEdit } = this.state;

        const {
            projectMembersGet: {
                response: {
                    results: members = [],
                } = {},
            },
            entryServerId,
        } = this.props;

        return ({
            className: styles.thread,
            entryId: entryServerId,
            threadId: key,
            onCurrentEditChange: this.handleCurrentEditChange,
            comments: thread,
            currentEdit,
            members,
            onAdd: this.handleCommentAdd,
            onEdit: this.handleEditComment,
            onDelete: this.handleDeleteComment,
        });
    }

    resolvedThreadRendererParams = (key, thread) => ({
        className: styles.thread,
        comments: thread,
        isResolved: true,
    });

    render() {
        const {
            className,
            closeModal,
            entryCommentsGet: {
                pending: commentsPending,
            },
            commentCreateRequest: {
                pending: commentCreationPending,
            },
            projectMembersGet: {
                response: {
                    results: members = emptyList,
                } = emptyObject,
                pending: membersPending,
            },
        } = this.props;

        if (commentsPending || membersPending) {
            return null;
        }

        const {
            comments: allComments,
            faramValues,
            faramErrors,
            currentEdit,
            pristine,
            activeTabKey,
        } = this.state;

        const {
            resolvedThreads,
            unresolvedThreads,
        } = this.getCommentsByThreads(allComments);

        const showCommentForm =
            activeTabKey === UNRESOLVED &&
            (unresolvedThreads.length === 0 || currentEdit === 'new-thread');

        const cancelButtonLabel = unresolvedThreads.length === 0
            ? _ts('entryComments', 'commentFaramClearButtonLabel')
            : _ts('entryComments', 'commentFaramCancelButtonLabel');

        const tabs = this.getTabs(resolvedThreads, unresolvedThreads);
        const threads = activeTabKey === UNRESOLVED ? unresolvedThreads : resolvedThreads;
        const rendererParams = activeTabKey === UNRESOLVED
            ? this.threadRendererParams
            : this.resolvedThreadRendererParams;

        return (
            <FloatingContainer
                className={_cs(className, styles.container)}
                onInvalidate={this.handleInvalidate}
                onClose={closeModal}
                focusTrap
                closeOnEscape
                showHaze
            >
                <div className={styles.header}>
                    <div className={styles.topHeader}>
                        <h3 className={styles.heading}>
                            {_ts('entryComments', 'commentsHeader')}
                        </h3>
                        <Button
                            iconName="close"
                            onClick={closeModal}
                            transparent
                        />
                    </div>
                    <ScrollTabs
                        className={styles.tabs}
                        active={activeTabKey}
                        tabs={tabs}
                        itemClassName={styles.tab}
                        onClick={this.handleTabClick}
                    >
                        <div className={styles.buttons}>
                            {unresolvedThreads.length > 0 &&
                                <Button
                                    onClick={this.handleNewThreadClick}
                                    iconName="add"
                                    transparent
                                    disabled={currentEdit === 'new-thread'}
                                >
                                    {_ts('entryComments', 'newThreadButtonLabel')}
                                </Button>
                            }
                        </div>
                    </ScrollTabs>
                </div>
                <div className={styles.content}>
                    <ListView
                        className={styles.threads}
                        data={threads}
                        keySelector={threadsKeySelector}
                        renderer={Thread}
                        rendererParams={rendererParams}
                        emptyComponent={EmptyComponent}
                    />
                    {showCommentForm && (
                        <CommentFaram
                            className={styles.newComment}
                            pending={commentCreationPending}
                            pristine={pristine}
                            onChange={this.handleFaramChange}
                            onValidationFailure={this.handleFaramValidationFailure}
                            onValidationSuccess={this.handleFaramValidationSuccess}
                            faramValues={faramValues}
                            faramErrors={faramErrors}
                            hasAssignee
                            onCancelClick={this.handleClearClick}
                            members={members}
                            commentButtonLabel={_ts('entryComments', 'commentFaramCommentButtonLabel')}
                            cancelButtonLabel={cancelButtonLabel}
                        />
                    )}
                </div>
            </FloatingContainer>
        );
    }
}
