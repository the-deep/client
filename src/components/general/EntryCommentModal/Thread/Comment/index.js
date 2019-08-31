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
    // eslint-disable-next-line react/forbid-prop-types
    textHistory: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    members: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    commentDeleteRequest: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    commentEditRequest: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: undefined,
    text: '',
    isParent: false,
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
        } = this.props;

        this.state = {
            editMode: false,
            deleteMode: false,
            faramValues: {
                text,
                assignee: assigneeDetail.id,
            },
            faramErrors: {},
            pristine: true,
        };
    }

    handleEditClick = () => {
        this.setState({ editMode: true });
    };

    handleResolveClick = () => {
        console.warn('resolve clicking');
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
        } = this.props;

        onEdit(commentId, values, isParent);
        this.setState({
            editMode: false,
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
        this.setState({ editMode: false });
    };

    render() {
        const {
            className,
            isParent,
            text,
            textHistory,
            userDetails,
            members,
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
        } = this.props;

        const {
            faramValues,
            faramErrors,
            pristine,
            editMode,
            deleteMode,
        } = this.state;

        const deleteConfirmMessage = isParent
            ? _ts('entryComments', 'parentDeleteConfirmMessage')
            : _ts('entryComments', 'replyDeleteConfirmMessage');

        const hideActions = activeUserId !== userDetails.id;
        console.warn(this.props.activeUser, activeUserId, userDetails);

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
                    onClose={this.handleDeleteConfirmClose}
                    show={deleteMode}
                >
                    {deleteConfirmMessage}
                </Confirm>
            </div>
        );
    }
}
