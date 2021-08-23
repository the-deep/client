import React, { useMemo, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmark, IoClose } from 'react-icons/io5';
import {
    Button,
} from '@the-deep/deep-ui';

import {
    MultiResponse,
    Membership,
} from '#types';

import { EntryReviewComment } from '#types/newEntry';
import { useModalState } from '#hooks/stateManagement';
import { useLazyRequest, useRequest } from '#base/utils/restRequest';
import UserContext from '#base/context/UserContext';

import EntryUncontrolCommentModal from './EntryUncontrolCommentModal';
import styles from './styles.css';

interface Props {
    className?: string;
    entryId: number;
    projectId: number;
    value: boolean;
    disabled?: boolean;
    onChange: (entryId: number) => void;
}

interface EntryControlFormData {
    commentType: number;
}

const CONTROL = 3;
const QUALITY_CONTROLLER = 0;

function EntryControl(props: Props) {
    const {
        className,
        entryId,
        projectId,
        value,
        onChange,
        disabled,
    } = props;

    const {
        user,
    } = useContext(UserContext);

    const {
        pending: projectMembersPending,
        response: projectMembersResponse,
    } = useRequest<MultiResponse<Membership>>({
        url: `server://v2/projects/${projectId}/project-memberships/`,
        method: 'GET',
        failureHeader: 'Project Membership',
    });

    const isQualityController = useMemo(() => (
        projectMembersResponse?.results.find((v) => v.member.toString() === user?.id)
            ?.badges.some((v) => (v === QUALITY_CONTROLLER))
    ),
    [projectMembersResponse?.results, user?.id]);

    const [
        commentModalShown,
        setCommentModalVisible,
        setCommentModalHidden,
    ] = useModalState(false);

    const {
        pending: reviewRequestPending,
        trigger: triggerReviewRequest,
    } = useLazyRequest<EntryReviewComment, EntryControlFormData>({
        url: `server://v2/entries/${entryId}/review-comments/`,
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            onChange(response.entry);
        },
        failureHeader: 'Entry Control',
    });

    const handleClick = React.useCallback(() => {
        if (value) {
            setCommentModalVisible();
        } else {
            triggerReviewRequest({ commentType: CONTROL });
        }
    }, [value, triggerReviewRequest, setCommentModalVisible]);

    const controlStatusLabel = useMemo(() => {
        if (isQualityController) {
            return value
                ? 'Uncontrol'
                : 'Control';
        }
        return value
            ? 'Controlled'
            : 'Uncontrolled';
    }, [value, isQualityController]);

    return (
        <div
            className={_cs(className, styles.toggleEntryControl)}
        >
            <Button
                name="entryVerification"
                variant={(
                    value ? 'primary' : 'secondary'
                )}
                actions={(
                    value ? <IoCheckmark /> : <IoClose />
                )}
                onClick={handleClick}
                disabled={
                    reviewRequestPending
                    || disabled
                    || projectMembersPending
                    || !isQualityController
                }
            >
                { controlStatusLabel }
            </Button>
            { commentModalShown && (
                <EntryUncontrolCommentModal
                    onModalClose={setCommentModalHidden}
                    entryId={entryId}
                    onControlStatusChange={onChange}
                    projectMembers={projectMembersResponse?.results}
                    projectMembersPending={projectMembersPending}
                />
            )}
        </div>
    );
}

export default EntryControl;
