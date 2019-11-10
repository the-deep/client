import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import {
    RequestClient,
    methods,
} from '#request';

import {
    activeUserSelector,
} from '#redux';
import notify from '#notify';

import Confirm from '#rscv/Modal/Confirm';
import LoadingAnimation from '#rscv/LoadingAnimation';
import _ts from '#ts';

import UserDetailActionBar from '../UserDetailActionBar';
import CommentFaram from '../../CommentFaram';

import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,
    text: PropTypes.string,
    // eslint-disable-next-line react/no-unused-prop-types
    commentId: PropTypes.number.isRequired,
    userDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    assigneeDetail: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    isParent: PropTypes.bool,
    isResolved: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    textHistory: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    members: PropTypes.array,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    currentEdit: PropTypes.string,
    onCurrentEditChange: PropTypes.func,
    setGlobalPristine: PropTypes.func,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    currentEdit: undefined,
    setGlobalPristine: undefined,
    className: undefined,
    onCurrentEditChange: undefined,
    text: '',
    isParent: false,
    isResolved: false,
    userDetails: {},
    assigneeDetail: {},
    members: [],
};

const mapStateToProps = state => ({
    activeUser: activeUserSelector(state),
});

const requestOptions = {
    commentEditRequest: {
        url: ({ props: { commentId } }) => `/entry-comments/${commentId}/`,
        method: methods.PATCH,
        body: ({ params: { body } }) => body,
        onSuccess: ({
            response,
            params: { onEditSuccess },
        }) => {
            onEditSuccess(response);
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
    commentDeleteRequest: {
        url: ({ props: { commentId } }) => `/entry-comments/${commentId}/`,
        method: methods.DELETE,
        onSuccess: ({
            params: { onDelete },
            props: {
                isParent,
                commentId,
            },
        }) => {
            onDelete(commentId, isParent);
        },
        onFailure: ({ error: { messageForNotification } }) => {
            notify.send({
                title: _ts('entryComments', 'entryCommentTitle'),
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
    },
    commentResolveRequest: {
        url: ({ props: { commentId } }) => `/entry-comments/${commentId}/resolve/`,
        method: methods.POST,
        onSuccess: ({
            params: { onEditSuccess },
            response,
        }) => {
            onEditSuccess(response);
        },
        extras: {
            schemaName: 'entryComment',
        },
        onFailure: ({ error: { messageForNotification } }) => {
            notify.send({
                title: _ts('entryComments', 'entryCommentTitle'),
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
    },
};

@connect(mapStateToProps)
@RequestClient(requestOptions)
export default class Comment extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            text,
            assigneeDetail,
            commentId,
        } = this.props;

        this.state = {
            deleteMode: false,
            faramValues: {
                text,
                assignee: assigneeDetail.id,
            },
            faramErrors: {},
            pristine: true,
        };

        this.commentEditId = `${commentId}-edit`;
    }

    handleEditClick = () => {
        const { onCurrentEditChange } = this.props;

        if (onCurrentEditChange) {
            onCurrentEditChange(this.commentEditId);
        }
    };

    handleResolveClick = () => {
        const {
            requests: {
                commentResolveRequest,
            },
        } = this.props;
        commentResolveRequest.do({
            onEditSuccess: this.handleEditSuccess,
        });
    };

    handleDeleteClick = () => {
        this.setState({ deleteMode: true });
    };

    handleDeleteConfirmClose = (doDelete) => {
        const {
            requests: {
                commentDeleteRequest,
            },
            onDelete,
        } = this.props;

        if (doDelete) {
            commentDeleteRequest.do({ onDelete });
        }
        this.setState({ deleteMode: false });
    }

    handleFaramChange = (values, errors) => {
        const {
            text,
            assigneeDetail,
            setGlobalPristine,
        } = this.props;

        // NOTE: This is to prevent unnecessary edits
        const pristine = values.text === text && values.assignee === assigneeDetail.id;

        this.setState({
            faramValues: values,
            faramErrors: errors,
            pristine,
        });

        if (setGlobalPristine) {
            setGlobalPristine(pristine);
        }
    }

    handleFaramValidationSuccess = (_, values) => {
        const {
            requests: {
                commentEditRequest,
            },
        } = this.props;

        commentEditRequest.do({
            body: values,
            onEditSuccess: this.handleEditSuccess,
        });
    }

    handleEditSuccess = (values) => {
        const {
            commentId,
            isParent,
            onEdit,
            onCurrentEditChange,
            setGlobalPristine,
        } = this.props;

        onEdit(commentId, values, isParent);

        if (onCurrentEditChange) {
            onCurrentEditChange(undefined);
        }

        this.setState({
            pristine: true,
        });

        if (setGlobalPristine) {
            setGlobalPristine(true);
        }
    }

    handleFaramValidationFailure = (faramErrors) => {
        const { setGlobalPristine } = this.props;

        this.setState({
            faramErrors,
            pristine: true,
        });

        if (setGlobalPristine) {
            setGlobalPristine(true);
        }
    }

    handleCancelClick = () => {
        const {
            onCurrentEditChange,
            setGlobalPristine,
        } = this.props;

        this.setState({
            faramValues: {},
            faramErrors: {},
            pristine: true,
        });

        if (onCurrentEditChange) {
            onCurrentEditChange(undefined);
        }
        if (setGlobalPristine) {
            setGlobalPristine(true);
        }
    };

    render() {
        const {
            className,
            isParent,
            text,
            textHistory,
            userDetails,
            members,
            isResolved,
            activeUser: {
                userId: activeUserId,
            },
            assigneeDetail: {
                name: assigneeName,
            },
            requests: {
                commentEditRequest: { pending: editPending },
                commentDeleteRequest: { pending: deletePending },
            },
            currentEdit,
        } = this.props;

        const {
            faramValues,
            faramErrors,
            pristine,
            deleteMode,
        } = this.state;

        const deleteConfirmMessage = isParent
            ? _ts('entryComments', 'parentDeleteConfirmMessage')
            : _ts('entryComments', 'replyDeleteConfirmMessage');

        const hideActions = (activeUserId !== userDetails.id) || isResolved;
        const editMode = currentEdit === this.commentEditId;
        const hideEdit = isDefined(currentEdit);

        return (
            <div
                className={
                    _cs(
                        className,
                        styles.comment,
                        !isParent && styles.child,
                    )
                }
            >
                {deletePending && <LoadingAnimation />}
                <UserDetailActionBar
                    userDetails={userDetails}
                    textHistory={textHistory}
                    onEditClick={this.handleEditClick}
                    onResolveClick={this.handleResolveClick}
                    onDeleteClick={this.handleDeleteClick}
                    isParent={isParent}
                    hideActions={hideActions}
                    hideEdit={hideEdit}
                />
                {editMode ? (
                    <CommentFaram
                        pending={editPending}
                        pristine={pristine}
                        onChange={this.handleFaramChange}
                        onValidationFailure={this.handleFaramValidationFailure}
                        onValidationSuccess={this.handleFaramValidationSuccess}
                        faramValues={faramValues}
                        faramErrors={faramErrors}
                        hasAssignee={isParent}
                        onCancelClick={this.handleCancelClick}
                        members={members}
                        commentButtonLabel={_ts('entryComments', 'editFaramSaveButtonLabel')}
                        cancelButtonLabel={_ts('entryComments', 'editFaramCancelButtonLabel')}
                    />
                ) : (
                    <React.Fragment>
                        <div className={styles.commentText}>
                            {text}
                        </div>
                        {(isParent && assigneeName) && (
                            <div className={styles.assignee}>
                                {_ts('entryComments', 'assignedTo', { name: assigneeName })}
                            </div>
                        )}
                    </React.Fragment>
                )}
                <Confirm
                    className={styles.confirmModal}
                    onClose={this.handleDeleteConfirmClose}
                    show={deleteMode}
                >
                    {deleteConfirmMessage}
                </Confirm>
            </div>
        );
    }
}
