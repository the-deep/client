import React, { useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
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
    useAlert,
} from '@the-deep/deep-ui';

import LeadPreview from '#components/lead/LeadPreview';
import ProjectContext from '#base/context/ProjectContext';

import styles from './styles.css';

interface Props {
    url?: string;
    // attachment?: unknown;
    className?: string;
}
function DocumentPreview(props: Props) {
    const {
        url = 'https://www.onlinekhabar.com/2022/05/1123315',
        // TODO: remove this after connecting to API
        // attachment,
        className,
    } = props;
    const { leadId } = useParams<{ leadId: string }>();
    const [infoPaneShown, showInfoPane, hideInfoPane] = useBooleanState(true);
    const { project } = useContext(ProjectContext);

    const alert = useAlert();
    console.warn(leadId, project);

    const handleCopyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(url ?? '');

        alert.show(
            'URL successfully copied to clipboard',
            {
                variant: 'info',
            },
        );
    }, [url, alert]);

    const handlePrintClick = useCallback(() => {
        window.print();
    }, []);

    return (
        <Container
            className={_cs(className, styles.documentPreview)}
            heading="Title of the document"
            spacing="loose"
            headerActions={(
                <>
                    <QuickActionButton
                        name={undefined}
                        onClick={handlePrintClick}
                        title="print document"
                    >
                        <IoDownloadOutline />
                    </QuickActionButton>
                    <QuickActionButton
                        name={undefined}
                        onClick={handleCopyToClipboard}
                        title="copy URL to clipboard"
                    >
                        <IoCopyOutline />
                    </QuickActionButton>
                    <QuickActionButton
                        name={undefined}
                        onClick={infoPaneShown ? hideInfoPane : showInfoPane}
                        title={infoPaneShown ? 'Hide info' : 'Show more info'}
                    >
                        <IoInformationCircleOutline />
                    </QuickActionButton>
                </>
            )}
            borderBelowHeader
            contentClassName={styles.content}
        >
            <div className={styles.previewContainer}>
                <LeadPreview
                    className={styles.preview}
                    url={url}
                    // attachment={attachment}
                />
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
