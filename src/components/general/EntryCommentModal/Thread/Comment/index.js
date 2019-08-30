import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import { RequestClient } from '#request';
import _ts from '#ts';
import Faram, { requiredCondition } from '@togglecorp/faram';
import TextArea from '#rsci/TextArea';
import SelectInput from '#rsci/SelectInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';

import UserDetailActionBar from '../UserDetailActionBar';

import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,
    text: PropTypes.string,
    userDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    assigneeDetail: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    isParent: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    textHistory: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    members: PropTypes.array,
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
        } = this.props;

        this.state = {
            editMode: false,
            faramValues: {
                text,
                assignee: assigneeDetail.id,
            },
            faramErrors: {},
        };

        this.schema = {
            fields: {
                text: [requiredCondition],
                assignee: [requiredCondition],
            },
        };
    }

    handleEditClick = () => {
        this.setState({ editMode: true });
    };

    handleFaramChange = (values, errors) => {
        this.setState({
            faramValues: values,
            faramErrors: errors,
        });
    }

    handleFaramValidationSuccess = (_, values) => {
        console.warn('reply', values);
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
            } = {},
        } = this.props;

        const {
            faramValues,
            faramErrors,
            editMode,
        } = this.state;

        return (
            <div className={_cs(className, styles.comment)}>
                <UserDetailActionBar
                    userDetails={userDetails}
                    textHistory={textHistory}
                    onEditClick={this.handleEditClick}
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
                        <div className={styles.actionButtons}>
                            <React.Fragment>
                                <PrimaryButton
                                    type="submit"
                                    className={styles.button}
                                >
                                    Reply
                                </PrimaryButton>
                                <DangerButton
                                    onClick={this.handleCancelClick}
                                    className={styles.button}
                                    type="button"
                                >
                                    Cancel
                                </DangerButton>
                            </React.Fragment>
                        </div>
                    </Faram>
                ) : (
                    <React.Fragment>
                        <div className={styles.commentText}>
                            {text}
                        </div>
                        {assigneeName && (
                            <div className={styles.assignee}>
                                {_ts('entryComment', 'assignedTo', { name: assigneeName })}
                            </div>
                        )}
                    </React.Fragment>
                )}
            </div>
        );
    }
}
