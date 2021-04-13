import React, { useCallback, useRef, useMemo, useState } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import TextInput from '#rsci/TextInput';
import Checkbox from '#rsci/Checkbox';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Icon from '#rscg/Icon';
import Cloak from '#components/general/Cloak';
import ConfirmButton from '#rsca/ConfirmButton';

import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import { Permission } from '#typings/common';

import _ts from '#ts';
import notify from '#notify';

import styles from './styles.scss';

interface ComponentProps {
    className?: string;
    // isProjectAdmin?: boolean;
    publicUrl?: string;
    projectId?: number;
    closeModal?: () => void;
    onShareLinkChange?: (publicUrl?: string) => void;
}

interface PublicUrl {
    publicUrl?: string;
}

const resetBodyToSend = ({ action: 'new' });

const isNotProjectAdmin = ({ setupPermissions }: { setupPermissions: Permission }) => (
    !setupPermissions.modify
);

function ShareModal(props: ComponentProps) {
    const {
        className,
        onShareLinkChange,
        publicUrl,
        closeModal,
        projectId,
    } = props;

    const [publicUrlAvailable, setPublicUrlAvailability] = useState(isDefined(publicUrl));
    const inputValueRef = useRef<HTMLDivElement>(null);

    const bodyToSend = useMemo(() => (
        publicUrlAvailable ? { action: 'off' } : { action: 'on' }
    ), [publicUrlAvailable]);

    const [
        pendingUrlVisibilityChange,
        ,
        ,
        triggerAvailabilityChange,
    ] = useRequest<PublicUrl>(
        {
            url: `server://projects/${projectId}/public-viz/`,
            method: 'POST',
            body: bodyToSend,
            onSuccess: (response) => {
                setPublicUrlAvailability(!publicUrlAvailable);
                if (onShareLinkChange) {
                    onShareLinkChange(response?.publicUrl);
                }
            },
            onFailure: (_, errorBody) =>
                notifyOnFailure(_ts('entries', 'shareVizLink'))({ error: errorBody }),
        },
    );

    const [
        pendingReset,
        ,
        ,
        triggerResetPublicUrl,
    ] = useRequest<PublicUrl>(
        {
            url: `server://projects/${projectId}/public-viz/`,
            method: 'POST',
            body: resetBodyToSend,
            onSuccess: (response) => {
                if (onShareLinkChange) {
                    onShareLinkChange(response?.publicUrl);
                }
            },
            onFailure: (_, errorBody) =>
                notifyOnFailure(_ts('entries', 'resetVizLink'))({ error: errorBody }),
        },
    );

    const pending = pendingUrlVisibilityChange || pendingReset;

    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(publicUrl ?? '');

        notify.send({
            title: _ts('entries', 'copiedToClipboard'),
            type: notify.type.SUCCESS,
            message: _ts('entries', 'copiedToClipboardSuccessfully'),
            duration: notify.duration.FAST,
        });
    }, [publicUrl]);

    return (
        <Modal
            className={_cs(className, styles.shareModal)}
        >
            <ModalHeader
                title={_ts('entries', 'shareModalHeading')}
                rightComponent={(
                    <Button
                        transparent
                        iconName="close"
                        onClick={closeModal}
                    />
                )}
            />
            <ModalBody className={styles.body}>
                {pending && (<LoadingAnimation />)}
                <Cloak
                    hide={isNotProjectAdmin}
                    render={(
                        <div className={styles.actions}>
                            <Checkbox
                                className={styles.checkbox}
                                value={publicUrlAvailable}
                                onChange={triggerAvailabilityChange}
                                label={_ts('entries', 'getPublicLinkLabel')}
                                disabled={pending}
                            />
                            { publicUrlAvailable && (
                                <ConfirmButton
                                    className={styles.reset}
                                    iconName="undo"
                                    onClick={triggerResetPublicUrl}
                                    confirmationMessage={_ts('entries', 'resetPublicUrlConfirmationMessage')}
                                >
                                    {_ts('entries', 'resetVizLink')}
                                </ConfirmButton>
                            )}
                        </div>
                    )}
                />
                { publicUrlAvailable && (
                    <div className={styles.textInputSection}>
                        <TextInput
                            className={styles.textInput}
                            ref={inputValueRef}
                            value={publicUrl}
                            showHintAndError={false}
                            readOnly
                        />
                        <Button
                            className={styles.copy}
                            iconName="copy"
                            title="copy"
                            onClick={copyToClipboard}
                        />
                    </div>
                )}
                <p className={styles.infoText}>
                    <Icon
                        className={styles.icon}
                        name="help"
                    />
                    {_ts('entries', 'entriesPublicLinkHelpText')}
                </p>
            </ModalBody>
        </Modal>
    );
}

export default ShareModal;
