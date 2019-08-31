import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import Faram, { requiredCondition } from '@togglecorp/faram';
import TextArea from '#rsci/TextArea';
import LoadingAnimation from '#rscv/LoadingAnimation';
import SelectInput from '#rsci/SelectInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    commentButtonLabel: PropTypes.string,
    cancelButtonLabel: PropTypes.string,
    faramValues: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    faramErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    members: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
    onValidationFailure: PropTypes.func.isRequired,
    onValidationSuccess: PropTypes.func.isRequired,
    onCancelClick: PropTypes.func.isRequired,
    hasAssignee: PropTypes.bool,
    pending: PropTypes.bool,
    pristine: PropTypes.bool,
};

const defaultProps = {
    pristine: false,
    className: undefined,
    commentButtonLabel: '',
    pending: false,
    cancelButtonLabel: '',
    hasAssignee: false,
    faramValues: {},
    faramErrors: {},
    members: [],
};

const memberKeySelector = m => m.id;
const memberLabelSelector = m => m.displayName;

export default class CommentFaram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { hasAssignee } = this.props;

        this.schema = {
            fields: {
                text: [requiredCondition],
            },
        };

        if (hasAssignee) {
            this.schema.fields.assignee = [requiredCondition];
        }
    }

    render() {
        const {
            className,
            faramValues,
            faramErrors,
            onChange,
            onValidationFailure,
            onValidationSuccess,
            commentButtonLabel,
            cancelButtonLabel,
            hasAssignee,
            members,
            onCancelClick,
            pending,
            pristine,
        } = this.props;

        const textAreaPlaceholder = hasAssignee
            ? _ts('entryComments', 'commentAreaPlaceholder')
            : _ts('entryComments', 'replyAreaPlaceholder');

        return (
            <div className={_cs(styles.formContainer, className)}>
                {pending && <LoadingAnimation />}
                <Faram
                    className={styles.form}
                    onChange={onChange}
                    onValidationFailure={onValidationFailure}
                    onValidationSuccess={onValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                    disabled={pending}
                >
                    <TextArea
                        placeholder={textAreaPlaceholder}
                        faramElementName="text"
                        showLabel={false}
                        rows={5}
                        resize="vertical"
                    />
                    {hasAssignee && (
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
                            disabled={pristine || pending}
                        >
                            {commentButtonLabel}
                        </PrimaryButton>
                        <DangerButton
                            onClick={onCancelClick}
                            className={styles.button}
                            type="button"
                        >
                            {cancelButtonLabel}
                        </DangerButton>
                    </div>
                </Faram>
            </div>
        );
    }
}
