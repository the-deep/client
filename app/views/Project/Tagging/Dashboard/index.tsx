import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoHelpCircleOutline,
    IoShareSocialOutline,
    IoCopy,
} from 'react-icons/io5';
import {
    Modal,
    useAlert,
    QuickActionButton,
    TextInput,
    Checkbox,
    Button,
    Container,
} from '@the-deep/deep-ui';

import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

import styles from './styles.css';

interface ShareModalProps {
    url: string | undefined;
    onClose: () => void;
}

function ShareModal(props: ShareModalProps) {
    const {
        url,
        onClose,
    } = props;

    const alert = useAlert();

    const handleCheckboxClick = useCallback(() => {
        console.warn('Checkbox clicked');
    }, []);

    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(url ?? '');

        alert.show(
            'Url was successfully copied to the clipboard',
            {
                variant: 'info',
            },
        );
    }, [url, alert]);

    return (
        <Modal
            className={styles.modal}
            heading="Share Public Link"
            bodyClassName={styles.modalBody}
            onCloseButtonClick={onClose}
        >
            <Checkbox
                name="isShared"
                label="Enable Public Link"
                value
                onChange={handleCheckboxClick}
            />
            <TextInput
                name="url"
                value={url}
                readOnly
                actions={url && (
                    <QuickActionButton
                        name="copy"
                        variant="secondary"
                        title="copy"
                        onClick={copyToClipboard}
                    >
                        <IoCopy />
                    </QuickActionButton>
                )}
            />
            <p>
                <IoHelpCircleOutline />
                {_ts('entries', 'entriesPublicLinkHelpText')}
            </p>
        </Modal>
    );
}

interface Props {
    className?: string;
}

function Dashboard(props: Props) {
    const {
        className,
    } = props;

    const [
        isShareModalShown,
        showShareModal,
        hideShareModal,
    ] = useModalState(false);

    const url = 'https://redhum.org/documento/3784581';

    return (
        <Container
            className={_cs(styles.dashboard, className)}
            headerActions={(
                <Button
                    name={undefined}
                    icons={(<IoShareSocialOutline />)}
                    onClick={showShareModal}
                >
                    Share
                </Button>
            )}
            contentClassName={styles.content}
        >
            <iframe
                className={styles.iframe}
                title="Visualization"
                src={url}
                sandbox="allow-scripts allow-same-origin allow-downloads"
            />
            {isShareModalShown && (
                <ShareModal
                    url={url}
                    onClose={hideShareModal}
                />
            )}
        </Container>
    );
}

export default Dashboard;
