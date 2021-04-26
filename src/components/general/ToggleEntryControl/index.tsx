import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmark, IoClose } from 'react-icons/io5';
import {
    ElementFragments,
} from '@the-deep/deep-ui';

import {
    activeProjectRoleSelector,
} from '#redux';
import {
    DatabaseEntityBase,
    ProjectRole,
    AppState,
} from '#typings';

import Button from '#rsca/Button';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';

import EntryCommentFormForModal from '#components/general/EntryCommentFormForModal';

import { useModalState } from '#hooks/stateManagement';
import notify from '#notify';
import useRequest from '#utils/request';
import { notifyError } from '#utils/requestNotify';

import _ts from '#ts';

import styles from './styles.scss';

interface ToggleEntryControlProps {
    className?: string;
    entryId: DatabaseEntityBase['id'];
    projectId: DatabaseEntityBase['id'];
    onChange: (newValue: boolean) => void;
    onPendingStatusChange?: (newValue: boolean) => void;
    value: boolean;
    tooltip?: string;
    disabled?: boolean;
}

interface PropsFromState {
    projectRole: ProjectRole;
}

const CONTROL = 3;
const UNCONTROL = 4;

const controlFormData = { commentType: CONTROL };
const mapStateToProps = (state: AppState) => ({
    projectRole: activeProjectRoleSelector(state),
});

function ToggleEntryControl(props: ToggleEntryControlProps & PropsFromState) {
    const {
        className,
        entryId,
        projectId,
        value,
        onChange,
        onPendingStatusChange,
        tooltip,
        disabled,
        projectRole,
    } = props;

    console.warn('projectrole', projectRole);

    const [
        commentModalShown,
        setCommentModalVisible,
        setCommentModalHidden,
    ] = useModalState(false);

    const [uncontrolFormData, setUncontrolFormData] = React.useState({
        commentType: UNCONTROL,
    });

    const url = `server://v2/entries/${entryId}/review-comments/`;
    const formData = React.useMemo(() => (
        value ? uncontrolFormData : controlFormData
    ), [value, uncontrolFormData]);

    const [
        reviewRequestPending,
        ,,
        triggerReviewRequest,
    ] = useRequest({
        url,
        autoTrigger: false,
        method: 'POST',
        body: formData,
        onSuccess: () => {
            onChange(!value);
            setCommentModalHidden();

            notify.send({
                title: _ts('entryReview', 'entryControlStatusChange'),
                type: notify.type.SUCCESS,
                message: _ts('entryReview', 'entryControlStatusChangeSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        onFailure: notifyError(_ts('entryReview', 'entryControlFailure')),
    });

    React.useEffect(() => {
        if (onPendingStatusChange) {
            onPendingStatusChange(reviewRequestPending);
        }
    }, [reviewRequestPending, onPendingStatusChange]);

    const handleClick = React.useCallback(() => {
        if (value) {
            setCommentModalVisible();
        } else {
            triggerReviewRequest();
        }
    }, [value, triggerReviewRequest, setCommentModalVisible]);

    const handleUncontrolFormValidationSuccess = React.useCallback((newData) => {
        setUncontrolFormData(prevData => ({
            ...prevData,
            ...newData,
        }));
        triggerReviewRequest();
    }, [setUncontrolFormData, triggerReviewRequest]);

    const controlStatusLabel = useMemo(() => {
        if (projectRole.qualityController) {
            return value
                ? _ts('entryReview', 'controlled')
                : _ts('entryReview', 'uncontrolled');
        }
        return value
            ? _ts('entryReview', 'uncontrolledLabel')
            : _ts('entryReview', 'controlledLabel');
    }, [projectRole, value]);

    return (
        <div
            className={styles.toggleEntryControl}
        >
            <ElementFragments
                iconsContainerClassName={styles.icons}
                childrenContainerClassName={styles.children}
                actionsContainerClassName={styles.actions}
                icons={
                    <Button
                        title={tooltip}
                        className={
                            _cs(
                                className,
                                styles.toggleEntryControl,
                                value && styles.controlled,
                            )
                        }
                        onClick={handleClick}
                        pending={reviewRequestPending}
                        disabled={disabled || !projectRole.qualityController}
                    >
                        { controlStatusLabel }
                    </Button>
                }
            >
                {value ?
                    <IoCheckmark
                        className={_cs(
                            styles.icon,
                            !projectRole.qualityController && styles.disabled,
                        )}
                    /> :
                    <IoClose
                        className={_cs(
                            styles.icon,
                            !projectRole.qualityController && styles.disabled,
                        )}
                    />
                }
            </ElementFragments>
            { commentModalShown && (
                <Modal className={styles.commentModal}>
                    <ModalHeader
                        title={_ts('entryReview', 'uncontrolledEntryLabel')}
                        rightComponent={
                            <Button
                                onClick={setCommentModalHidden}
                                transparent
                                iconName="close"
                            />
                        }
                    />
                    <EntryCommentFormForModal
                        disabled={reviewRequestPending}
                        projectId={projectId}
                        onValidationSuccess={handleUncontrolFormValidationSuccess}
                    />
                </Modal>
            )}
        </div>
    );
}

export default connect(mapStateToProps)(ToggleEntryControl);
