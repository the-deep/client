import React, { useMemo, useContext } from 'react';
import {
    PendingMessage,
    Button,
    TextOutput,
    Modal,
    useAlert,
} from '@the-deep/deep-ui';
import {
    useQuery,
    useMutation,
    gql,
} from '@apollo/client';

import NonFieldError from '#components/NonFieldError';
import {
    DeleteUserMutation,
    UserSoleProjectsQuery,
} from '#generated/types';
import UserContext from '#base/context/UserContext';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';

import styles from './styles.css';

const USER_SOLE_PROJECTS = gql`
    query UserSoleProjects {
        me {
            id
            soleProjects {
                id
                title
            }
        }
    }
`;

const DELETE_USER = gql`
    mutation DeleteUser {
        deleteUser {
            errors
            ok
        }
    }
`;

interface Props {
    onClose: () => void;
}

function UserDeleteConfirmModal(props: Props) {
    const {
        onClose,
    } = props;

    const {
        setUser,
    } = useContext(UserContext);

    const alert = useAlert();

    const [
        deleteUser,
        {
            loading: userDeletePending,
            data: userDeleteData,
        },
    ] = useMutation<DeleteUserMutation>(
        DELETE_USER,
        {
            onCompleted: (response) => {
                if (!response.deleteUser) {
                    return;
                }

                if (response.deleteUser.ok) {
                    setUser(undefined);
                    alert.show(
                        'Successfully deleted account.',
                        { variant: 'success' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'There was an error while deleting your account.',
                    { variant: 'error' },
                );
            },
        },
    );

    const {
        data,
        loading: userSoleProjectsPending,
    } = useQuery<UserSoleProjectsQuery>(
        USER_SOLE_PROJECTS,
    );

    const soleProjects = data?.me?.soleProjects;
    const projectList = useMemo(() => (
        soleProjects?.map((project) => project?.title).join(', ')
    ), [soleProjects]);

    return (
        <Modal
            onCloseButtonClick={onClose}
            freeHeight
            size="small"
            heading="Delete your account"
            footerActions={(
                <>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        name={undefined}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={deleteUser}
                        name={undefined}
                        disabled={(soleProjects?.length ?? 0) > 0 || userDeletePending}
                    >
                        Delete Account
                    </Button>
                </>
            )}
        >
            {(userDeletePending || userSoleProjectsPending) && <PendingMessage />}
            {(soleProjects?.length ?? 0) > 0 ? (
                <>
                    Looks like you are the only project owner in the following projects.
                    You will either have to assign another project owner
                    or delete the project before you can delete your account.
                    <TextOutput
                        className={styles.projectList}
                        label="List of projects"
                        value={projectList}
                    />
                </>
            ) : (
                <>
                    Deleting yourself from DEEP will remove your account
                    permanently and cannot be reversed.
                    Are you sure you want to delete your account?
                    <NonFieldError
                        error={transformToFormError(
                            userDeleteData?.deleteUser?.errors as ObjectError[],
                        )}
                    />
                </>
            )}
        </Modal>
    );
}

export default UserDeleteConfirmModal;
