import React, { useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
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
    DateOutput,
    useBooleanState,
    useAlert,
    Button,
} from '@the-deep/deep-ui';

import LeadPreview from '#components/lead/LeadPreview';
import routes from '#base/configs/routes';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import ProjectContext from '#base/context/ProjectContext';
import UserContext from '#base/context/UserContext';
import FullPageErrorMessage from '#views/FullPageErrorMessage';
import { useModalState } from '#hooks/stateManagement';

import ProjectJoinModal from '#views/ExploreDeep/ActionCell/ProjectJoinModal';

import styles from './styles.css';

interface Response {
    url: string;
    projectId: string;
    lead: {
        id: string;
        title: string;
        authoringOrganization: string;
        publishedDate: string;
    };
    canViewLead: boolean;
}

const mockResponse: Response = {
    url: 'https://www.onlinekhabar.com/2022/05/1123315',
    lead: {
        id: '1',
        title: 'Congress candidate from Kapilvastu dies',
        authoringOrganization: 'BBC',
        publishedDate: '2022-02-15T05:08:27.130741+00:00',
    },
    canViewLead: false,
    projectId: '1',
};

interface Props {
    className?: string;
}

function DocumentPreview(props: Props) {
    const {
        className,
    } = props;
    const { leadId } = useParams<{ leadId: string }>();
    const [infoPaneShown, showInfoPane, hideInfoPane] = useBooleanState(true);
    const { project } = useContext(ProjectContext);
    const { authenticated } = useContext(UserContext);

    const {
        url,
        lead,
        canViewLead,
        projectId,
    } = mockResponse;
    const alert = useAlert();
    // TODO: Remove after redirection
    console.warn('lead ID', leadId);
    const [
        showProjectJoinModal,
        setModalVisible,
        setModalHidden,
    ] = useModalState(false);

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

    if (!authenticated && !canViewLead) {
        return (
            <FullPageErrorMessage
                errorTitle="Not logged in"
                errorMessage="You are not logged in. Try logging in."
                krakenVariant="hi"
                buttons={(
                    <SmartButtonLikeLink
                        variant="primary"
                        route={routes.login}
                    >
                        Go to Login page
                    </SmartButtonLikeLink>
                )}
            />
        );
    }

    if (authenticated && !canViewLead) {
        return (
            <FullPageErrorMessage
                errorTitle="Forbidden"
                errorMessage="You cannot see this lead. Try joining project."
                buttons={(
                    <Button
                        name={undefined}
                        onClick={setModalVisible}
                    >
                        Request to join project
                    </Button>
                )}
            />
        );
    }

    return (
        <Container
            className={_cs(className, styles.documentPreview)}
            heading={lead?.title}
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
                    url={mockResponse?.url}
                    hideBar
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
                        value={project?.title}
                        labelContainerClassName={styles.label}
                        valueContainerClassName={styles.value}
                    />
                    <TextOutput
                        label="Author"
                        value={lead?.authoringOrganization}
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
                        value={(<DateOutput value={lead?.publishedDate} />)}
                        labelContainerClassName={styles.label}
                        valueContainerClassName={styles.value}
                    />
                    {showProjectJoinModal && (
                        <ProjectJoinModal
                            projectId={projectId}
                            onModalClose={setModalHidden}
                            onJoinRequestSuccess={() => {
                                alert.show(
                                    'Successfully sent project join request',
                                    { variant: 'success' },
                                );
                            }}
                        />
                    )}
                </Container>
            )}
        </Container>
    );
}
export default DocumentPreview;
