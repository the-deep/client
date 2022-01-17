import React, { memo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    ButtonProps,
    Modal,
    PendingMessage,
    ImagePreview,
} from '@the-deep/deep-ui';

import { useRequest } from '#base/utils/restRequest';
import { useModalState } from '#hooks/stateManagement';
import { AnalyticalFramework } from '#types';
import _ts from '#ts';

import styles from './styles.css';

const query = {
    fields: ['title', 'preview_image', 'id'],
};

export type Props = {
    label?: string;
    className?: string;
    variant?: ButtonProps<string>['variant'];
    frameworkId?: number | string;
    image?: string;
}

function FrameworkImageButton(props: Props) {
    const {
        className,
        frameworkId,
        label,
        variant,
        image,
    } = props;

    const [
        isModalVisible,
        showModal,
        hideModal,
    ] = useModalState(false);

    const {
        pending,
        response: frameworkDetails,
    } = useRequest<AnalyticalFramework>({
        skip: !isModalVisible || !frameworkId,
        url: `server://analysis-frameworks/${frameworkId}/`,
        query,
        method: 'GET',
    });

    return (
        <>
            {(!frameworkId && !image) ? (
                label
            ) : (
                <Button
                    name={frameworkId}
                    className={_cs(
                        !variant && styles.frameworkImageButton,
                        className,
                    )}
                    onClick={showModal}
                    variant={variant ?? 'transparent'}
                >
                    {label}
                </Button>
            )}
            {isModalVisible && (
                <Modal
                    className={styles.modal}
                    heading={label}
                    size="large"
                    onCloseButtonClick={hideModal}
                    bodyClassName={styles.content}
                >
                    {pending && <PendingMessage />}
                    {(frameworkDetails?.previewImage || image) ? (
                        <ImagePreview
                            alt={frameworkDetails?.title ?? _ts('projectEdit', 'frameworkReferenceImageAlt')}
                            src={image ?? frameworkDetails?.previewImage}
                        />
                    ) : (
                        _ts('analyticalFramework', 'noImageUploaded')
                    )}
                </Modal>
            )}
        </>
    );
}

export default memo(FrameworkImageButton);
