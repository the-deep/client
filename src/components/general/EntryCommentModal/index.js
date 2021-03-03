import PropTypes from 'prop-types';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
    compareDate,
    bound,
} from '@togglecorp/fujs';
import { connect } from 'react-redux';
import React from 'react';

import FloatingContainer from '#rscv/FloatingContainer';
import ScrollTabs from '#rscv/ScrollTabs';
import Button from '#rsca/Button';
import Confirm from '#rscv/Modal/Confirm';
import ListView from '#rscv/List/ListView';
import {
    projectIdFromRouteSelector,
} from '#redux';
import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import notify from '#notify';
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
    onCommentsCountChange: PropTypes.func.isRequired,
    defaultAssignees: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    parentBCR: PropTypes.shape({
        top: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    parentBCR: undefined,
    className: undefined,
    projectId: undefined,
    entryServerId: undefined,
    closeModal: undefined,
    defaultAssignees: undefined,
};

const RESOLVED = 'resolved';
const UNRESOLVED = 'unresolved';

const WINDOW_PADDING = 24;

const requestOptions = {
    entryCommentsGet: {
        url: ({ props: { entryServerId } }) => `/entries/${entryServerId}/entry-comments/`,
        method: methods.GET,
        onMount: true,
        onSuccess: ({ params: { onCommentsGet }, response }) => {
            onCommentsGet(response.results);
        },
        onFailure: ({ error: { messageForNotification } }) => {
            notify.send({
                title: _ts('entryComments', 'entryCommentTitle'),
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
        onPropsChanged: ['entryServerId'],
        extras: {
            schemaName: 'entryComments',
        },
    },
    commentCreateRequest: {
        url: ({ props: { entryServerId } }) => `/entries/${entryServerId}/entry-comments/`,
        method: methods.POST,
        body: ({ params: { body } }) => body,
        onSuccess: ({
            response,
            params: { onAddSuccess },
        }) => {
            onAddSuccess(response);
        },
        onFailure: ({ error: { messageForNotification } }) => {
            notify.send({
                title: _ts('entryComments', 'entryCommentTitle'),
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'entryComment',
        },
    },
    projectMembersGet: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/members/`,
        method: methods.GET,
        fields: ['id', 'display_name'],
        query: {
        },
        onMount: true,
        onPropsChanged: ['project'],
        onFailure: ({ error: { messageForNotification } }) => {
            notify.send({
                title: _ts('entryComments', 'entryCommentTitle'),
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'projectMembers',
        },
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
@RequestClient(requestOptions)
export default class EntryCommentModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            requests: {
                entryCommentsGet,
            },
            defaultAssignees,
            parentBCR: {
                top,
                left,
            } = {},
        } = props;

        entryCommentsGet.setDefaultParams({
            onCommentsGet: this.handleCommentsGet,
        });

        this.state = {
            activeTabKey: UNRESOLVED,
            comments: [],
            currentEdit: undefined,
            faramValues: {
                assignees: defaultAssignees,
            },
            faramErrors: {},
            globalPristine: true,
            pristine: true,
            showConfirm: false,
            position: {
                top,
                left,
            },
        };

        this.containerRef = React.createRef();
    }

    componentDidMount() {
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
    }

    setGlobalPristine = (globalPristine) => {
        this.setState({ globalPristine });
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

    handleMouseMove = (e) => {
        if (!this.mouseDownOnHeader) {
            return;
        }
        const dx = e.clientX - this.mouseDownPosition.x;
        const dy = e.clientY - this.mouseDownPosition.y;

        const { position } = this.state;
        const { current } = this.containerRef;
        const { width, height } = current.getBoundingClientRect();
        const maxX = window.innerWidth - width;
        const maxY = window.innerHeight - height;

        this.setState({
            position: {
                top: bound(position.top + dx, 0, maxX),
                left: bound(position.left + dy, 0, maxY),
            },
        });


        const getNumericPart = d => parseFloat(d.substr(0, d.length - 2));

        const left = getNumericPart(String(current.style.left));
        const top = getNumericPart(String(current.style.top));
        current.style.left = `${bound(left + dx, 0, maxX)}px`;
        current.style.top = `${bound(top + dy, 0, maxY)}px`;

        this.mouseDownPosition = {
            x: e.clientX,
            y: e.clientY,
        };
    }

    handleMouseUp = () => {
        this.mouseDownOnHeader = false;
    }


    handleHeaderMouseDown = (e) => {
        this.mouseDownOnHeader = true;
        this.mouseDownPosition = {
            x: e.clientX,
            y: e.clientY,
        };
    }

    handleTabClick = (tab) => {
        this.setState({ activeTabKey: tab });
    }

    handleCommentsClose = () => {
        const { globalPristine } = this.state;
        const { closeModal } = this.props;

        if (!globalPristine) {
            this.setState({ showConfirm: true });
        } else if (isDefined(closeModal)) {
            closeModal();
        }
    }

    handleCloseConfirmation = (confirm) => {
        const { closeModal } = this.props;

        if (!confirm) {
            this.setState({ showConfirm: false });
        } else if (isDefined(closeModal)) {
            closeModal();
        }
    }

    handleInvalidate = (container) => {
        const {
            position: {
                top: parentBCRTop,
                left: parentBCRLeft,
            },
        } = this.state;

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
            globalPristine: false,
        });
    }

    handleFaramValidationSuccess = (values) => {
        const {
            entryServerId,
            requests: {
                commentCreateRequest,
            },
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
            globalPristine: true,
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
                globalPristine: true,
            });
        } else {
            this.setState({
                faramValues: {},
                pristine: true,
                globalPristine: true,
                currentEdit: undefined,
            });
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
            globalPristine: true,
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
            requests: {
                projectMembersGet: {
                    response: {
                        results: members = [],
                    } = {},
                },
            },
            entryServerId,
        } = this.props;

        return ({
            className: styles.thread,
            entryId: entryServerId,
            threadId: key,
            onCurrentEditChange: this.handleCurrentEditChange,
            setGlobalPristine: this.setGlobalPristine,
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
            requests: {
                entryCommentsGet: { pending: commentsPending },
                commentCreateRequest: { pending: commentCreationPending },
                projectMembersGet: {
                    response: {
                        results: members = emptyList,
                    } = emptyObject,
                    pending: membersPending,
                },
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
            showConfirm,
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
            <React.Fragment>
                <FloatingContainer
                    elementRef={this.containerRef}
                    className={_cs(className, styles.container)}
                    onInvalidate={this.handleInvalidate}
                    onClose={this.handleCommentsClose}
                    focusTrap
                    closeOnEscape
                    showHaze
                >
                    <div
                        role="presentation"
                        className={styles.header}
                        onMouseDown={this.handleHeaderMouseDown}
                    >
                        <div className={styles.topHeader}>
                            <h3 className={styles.heading}>
                                {_ts('entryComments', 'commentsHeader')}
                            </h3>
                            <Button
                                iconName="close"
                                onClick={this.handleCommentsClose}
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
                                <Button
                                    onClick={this.handleNewThreadClick}
                                    iconName="add"
                                    transparent
                                    disabled={
                                        isDefined(currentEdit) || unresolvedThreads.length === 0
                                    }
                                >
                                    {_ts('entryComments', 'newThreadButtonLabel')}
                                </Button>
                            </div>
                        </ScrollTabs>
                    </div>
                    <div className={styles.content}>
                        {threads.length > 0 && (
                            <ListView
                                className={styles.threads}
                                data={threads}
                                keySelector={threadsKeySelector}
                                renderer={Thread}
                                rendererParams={rendererParams}
                                emptyComponent={EmptyComponent}
                            />
                        )}
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
                <Confirm
                    className={styles.confirm}
                    show={showConfirm}
                    closeOnEscape={false}
                    closeOnOutsideClick={false}
                    onClose={this.handleCloseConfirmation}
                >
                    {_ts('common', 'youHaveUnsavedChanges2')}
                </Confirm>
            </React.Fragment>
        );
    }
}
