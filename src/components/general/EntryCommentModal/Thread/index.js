import React from 'react';
import PropTypes from 'prop-types';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import {
    RequestClient,
    methods,
} from '#request';
import ListView from '#rscv/List/ListView';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import notify from '#notify';
import _ts from '#ts';

import CommentFaram from '../CommentFaram';
import Comment from './Comment';

import styles from './styles.scss';

const EmptyComponent = () => null;

const propTypes = {
    comments: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    members: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    entryId: PropTypes.number,
    threadId: PropTypes.number,
    className: PropTypes.string,
    onAdd: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    isResolved: PropTypes.bool,
    currentEdit: PropTypes.string,
    onCurrentEditChange: PropTypes.func,
    setGlobalPristine: PropTypes.func,
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    currentEdit: undefined,
    setGlobalPristine: undefined,
    isResolved: false,
    entryId: undefined,
    threadId: undefined,
    className: undefined,
    onCurrentEditChange: undefined,
    onAdd: () => {},
    onEdit: () => {},
    onDelete: () => {},
    comments: {},
    members: [],
};

const requestOptions = {
    commentCreateRequest: {
        url: '/entry-comments/',
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
};

const childrenKeySelector = c => c.id;

const emptyObject = {};
const emptyList = [];

@RequestClient(requestOptions)
export default class EntryCommentThread extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { threadId } = this.props;

        this.state = {
            faramValues: {},
            faramErrors: {},
            pristine: true,
        };

        this.threadReplyId = `${threadId}-new`;
    }

    childRendererParams = (key, data) => {
        const {
            onEdit,
            onDelete,
            members,
            isResolved,
            currentEdit,
            onCurrentEditChange,
            setGlobalPristine,
        } = this.props;

        return ({
            onCurrentEditChange,
            setGlobalPristine,
            currentEdit,
            commentId: key,
            userDetails: data.createdByDetail,
            assigneeDetail: data.assigneeDetail,
            text: data.text,
            textHistory: data.textHistory,
            isResolved,
            members,
            onEdit,
            onDelete,
        });
    }

    handleFaramChange = (values, errors) => {
        const { setGlobalPristine } = this.props;

        this.setState({
            faramValues: values,
            faramErrors: errors,
            pristine: false,
        });

        if (setGlobalPristine) {
            setGlobalPristine(false);
        }
    }

    handleFaramValidationSuccess = (values) => {
        const {
            requests: {
                commentCreateRequest,
            },
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
            onCurrentEditChange,
            setGlobalPristine,
        } = this.props;

        onAdd(response);
        if (onCurrentEditChange) {
            onCurrentEditChange(undefined);
        }

        this.setState({
            faramValues: {},
            faramErrors: {},
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

    handleReplyClick = () => {
        const { onCurrentEditChange } = this.props;

        if (onCurrentEditChange) {
            onCurrentEditChange(this.threadReplyId);
        }
    }

    handleReplyCancelClick = () => {
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
    }

    render() {
        const {
            className,
            comments: {
                parent = emptyObject,
                children = emptyList,
            },
            requests: {
                commentCreateRequest: { pending },
            },
            members,
            onEdit,
            isResolved,
            onDelete,
            currentEdit,
            onCurrentEditChange,
            setGlobalPristine,
        } = this.props;

        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.state;

        const {
            createdByDetail,
            text,
            textHistory,
            assigneesDetail,
            assignees,
            id: parentId,
        } = parent;

        const showReplyBox = currentEdit === this.threadReplyId;
        const disableButton = isDefined(currentEdit);

        return (
            <div className={_cs(className, styles.thread)}>
                <Comment
                    currentEdit={currentEdit}
                    onCurrentEditChange={onCurrentEditChange}
                    commentId={parentId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    userDetails={createdByDetail}
                    assigneesDetail={assigneesDetail}
                    assignees={assignees}
                    text={text}
                    setGlobalPristine={setGlobalPristine}
                    textHistory={textHistory}
                    members={members}
                    isParent
                    isResolved={isResolved}
                />
                <ListView
                    data={children}
                    keySelector={childrenKeySelector}
                    rendererParams={this.childRendererParams}
                    renderer={Comment}
                    emptyComponent={EmptyComponent}
                />
                {showReplyBox && (
                    <CommentFaram
                        className={styles.form}
                        pending={pending}
                        pristine={pristine}
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
                )}
                {!(isResolved || showReplyBox) && (
                    <div className={styles.newComment}>
                        <PrimaryButton
                            onClick={this.handleReplyClick}
                            className={styles.button}
                            disabled={disableButton}
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
