import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextArea,
    Button,
    Container,
} from '@the-deep/deep-ui';
import {
    useForm,
    ObjectSchema,
    requiredStringCondition,
    createSubmitHandler,
    internal,
    getErrorObject,
} from '@togglecorp/toggle-form';
import NonFieldError from '#components/NonFieldError';
import { useLazyRequest } from '#base/utils/restRequest';
import { EntryComment } from '#types';
import styles from './styles.css';

interface Comment {
    text: string;
}

type FormType = Partial<Comment>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        text: [requiredStringCondition],
    }),
};

interface Props {
    className?: string;
    onEditSuccess: (response: EntryComment) => void;
    onEditCancel: () => void;
    comment: EntryComment;
}

function EditCommentForm(props: Props) {
    const {
        className,
        comment,
        onEditSuccess,
        onEditCancel,
    } = props;

    const [initialFormValue] = useState<FormType>({
        text: comment.textHistory[0]?.text ?? '',
    });
    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, initialFormValue);

    const error = getErrorObject(riskyError);

    const {
        pending,
        trigger: editComment,
    } = useLazyRequest<EntryComment, FormType>({
        url: `server://v2/entries/${comment.entry}/review-comments/${comment.id}/`,
        method: 'PATCH',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            onEditSuccess(response);
        },
        onFailure: ({ value: errorValue }) => {
            const {
                $internal,
                ...otherErrors
            } = errorValue.faramErrors;

            setError({
                ...otherErrors,
                [internal]: $internal,
            });
        },
        failureHeader: 'Entry comment edit',
    });

    return (
        <form
            className={_cs(styles.editCommentForm, className)}
            onSubmit={createSubmitHandler(validate, setError, editComment)}
        >
            <NonFieldError
                error={error}
            />
            <Container
                className={styles.container}
                footerActions={(
                    <>
                        <Button
                            name={undefined}
                            onClick={onEditCancel}
                            variant="tertiary"
                        >
                            Cancel
                        </Button>
                        <Button
                            name={undefined}
                            type="submit"
                            disabled={pristine || pending}
                        >
                            Save
                        </Button>
                    </>
                )}
            >
                <TextArea
                    name="text"
                    rows={3}
                    value={value.text}
                    onChange={setFieldValue}
                    error={error?.text}
                />
            </Container>
        </form>
    );
}

export default EditCommentForm;
