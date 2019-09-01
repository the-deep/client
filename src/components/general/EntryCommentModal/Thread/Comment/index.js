import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';

import {
    RequestClient,
    requestMethods,
} from '#request';

import {
    activeUserSelector,
} from '#redux';

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
    // eslint-disable-next-line react/forbid-prop-types
    commentDeleteRequest: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    commentEditRequest: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    commentResolveRequest: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    currentEdit: PropTypes.string,
    onCurrentEditChange: PropTypes.func.isRequired,
};

const defaultProps = {
    currentEdit: undefined,
    className: undefined,
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

const requests = {
    commentEditRequest: {
        url: ({ props: { commentId } }) => `/entry-comments/${commentId}/`,
        method: requestMethods.PATCH,
        body: ({ params: { body } }) => body,
        onSuccess: ({
            response,
            params: { onEditSuccess },
        }) => {
            onEditSuccess(response);
        },
        schemaName: 'entryComment',
    },
    commentDeleteRequest: {
        url: ({ props: { commentId } }) => `/entry-comments/${commentId}/`,
        method: requestMethods.DELETE,
        onSuccess: ({
            params: { onDelete },
            props: {
                isParent,
                commentId,
            },
        }) => {
            onDelete(commentId, isParent);
        },
    },
    commentResolveRequest: {
        url: ({ props: { commentId } }) => `/entry-comments/${commentId}/resolved/`,
        method: requestMethods.POST,
        onSuccess: ({
            params: { onEditSuccess },
            response,
        }) => {
            onEditSuccess(response);
        },
        schemaName: 'entryComment',
    },
};

@connect(mapStateToProps)
@RequestClient(requests)
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
        this.props.onCurrentEditChange(this.commentEditId);
    };

    handleResolveClick = () => {
        const { commentResolveRequest } = this.props;
        commentResolveRequest.do({
            onEditSuccess: this.handleEditSuccess,
        });
    };

    handleDeleteClick = () => {
        this.setState({ deleteMode: true });
    };

    handleDeleteConfirmClose = (doDelete) => {
        const {
            commentDeleteRequest,
            onDelete,
        } = this.props;

        if (doDelete) {
            commentDeleteRequest.do({ onDelete });
        }
        this.setState({ deleteMode: false });
    }

    handleFaramChange = (values, errors) => {
        let pristine = false;

        const {
            text,
            assigneeDetail,
        } = this.props;

        if (values.text === text && values.assignee === assigneeDetail.id) {
            pristine = true;
        }

        this.setState({
            faramValues: values,
            faramErrors: errors,
            pristine,
        });
    }

    handleFaramValidationSuccess = (_, values) => {
        const { commentEditRequest } = this.props;

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
        } = this.props;

        onEdit(commentId, values, isParent);
        onCurrentEditChange(undefined);

        this.setState({
            pristine: true,
        });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: true,
        });
    }

    handleCancelClick = () => {
        this.props.onCurrentEditChange(undefined);
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
            commentEditRequest: {
                pending: editPending,
            },
            commentDeleteRequest: {
                pending: deletePending,
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

        return (
            <div className={_cs(className, styles.comment)}>
                {deletePending && <LoadingAnimation />}
                <UserDetailActionBar
                    userDetails={userDetails}
                    textHistory={textHistory}
                    onEditClick={this.handleEditClick}
                    onResolveClick={this.handleResolveClick}
                    onDeleteClick={this.handleDeleteClick}
                    isParent={isParent}
                    hideActions={hideActions}
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
