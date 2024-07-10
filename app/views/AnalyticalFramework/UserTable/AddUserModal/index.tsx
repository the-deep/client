import React, { useMemo, useCallback, useState } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';
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
import { gql, useMutation, useQuery } from '@apollo/client';

import {
    AnalysisFrameworkMembersQuery,
    AnalysisFrameworkRolesQuery,
    AnalysisMembershipAddEditMutation,
    AnalysisMembershipAddEditMutationVariables,
    BulkAnalysisFrameworkMembershipInputType,
} from '#generated/types';
import NonFieldError from '#components/NonFieldError';
import NewUserSelectInput, { User } from '#components/selections/NewUserSelectInput';
import _ts from '#ts';

import styles from './styles.css';

type AnalysisFrameworkMember = NonNullable<NonNullable<AnalysisFrameworkMembersQuery['analysisFramework']>['members']>[number];
type AnalysisFrameworkRolesType = NonNullable<NonNullable<AnalysisFrameworkRolesQuery>['analysisFrameworkRoles']>[number];

const roleKeySelector = (d: AnalysisFrameworkRolesType) => d.id;
const roleLabelSelector = (d: AnalysisFrameworkRolesType) => d.title;

type PartialAnalysisMemembershipForm = PartialForm<
    BulkAnalysisFrameworkMembershipInputType & { frameworkId: string}
>

type FormSchema = ObjectSchema<PartialAnalysisMemembershipForm>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

const schema: FormSchema = {
    fields: (value): FormSchemaFields => {
        if (isDefined(value?.frameworkId)) {
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

const defaultFormValue: PartialAnalysisMemembershipForm = {};

const ANALYSIS_MEMBERSHIP_ADD_EDIT = gql`
    mutation AnalysisMembershipAddEdit(
        $frameworkId: ID!
        $items: [BulkAnalysisFrameworkMembershipInputType!], 
    ){
        analysisFramework(id: $frameworkId) {
            analysisFrameworkMembershipBulk(
                items: $items
            ) {
                result {
                    id
                }
                errors
            }
        }
    }
`;

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

interface Props {
    onModalClose: () => void;
    frameworkId: string;
    onTableReload: () => void;
    isPrivateFramework: boolean;
    userValue?: AnalysisFrameworkMember;
}

function AddUserModal(props: Props) {
    const {
        onModalClose,
        frameworkId,
        onTableReload,
        userValue,
        isPrivateFramework,
    } = props;

    const initialFormValue: PartialAnalysisMemembershipForm = useMemo(() => {
        if (!userValue) {
            return defaultFormValue;
        }
        return ({
            frameworkId,
            id: userValue.id,
            role: userValue.role.id,
            member: userValue.member.id,
        });
    }, [userValue, frameworkId]);

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

    const [
        addEditFrameworkMembership,
        {
            loading: addEditFrameworkMembershipLoading,
        },
    ] = useMutation<AnalysisMembershipAddEditMutation, AnalysisMembershipAddEditMutationVariables>(
        ANALYSIS_MEMBERSHIP_ADD_EDIT,
        {
            onCompleted: (response) => {
                if (!response.analysisFramework?.analysisFrameworkMembershipBulk?.result) {
                    return;
                }

                const {
                    result,
                } = response.analysisFramework.analysisFrameworkMembershipBulk;

                const ok = isDefined(result) && result?.length > 0;

                if (ok) {
                    if (userValue?.id) {
                        alert.show(
                            'Successfully updated user to the analytical framework.',
                            { variant: 'success' },
                        );
                    } else {
                        alert.show(
                            'Successfully added user to the analytical framework.',
                            { variant: 'success' },
                        );
                    }
                    onTableReload();
                    onModalClose();
                }
            },
            onError: () => {
                if (userValue?.id) {
                    alert.show(
                        'Failed to update users to analytical framework.',
                        { variant: 'error' },
                    );
                } else {
                    alert.show(
                        'Failed to add users to analytical framework.',
                        { variant: 'error' },
                    );
                }
            },
        },
    );

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

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => {
                    if (isNotDefined(val.member)) {
                        addEditFrameworkMembership({ variables: undefined });
                    } else if (userValue?.id) {
                        addEditFrameworkMembership({
                            variables: {
                                frameworkId,
                                items: [{
                                    member: val.member,
                                    role: val.role,
                                    id: userValue.id,
                                }],
                            },
                        });
                    } else {
                        addEditFrameworkMembership({
                            variables: {
                                frameworkId,
                                items: [{
                                    member: val.member,
                                    role: val.role,
                                }],
                            },
                        });
                    }
                },
            );
            submit();
        },
        [setError, validate, addEditFrameworkMembership, frameworkId, userValue?.id],
    );

    const currentUser = useMemo(() => (userValue
        ? [
            {
                id: userValue.member.id,
                displayName: userValue.member.displayName,
                firstName: '',
                lastName: '',
                emailDisplay: '',
            },
        ] : []
    ), [userValue]);

    const pendingRequests = analysisFrameworkRolesLoading || addEditFrameworkMembershipLoading;

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
                    disabled={pristine || pendingRequests}
                    onClick={handleSubmit}
                >
                    {_ts('analyticalFramework.addUser', 'submitLabel')}
                </Button>
            )}
        >
            {addEditFrameworkMembershipLoading && (<PendingMessage />)}
            <NonFieldError error={error} />
            <NewUserSelectInput
                name="member"
                readOnly={isDefined(userValue)}
                value={value.member}
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
