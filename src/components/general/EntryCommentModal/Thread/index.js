import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import {
    RequestClient,
    requestMethods,
} from '#request';
import Faram, { requiredCondition } from '@togglecorp/faram';
import ListView from '#rscv/List/ListView';
import TextArea from '#rsci/TextArea';
import SelectInput from '#rsci/SelectInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';

import Comment from './Comment';

import styles from './styles.scss';

const propTypes = {
    comments: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    members: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    entryId: PropTypes.number,
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    commentCreateRequest: PropTypes.object.isRequired,
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
        onSuccess: ({ response }) => {
            console.warn(response);
        },
        schemaName: 'entryComment',
    },
};

const childrenKeySelector = c => c.id;
const memberKeySelector = m => m.id;
const memberLabelSelector = m => m.displayName;

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

        this.schema = {
            fields: {
                text: [requiredCondition],
                assignee: [requiredCondition],
            },
        };
    }

    childRendererParams = (key, data) => ({
        className: styles.comment,
        userDetails: data.createdByDetail,
        assigneeDetail: data.assigneeDetail,
        text: data.text,
        textHistory: data.textHistory,
        members: this.props.members,
    })

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
        commentCreateRequest.do({ body });
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
            members,
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
        } = parent;

        return (
            <div className={_cs(className, styles.thread)}>
                <div className={styles.parent}>
                    <Comment
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
                <Faram
                    className={styles.form}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    {showReplyBox && (
                        <React.Fragment>
                            <TextArea
                                faramElementName="text"
                                placeholder="Reply..."
                                label="Reply"
                                rows={5}
                                resize="vertical"
                            />
                            <SelectInput
                                faramElementName="assignee"
                                label="Assignee"
                                options={members}
                                keySelector={memberKeySelector}
                                labelSelector={memberLabelSelector}
                            />
                        </React.Fragment>
                    )}
                    <div className={styles.actionButtons}>
                        {showReplyBox ? (
                            <React.Fragment>
                                <PrimaryButton
                                    type="submit"
                                    className={styles.button}
                                >
                                    Reply
                                </PrimaryButton>
                                <DangerButton
                                    onClick={this.handleReplyCancelClick}
                                    className={styles.button}
                                    type="button"
                                >
                                    Cancel
                                </DangerButton>
                            </React.Fragment>
                        ) : (
                            <PrimaryButton
                                onClick={this.handleReplyClick}
                                className={styles.button}
                                type="button"
                            >
                                Reply
                            </PrimaryButton>
                        )}
                    </div>
                </Faram>
            </div>
        );
    }
}
