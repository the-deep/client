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

const EmptyComponent = () => null;

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

        const body = {
            ...values,
            entry: entryId,
            parent: parentId,
        };

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
        });
    }

    handleReplyCancelClick = () => {
        this.setState({
            showReplyBox: false,
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
                <Comment
                    className={styles.parent}
                    commentId={parentId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    userDetails={createdByDetail}
                    assigneeDetail={assigneeDetail}
                    text={text}
                    textHistory={textHistory}
                    members={members}
                    isParent
                />
                <ListView
                    data={children}
                    className={styles.childrenList}
                    keySelector={childrenKeySelector}
                    rendererParams={this.childRendererParams}
                    renderer={Comment}
                    emptyComponent={EmptyComponent}
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
                            className={styles.button}
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
