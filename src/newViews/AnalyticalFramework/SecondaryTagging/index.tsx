import React from 'react';

import {
    ElementFragments,
    ImagePreview,
    Button,
    Container,
    Modal,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import { useModalState } from '#hooks/stateManagement';

import _ts from '#ts';
import styles from './styles.scss';

interface Props {
    className?: string;
    frameworkId: number;
}

function SecondaryTagging(props: Props) {
    const {
        className,
        frameworkId,
    } = props;

    // NOTE: intentional console.info
    console.info('secondary tagging in the framework', frameworkId);

    const [
        showPreviewModal,
        setShowPreviewModalTrue,
        setShowPreviewModalFalse,
    ] = useModalState(false);

    return (
        <div className={_cs(styles.secondaryTagging, className)}>
            <Container
                className={styles.widgetListContainer}
                heading={_ts('analyticalFramework.secondaryTagging', 'buildingModulesHeading')}
                sub
            >
                Under construction
            </Container>
            <div className={styles.frameworkPreview}>
                <div className={styles.topBar}>
                    <ElementFragments
                        actions={(
                            <Button
                                name={undefined}
                                disabled
                            >
                                {_ts('analyticalFramework.secondaryTagging', 'nextButtonLabel')}
                            </Button>
                        )}
                    >
                        <Button
                            name={undefined}
                            variant="inverted"
                            onClick={setShowPreviewModalTrue}
                        >
                            {_ts('analyticalFramework.secondaryTagging', 'viewFrameworkImageButtonLabel')}
                        </Button>
                    </ElementFragments>
                </div>
            </div>
            {showPreviewModal && (
                <Modal
                    className={styles.frameworkImagePreviewModal}
                    onCloseButtonClick={setShowPreviewModalFalse}
                    bodyClassName={styles.body}
                >
                    <ImagePreview
                        className={styles.preview}
                        src="https://i.imgur.com/3Zk4aNH.jpg"
                        alt="Under construction"
                    />
                </Modal>
            )}
        </div>
    );
}

export default SecondaryTagging;
