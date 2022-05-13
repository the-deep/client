import React, { useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { _cs, isDefined, doesObjectHaveNoData } from '@togglecorp/fujs';
import {
    IoDownloadOutline,
    IoCopyOutline,
    IoInformationCircleOutline,
    IoClose,
} from 'react-icons/io5';
import {
    Container,
    QuickActionButton,
    TextOutput,
    useBooleanState,
    useAlert,
} from '@the-deep/deep-ui';

import LeadPreview from '#components/lead/LeadPreview';
import ProjectContext from '#base/context/ProjectContext';
import UserContext from '#base/context/UserContext';

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
    const { user } = useContext(UserContext);
    const isAuthenticated = !doesObjectHaveNoData(user);
    const isProjectMember = isAuthenticated && isDefined(project?.currentUserRole);
    const alert = useAlert();
    // TODO: Remove after redirection
    console.warn('isProjectMember', isProjectMember);
    // TODO: Remove after redirection
    console.warn('isAuthenticated', isAuthenticated);
    // TODO: Remove after redirection
    console.warn('lead ID', leadId);

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
            borderBelowHeader
            contentClassName={styles.content}
            headerClassName={styles.header}
            headerActions={(
                <>
                    <QuickActionButton
                        name={undefined}
                        onClick={handlePrintClick}
                        title="Print Document"
                    >
                        <IoDownloadOutline />
                    </QuickActionButton>
                    <QuickActionButton
                        name={undefined}
                        onClick={handleCopyToClipboard}
                        title="Copy Link"
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
        >
            <div
                className={_cs(
                    styles.previewContainer,
                    !infoPaneShown && styles.previewContainerWithPane,
                )}
            >
                <LeadPreview
                    className={styles.preview}
                    url={url}
                    hideBar
                    // attachment={attachment}
                />
            </div>
            {infoPaneShown && (
                <Container
                    className={styles.sidePane}
                    heading="Details"
                    headerClassName={styles.sidePaneHeader}
                    headerActions={(
                        <QuickActionButton
                            name={undefined}
                            onClick={hideInfoPane}
                        >
                            <IoClose />
                        </QuickActionButton>
                    )}
                    borderBelowHeader
                    contentClassName={styles.detailsContent}
                >
                    <TextOutput
                        label="Project"
                        value="Test Project"
                        labelContainerClassName={styles.label}
                        valueContainerClassName={styles.value}
                    />
                    <TextOutput
                        label="Author"
                        value="Aditya Khatri"
                        labelContainerClassName={styles.label}
                        valueContainerClassName={styles.value}
                    />
                    <TextOutput
                        label="Source"
                        value="BBC"
                        labelContainerClassName={styles.label}
                        valueContainerClassName={styles.value}
                    />
                    <TextOutput
                        label="Date of Publication"
                        value="29 Mar, 2022"
                        labelContainerClassName={styles.label}
                        valueContainerClassName={styles.value}
                    />
                </Container>
            )}
        </Container>
    );
}
export default DocumentPreview;
