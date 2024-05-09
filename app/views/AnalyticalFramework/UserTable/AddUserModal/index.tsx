import React, { useMemo, useCallback, useState } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    ObjectSchema,
    PartialForm,
    requiredCondition,
    useForm,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    useAlert,
    Modal,
    SelectInput,
    Button,
    PendingMessage,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';

import { AnalysisFrameworkRolesQuery } from '#generated/types';
import NonFieldError from '#components/NonFieldError';
import { useLazyRequest } from '#base/utils/restRequest';
import { Membership } from '#types';
import NewUserSelectInput, { User } from '#components/selections/NewUserSelectInput';
import _ts from '#ts';

import styles from './styles.css';

type Member = Pick<Membership, 'id' | 'member' | 'memberName' | 'role'>;
type AnalysisFrameworkRolesType = NonNullable<NonNullable<AnalysisFrameworkRolesQuery>['analysisFrameworkRoles']>[number];

const roleKeySelector = (d: AnalysisFrameworkRolesType) => Number(d.id);
const roleLabelSelector = (d: AnalysisFrameworkRolesType) => d.title;

type FormType = {
    id?: number;
    member?: string;
    role: number;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

const schema: FormSchema = {
    fields: (value): FormSchemaFields => {
        if (isDefined(value?.id)) {
            return ({
                member: [],
                role: [requiredCondition],
            });
        }
        return ({
            member: [requiredCondition],
            role: [requiredCondition],
        });
    },
};

const defaultFormValue: PartialForm<FormType> = {};

const ANALYSIS_FRAMEWORK_ROLES = gql`
    query AnalysisFrameworkRoles {
        analysisFrameworkRoles {
            id
            type
            title
            isPrivateRole
            isDefaultRole
        }
    }
`;

interface ValueToSend {
    role: number;
    member?: number;
    framework: number;
}

interface Props {
    onModalClose: () => void;
    frameworkId: number;
    onTableReload: () => void;
    isPrivateFramework: boolean;
    userValue?: Member;
}

function AddUserModal(props: Props) {
    const {
        onModalClose,
        frameworkId,
        onTableReload,
        userValue,
        isPrivateFramework,
    } = props;

    const initialFormValue: PartialForm<FormType> = useMemo(() => {
        if (!userValue) {
            return defaultFormValue;
        }
        return ({
            ...userValue,
            member: String(userValue.member),
        });
    }, [userValue]);
    const alert = useAlert();

    const [
        userOptions,
        setUserOptions,
    ] = useState<User[] | undefined | null>();

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
        data: analysisFrameworkRolesResponse,
        loading: analysisFrameworkRolesLoading,
    } = useQuery<AnalysisFrameworkRolesQuery>(
        ANALYSIS_FRAMEWORK_ROLES,
    );

    const analysisFrameworkRoles = useMemo(() => (
        analysisFrameworkRolesResponse
            ?.analysisFrameworkRoles?.filter(
                (role) => role.isPrivateRole === isPrivateFramework,
            )
    ), [analysisFrameworkRolesResponse, isPrivateFramework]);

    const {
        pending: pendingAddAction,
        trigger: triggerAddFrameworkMember,
    } = useLazyRequest<unknown, ValueToSend>({
        url: isDefined(userValue)
            ? `server://framework-memberships/${userValue.id}/`
            : 'server://framework-memberships/',
        method: isDefined(userValue)
            ? 'PATCH'
            : 'POST',
        body: (ctx) => ctx,
        onSuccess: () => {
            alert.show(
                userValue?.id
                    ? 'Successfully updated user permissions.'
                    : 'Successfully added user to the analytical framework.',
                {
                    variant: 'success',
                },
            );
            onTableReload();
            onModalClose();
        },
        failureMessage: _ts('analyticalFramework.addUser', 'membershipPostFailed'),
    });

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => {
                    const newVal = val.member ? { member: Number(val.member), ...val } : val;
                    triggerAddFrameworkMember({
                        ...newVal,
                        framework: frameworkId,
                    } as ValueToSend);
                },
            );
            submit();
        },
        [setError, validate, triggerAddFrameworkMember, frameworkId],
    );

    const currentUser = useMemo(() => (userValue
        ? [
            {
                id: String(userValue.member),
                displayName: userValue.memberName,
                // FIXME: Use graphql to fetch details for User
                firstName: '',
                lastName: '',
                emailDisplay: '',
            },
        ] : []
    ), [userValue]);

    const pendingRequests = analysisFrameworkRolesLoading;

    return (
        <Modal
            className={styles.modal}
            heading={
                isDefined(userValue)
                    ? _ts('analyticalFramework.addUser', 'editUserHeading')
                    : _ts('analyticalFramework.addUser', 'addUserHeading')
            }
            onCloseButtonClick={onModalClose}
            size="small"
            freeHeight
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name="submit"
                    variant="primary"
                    type="submit"
                    disabled={pristine || pendingRequests || pendingAddAction}
                    onClick={handleSubmit}
                >
                    {_ts('analyticalFramework.addUser', 'submitLabel')}
                </Button>
            )}
        >
            {pendingAddAction && (<PendingMessage />)}
            <NonFieldError error={error} />
            <NewUserSelectInput
                name="member"
                readOnly={isDefined(userValue)}
                value={value.member ? String(value.member) : undefined}
                onChange={setFieldValue}
                options={userOptions ?? currentUser}
                onOptionsChange={setUserOptions}
                error={error?.member}
                disabled={pendingRequests}
                label={_ts('analyticalFramework.addUser', 'userLabel')}
                placeholder={_ts('analyticalFramework.addUser', 'selectUserPlaceholder')}
                membersExcludeFramework={String(frameworkId)}
            />
            <SelectInput
                name="role"
                options={analysisFrameworkRoles}
                keySelector={roleKeySelector}
                labelSelector={roleLabelSelector}
                onChange={setFieldValue}
                value={value.role}
                label={_ts('analyticalFramework.addUser', 'roleLabel')}
                placeholder={_ts('analyticalFramework.addUser', 'selectRolePlaceholder')}
                error={error?.role}
                disabled={pendingRequests}
            />
        </Modal>
    );
}

export default AddUserModal;
