import PropTypes from 'prop-types';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
} from '@togglecorp/fujs';
import { connect } from 'react-redux';
import React from 'react';

import FloatingContainer from '#rscv/FloatingContainer';
import Button from '#rsca/Button';
import ListView from '#rscv/List/ListView';
import {
    calcFloatPositionInMainWindow,
    defaultOffset,
    defaultLimit,
} from '#rsu/bounds';
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
};

const defaultProps = {
    className: undefined,
    projectId: undefined,
    entryServerId: undefined,
    closeModal: () => {},
};

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
            comments: [],
            startingNewThread: false,
            faramValues: {},
            faramErrors: {},
            pristine: true,
        };
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
            parent: p,
            children: childrenGroup[p.id],
        }));

        return threads;
    }

    handleInvalidate = (container) => {
        // Note: pass through prop
        // eslint-disable-next-line react/prop-types
        const { parentBCR } = this.props;

        const contentRect = container.getBoundingClientRect();

        const optionsContainerPosition = (
            calcFloatPositionInMainWindow({
                parentRect: parentBCR,
                contentRect,
                defaultOffset,
                limit: {
                    ...defaultLimit,
                    minW: 240,
                    maxW: 360,
                },
            })
        );

        return optionsContainerPosition;
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    }

    handleFaramValidationSuccess = (_, values) => {
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
            startingNewThread: false,
            pristine: true,
        });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    handleClearClick = () => {
        const { comments } = this.state;
        if (comments.length === 0) {
            this.setState({
                faramValues: {},
                pristine: true,
            });
        } else {
            this.setState({ startingNewThread: false });
        }
    }

    handleNewThreadClick = () => {
        this.setState({ startingNewThread: true });
    }

    handleCommentsGet = (comments) => {
        this.setState({ comments });
    }

    handleEditComment = (commentId, values, isParent) => {
        const { comments } = this.state;
        const newComments = comments.filter(c => c.id !== commentId);
        newComments.push(values);
        this.setState({ comments: newComments });
    }

    handleDeleteComment = (commentId, isParent) => {
        const { comments } = this.state;
        const newComments = comments.filter(c => c.id !== commentId);
        this.setState({ comments: newComments });
    }

    handleCommentAdd = (comment) => {
        const { comments } = this.state;

        const newComments = [
            ...comments,
            comment,
        ];

        this.setState({ comments: newComments });
    }

    threadRendererParams = (key, thread) => {
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
            comments: thread,
            members,
            onAdd: this.handleCommentAdd,
            onEdit: this.handleEditComment,
            onDelete: this.handleDeleteComment,
        });
    }

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
                    results: members = [],
                } = {},
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
            startingNewThread,
            pristine,
        } = this.state;

        const threads = this.getCommentsByThreads(allComments);
        const showCommentForm = threads.length === 0 || startingNewThread;

        const cancelButtonLabel = threads.length === 0
            ? _ts('entryComments', 'commentFaramClearButtonLabel')
            : _ts('entryComments', 'commentFaramCancelButtonLabel');

        return (
            <FloatingContainer
                className={_cs(className, styles.container)}
                onInvalidate={this.handleInvalidate}
                onClose={closeModal}
                focusTrap
                closeOnEscape
            >
                <div className={styles.header}>
                    <h4 className={styles.heading}>
                        Comments
                    </h4>
                    <div className={styles.buttons}>
                        {threads.length > 0 &&
                            <Button
                                onClick={this.handleNewThreadClick}
                                transparent
                            >
                                {_ts('entryComments', 'newThreadButtonLabel')}
                            </Button>
                        }
                        <Button
                            iconName="close"
                            onClick={closeModal}
                            transparent
                        />
                    </div>
                </div>
                <ListView
                    className={styles.threads}
                    data={threads}
                    keySelector={threadsKeySelector}
                    renderer={Thread}
                    rendererParams={this.threadRendererParams}
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
            </FloatingContainer>
        );
    }
}
