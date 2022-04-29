import React from 'react';
import {
    IoDocument,
    IoDownloadOutline,
    IoCopyOutline,
    IoInformationCircleOutline,
    IoClose,
} from 'react-icons/io5';
import {
    Container,
    QuickActionButton,
    Tag,
    TextOutput,
    useBooleanState,
} from '@the-deep/deep-ui';

import styles from './styles.css';

function DocumentPreview() {
    const [infoPaneShown, showInfoPane, hideInfoPane] = useBooleanState(true);
    return (
        <Container
            className={styles.documentPreview}
            heading={(
                <div className={styles.title}>
                    <Tag
                        icons={<IoDocument />}
                    >
                        Title of the document.
                    </Tag>
                </div>
            )}
            headerActions={(
                <>
                    <QuickActionButton
                        name={undefined}
                    >
                        <IoDownloadOutline />
                    </QuickActionButton>
                    <QuickActionButton
                        name={undefined}
                    >
                        <IoCopyOutline />
                    </QuickActionButton>
                    <QuickActionButton
                        name={undefined}
                        onClick={infoPaneShown ? hideInfoPane : showInfoPane}
                    >
                        <IoInformationCircleOutline />
                    </QuickActionButton>
                </>
            )}
            borderBelowHeader
            contentClassName={styles.content}
        >
            <div className={styles.preview}>
                Preview Pane
            </div>
            {infoPaneShown && (
                <Container
                    className={styles.sidePane}
                    heading="Details"
                    headerActions={(
                        <QuickActionButton
                            name={undefined}
                            onClick={hideInfoPane}
                        >
                            <IoClose />
                        </QuickActionButton>
                    )}
                    borderBelowHeader
                >
                    <h4>Metadata</h4>
                    <TextOutput
                        label="Project"
                        value="Test Project"
                    />
                    <TextOutput
                        label="Author"
                        value="Aditya Khatri"
                    />
                    <TextOutput
                        label="Source"
                        value="BBC"
                    />
                    <TextOutput
                        label="Date of Publication"
                        value="29 Mar, 2022"
                    />
                </Container>
            )}
        </Container>
    );
}
export default DocumentPreview;
