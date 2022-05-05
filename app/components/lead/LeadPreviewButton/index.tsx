import React, { memo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    ButtonProps,
    Modal,
    Message,
    Kraken,
} from '@the-deep/deep-ui';

import LeadPreview, { Attachment } from '#components/lead/LeadPreview';
import { useModalState } from '#hooks/stateManagement';

import styles from './styles.css';

export type Props = {
    label?: React.ReactNode;
    title?: string;
    url?: string;
    className?: string;
    attachment?: Attachment | null;
    variant?: ButtonProps<string>['variant'];
}

function LeadPreviewButton(props: Props) {
    const {
        className,
        label,
        variant,
        title,
        url,
        attachment,
    } = props;

    const [
        isModalVisible,
        showModal,
        hideModal,
    ] = useModalState(false);

    return (
        <>
            {(!url && !attachment) ? (
                label
            ) : (
                <Button
                    name={undefined}
                    className={_cs(
                        !variant && styles.leadPreviewButton,
                        className,
                    )}
                    onClick={showModal}
                    title="Show lead preview"
                    variant={variant ?? 'transparent'}
                    childrenContainerClassName={styles.label}
                >
                    {label}
                </Button>
            )}
            {isModalVisible && (
                <Modal
                    className={styles.modal}
                    heading={title}
                    size="cover"
                    onCloseButtonClick={hideModal}
                    headerClassName={styles.header}
                    bodyClassName={styles.content}
                    spacing="none"
                >
                    {(url || attachment) ? (
                        <LeadPreview
                            className={styles.preview}
                            url={url ?? undefined}
                            attachment={attachment ?? undefined}
                        />
                    ) : (
                        <Message
                            icon={<Kraken variant="sleep" />}
                            message="No preview available"
                        />
                    )}
                </Modal>
            )}
        </>
    );
}

export default memo(LeadPreviewButton);
