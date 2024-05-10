import React, { memo, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import {
    _cs,
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';
import {
    Button,
    ButtonProps,
    Modal,
    PendingMessage,
    ImagePreview,
    Message,
    Kraken,
} from '@the-deep/deep-ui';

import {
    AnalysisFrameworkDetailsQuery,
    AnalysisFrameworkDetailsQueryVariables,
} from '#generated/types';

import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

import styles from './styles.css';

const ANALYSIS_FRAMEWORK_DETAILS = gql`
    query AnalysisFrameworkDetails(
        $frameworkId: ID!,
    ) {
        analysisFramework(id: $frameworkId) {
            title
            id
            previewImage {
                name
                url
            }
        }
    }
`;

export type Props = {
    label?: string;
    className?: string;
    variant?: ButtonProps<string>['variant'];
    frameworkId?: string;
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

    const analysisFrameworkVariables = useMemo(
        (): AnalysisFrameworkDetailsQueryVariables | undefined => (
            frameworkId ? { frameworkId } : undefined
        ),
        [frameworkId],
    );

    const {
        data: analysisFrameworkData,
        loading: analysisFrameworkLoading,
    } = useQuery<AnalysisFrameworkDetailsQuery, AnalysisFrameworkDetailsQueryVariables>(
        ANALYSIS_FRAMEWORK_DETAILS,
        {
            skip: isNotDefined(analysisFrameworkVariables),
            variables: analysisFrameworkVariables,
        },
    );

    const imageSource = useMemo(
        () => {
            if (isDefined(image)) {
                return image;
            }
            return analysisFrameworkData?.analysisFramework?.previewImage?.url;
        },
        [analysisFrameworkData, image],
    );

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
                    {analysisFrameworkLoading && <PendingMessage />}
                    {imageSource ? (
                        <ImagePreview
                            alt={analysisFrameworkData?.analysisFramework?.title ?? _ts('projectEdit', 'frameworkReferenceImageAlt')}
                            src={imageSource}
                        />
                    ) : (
                        <Message
                            icon={(
                                <Kraken
                                    size="large"
                                    variant="sleep"
                                />
                            )}
                            message={_ts('analyticalFramework', 'noImageUploaded')}
                        />
                    )}
                </Modal>
            )}
        </>
    );
}

export default memo(FrameworkImageButton);
