import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import {
    RequestClient,
    requestMethods,
} from '#request';
import _ts from '#ts';
import Faram, { requiredCondition } from '@togglecorp/faram';
import TextArea from '#rsci/TextArea';
import SelectInput from '#rsci/SelectInput';
import Confirm from '#rscv/Modal/Confirm';
import LoadingAnimation from '#rscv/LoadingAnimation';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';

import UserDetailActionBar from '../UserDetailActionBar';

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
};

const defaultProps = {
    className: undefined,
    text: '',
    isParent: false,
    userDetails: {},
    assigneeDetail: {},
    members: [],
};

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

const memberKeySelector = m => m.id;
const memberLabelSelector = m => m.displayName;

@RequestClient(requests)
export default class Comment extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            text,
            assigneeDetail,
            isParent,
        } = this.props;

        this.state = {
            editMode: false,
            deleteMode: false,
            faramValues: {
                text,
                assignee: assigneeDetail.id,
            },
            faramErrors: {},
        };

        this.schema = {
            fields: {
                text: [requiredCondition],
            },
        };

        if (isParent) {
            this.schema.fields.assignee = [requiredCondition];
        }
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
        this.setState({
            faramValues: values,
            faramErrors: errors,
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
        this.setState({ editMode: false });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
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
            editMode,
            deleteMode,
        } = this.state;

        const deleteConfirmMessage = isParent
            ? _ts('entryComments', 'parentDeleteConfirmMessage')
            : _ts('entryComments', 'replyDeleteConfirmMessage');

        const requestPending = editPending || deletePending;

        return (
            <div className={_cs(className, styles.comment)}>
                {requestPending && <LoadingAnimation />}
                <UserDetailActionBar
                    userDetails={userDetails}
                    textHistory={textHistory}
                    onEditClick={this.handleEditClick}
                    onResolveClick={this.handleResolveClick}
                    onDeleteClick={this.handleDeleteClick}
                    isParent={isParent}
                />
                {editMode ? (
                    <Faram
                        className={styles.form}
                        onChange={this.handleFaramChange}
                        onValidationFailure={this.handleFaramValidationFailure}
                        onValidationSuccess={this.handleFaramValidationSuccess}
                        schema={this.schema}
                        value={faramValues}
                        error={faramErrors}
                    >
                        <TextArea
                            faramElementName="text"
                            showLabel={false}
                            rows={5}
                            resize="vertical"
                        />
                        {isParent && (
                            <SelectInput
                                faramElementName="assignee"
                                label="Assignee"
                                options={members}
                                keySelector={memberKeySelector}
                                labelSelector={memberLabelSelector}
                            />
                        )}
                        <div className={styles.actionButtons}>
                            <PrimaryButton
                                type="submit"
                                className={styles.button}
                            >
                                {_ts('entryComments', 'editFaramSaveButtonLabel')}
                            </PrimaryButton>
                            <DangerButton
                                onClick={this.handleCancelClick}
                                className={styles.button}
                                type="button"
                            >
                                {_ts('entryComments', 'editFaramCancelButtonLabel')}
                            </DangerButton>
                        </div>
                    </Faram>
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
