import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import Faram, { requiredCondition } from '@togglecorp/faram';
import TextArea from '#rsci/TextArea';
import LoadingAnimation from '#rscv/LoadingAnimation';
import MultiSelectInput from '#rsci/MultiSelectInput';
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
            this.schema.fields.assignees = [requiredCondition];
        }

        this.contentRef = React.createRef();
    }

    componentDidMount() {
        const { contentRef } = this;
        if (contentRef && contentRef.current) {
            contentRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
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
            <div
                className={_cs(styles.formContainer, className)}
                ref={this.contentRef}
            >
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
                        autoFocus
                    />
                    {hasAssignee && (
                        <MultiSelectInput
                            faramElementName="assignees"
                            label="Assignees"
                            options={members}
                            keySelector={memberKeySelector}
                            labelSelector={memberLabelSelector}
                        />
                    )}
                    <div className={styles.actionButtons}>
                        <DangerButton
                            onClick={onCancelClick}
                            className={styles.button}
                            type="button"
                        >
                            {cancelButtonLabel}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            className={styles.button}
                            disabled={pristine || pending}
                        >
                            {commentButtonLabel}
                        </PrimaryButton>
                    </div>
                </Faram>
            </div>
        );
    }
}
