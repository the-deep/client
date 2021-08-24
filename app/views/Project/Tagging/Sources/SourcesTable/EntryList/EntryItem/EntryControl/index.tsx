import React, { useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmark, IoClose } from 'react-icons/io5';
import {
    Button,
} from '@the-deep/deep-ui';

import { EntryReviewComment } from '#types/newEntry';
import { useModalState } from '#hooks/stateManagement';
import { useLazyRequest } from '#base/utils/restRequest';
import { ProjectContext } from '#base/context/ProjectContext';

import { EntryAction } from '../constants';
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

function EntryControl(props: Props) {
    const {
        className,
        entryId,
        projectId,
        value,
        onChange,
        disabled,
    } = props;

    const { project } = useContext(ProjectContext);

    const isQualityController = project?.allowedPermissions.includes('CAN_QUALITY_CONTROL');

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
            triggerReviewRequest({ commentType: EntryAction.CONTROL });
        }
    }, [value, triggerReviewRequest, setCommentModalVisible]);

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
                    || !isQualityController
                }
            >
                {value ? 'Controlled' : 'Control'}
            </Button>
            { commentModalShown && (
                <EntryUncontrolCommentModal
                    onModalClose={setCommentModalHidden}
                    entryId={entryId}
                    onControlStatusChange={onChange}
                    projectId={projectId}
                />
            )}
        </div>
    );
}

export default EntryControl;
