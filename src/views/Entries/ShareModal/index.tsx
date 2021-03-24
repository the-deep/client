import React, { useMemo, useState } from 'react';
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

import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';

import _ts from '#ts';

import styles from './styles.scss';

interface ComponentProps {
    className?: string;
    isProjectAdmin?: boolean;
    publicUrl?: string;
    projectId?: number;
    closeModal?: () => void;
    onShareLinkChange?: (publicUrl?: string) => void;
}

interface PublicUrl {
    publicUrl?: string;
}

const isNotProjectAdmin = ({ setupPermissions }) => !setupPermissions.modify;

function ShareModal(props: ComponentProps) {
    const {
        className,
        onShareLinkChange,
        publicUrl,
        closeModal,
        projectId,
    } = props;

    const [publicUrlAvailable, setPublicUrlAvailability] = useState(isDefined(publicUrl));

    const bodyToSend = useMemo(() => (
        publicUrlAvailable ? { action: 'unset' } : { action: 'set' }
    ), [publicUrlAvailable]);

    const [
        pending,
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
                        <Checkbox
                            value={publicUrlAvailable}
                            onChange={triggerAvailabilityChange}
                            label={_ts('entries', 'getPublicLinkLabel')}
                            disabled={pending}
                        />
                    )}
                />
                {isDefined(publicUrl) && (
                    <TextInput
                        value={publicUrl}
                        readOnly
                    />
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
