import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import {
    RequestClient,
    requestMethods,
} from '#request';
import ListView from '#rscv/List/ListView';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import _ts from '#ts';

import CommentFaram from '../CommentFaram';
import Comment from './Comment';

import styles from './styles.scss';

const propTypes = {
    comments: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    members: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    entryId: PropTypes.number,
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    commentCreateRequest: PropTypes.object.isRequired,
    onAdd: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

const defaultProps = {
    entryId: undefined,
    className: undefined,
    comments: {},
    members: [],
};

const requests = {
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
};

const childrenKeySelector = c => c.id;

@RequestClient(requests)
export default class EntryCommentThread extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showReplyBox: false,
            faramValues: {},
            faramErrors: {},
            type: 'reply',
        };
    }

    childRendererParams = (key, data) => {
        const {
            onEdit,
            onDelete,
            members,
        } = this.props;

        return ({
            commentId: key,
            className: styles.comment,
            userDetails: data.createdByDetail,
            assigneeDetail: data.assigneeDetail,
            text: data.text,
            textHistory: data.textHistory,
            members,
            onEdit,
            onDelete,
        });
    }

    handleFaramChange = (values, errors) => {
        this.setState({
            faramValues: values,
            faramErrors: errors,
        });
    }

    handleFaramValidationSuccess = (_, values) => {
        const {
            commentCreateRequest,
            entryId,
            comments: {
                parent: {
                    id: parentId,
                } = {},
            },
        } = this.props;
        const {
            type,
        } = this.state;

        const body = {
            ...values,
            entry: entryId,
        };
        if (type === 'reply') {
            body.parent = parentId;
        }
        commentCreateRequest.do({
            body,
            onAddSuccess: this.handleCommentAdd,
        });
    }

    handleCommentAdd = (response) => {
        const {
            onAdd,
        } = this.props;

        onAdd(response);

        this.setState({
            showReplyBox: false,
            faramValues: {},
            faramErrors: {},
        });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    handleReplyClick = () => {
        this.setState({
            showReplyBox: true,
            type: 'reply',
        });
    }

    handleReplyCancelClick = () => {
        this.setState({
            showReplyBox: false,
            type: undefined,
        });
    }

    render() {
        const {
            className,
            comments: {
                parent = {},
                children,
            },
            commentCreateRequest: {
                pending,
            },
            members,
            onEdit,
            onDelete,
        } = this.props;

        const {
            showReplyBox,
            faramValues,
            faramErrors,
        } = this.state;

        const {
            createdByDetail,
            text,
            textHistory,
            assigneeDetail,
            id: parentId,
        } = parent;

        return (
            <div className={_cs(className, styles.thread)}>
                <div className={styles.parent}>
                    <Comment
                        commentId={parentId}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        className={styles.comment}
                        userDetails={createdByDetail}
                        assigneeDetail={assigneeDetail}
                        text={text}
                        textHistory={textHistory}
                        members={members}
                        isParent
                    />
                </div>
                <ListView
                    data={children}
                    className={styles.childrenList}
                    keySelector={childrenKeySelector}
                    rendererParams={this.childRendererParams}
                    renderer={Comment}
                />
                {showReplyBox ? (
                    <CommentFaram
                        className={styles.form}
                        pending={pending}
                        onChange={this.handleFaramChange}
                        onValidationFailure={this.handleFaramValidationFailure}
                        onValidationSuccess={this.handleFaramValidationSuccess}
                        faramValues={faramValues}
                        faramErrors={faramErrors}
                        onCancelClick={this.handleReplyCancelClick}
                        hasAssignee={false}
                        members={members}
                        commentButtonLabel={_ts('entryComments', 'replyFaramReplyButtonLabel')}
                        cancelButtonLabel={_ts('entryComments', 'replyFaramCancelButtonLabel')}
                    />
                ) : (
                    <div className={styles.newComment}>
                        <PrimaryButton
                            onClick={this.handleReplyClick}
                            type="button"
                        >
                            {_ts('entryComments', 'replyButtonLabel')}
                        </PrimaryButton>
                    </div>
                )}
            </div>
        );
    }
}
