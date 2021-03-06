import React, { memo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    ButtonProps,
    Modal,
    PendingMessage,
    ImagePreview,
} from '@the-deep/deep-ui';

import { useRequest } from '#utils/request';
import { useModalState } from '#hooks/stateManagement';
import { AnalyticalFramework } from '#typings';
import _ts from '#ts';

import styles from './styles.scss';

const query = {
    fields: ['title', 'preview_image', 'id'],
};

interface Props {
    frameworkId: number;
    label?: string;
    className?: string;
    variant?: ButtonProps<string>['variant'];
}

function FrameworkImageButton(props: Props) {
    const {
        className,
        frameworkId,
        label,
        variant,
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
        skip: !isModalVisible,
        url: `server://analysis-frameworks/${frameworkId}/`,
        query,
        method: 'GET',
        failureHeader: _ts('analyticalFramework', 'title'),
    });

    return (
        <>
            <Button
                name={frameworkId}
                className={_cs(
                    !variant && styles.frameworkImageButton,
                    className,
                )}
                onClick={showModal}
                variant={variant ?? 'action'}
            >
                {label}
            </Button>
            {isModalVisible && (
                <Modal
                    className={styles.modal}
                    heading={label}
                    onCloseButtonClick={hideModal}
                    bodyClassName={styles.content}
                >
                    {pending && <PendingMessage />}
                    {frameworkDetails?.previewImage ? (
                        <ImagePreview
                            alt={frameworkDetails?.title ?? _ts('projectEdit', 'frameworkReferenceImageAlt')}
                            src={frameworkDetails.previewImage}
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
