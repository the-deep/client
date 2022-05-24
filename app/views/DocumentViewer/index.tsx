import React, { useMemo, useState, useContext, useCallback } from 'react';
import { useParams, generatePath } from 'react-router-dom';
import { _cs, isDefined } from '@togglecorp/fujs';
import {
    IoDownloadOutline,
    IoCopyOutline,
    IoInformationCircleOutline,
    IoClose,
} from 'react-icons/io5';
import { removeNull } from '@togglecorp/toggle-form';
import {
    Container,
    QuickActionLink,
    QuickActionButton,
    TextOutput,
    PendingMessage,
    DateOutput,
    useBooleanState,
    useAlert,
    Button,
} from '@the-deep/deep-ui';
import {
    useQuery,
    gql,
} from '@apollo/client';

import LeadPreview from '#components/lead/LeadPreview';
import routes from '#base/configs/routes';
import PageTitle from '#base/components/PageTitle';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import UserContext from '#base/context/UserContext';
import FullPageErrorMessage from '#views/FullPageErrorMessage';
import { useModalState } from '#hooks/stateManagement';

import ProjectJoinModal from '#views/ExploreDeep/ActionCell/ProjectJoinModal';
import OrganizationLink from '#components/OrganizationLink';

import {
    PublicLeadQuery,
    LeadSourceTypeEnum,
    PublicLeadQueryVariables,
} from '#generated/types';

import styles from './styles.css';

function isWebsiteType(sourceType: LeadSourceTypeEnum) {
    return sourceType === 'WEBSITE' || sourceType === 'RSS' || sourceType === 'EMM' || sourceType === 'WEB_API';
}

function isAttachmentType(sourceType: LeadSourceTypeEnum) {
    return sourceType === 'DISK' || sourceType === 'DROPBOX' || sourceType === 'GOOGLE_DRIVE';
}

const PUBLIC_LEAD = gql`
    query PublicLead($uuid: UUID!) {
        publicLead(uuid: $uuid) {
            lead {
                attachment {
                    title
                    mimeType
                    file {
                        name
                        url
                    }
                }
                createdByDisplayName
                publishedOn
                projectTitle
                title
                sourceTitle
                sourceUrl
                sourceType
                text
                url
                uuid
            }
            project {
                id
                isRejected
                membershipPending
                title
            }
        }
    }
`;

interface Props {
    className?: string;
}

function DocumentViewer(props: Props) {
    const {
        className,
    } = props;
    const { leadHash } = useParams<{ leadHash: string }>();
    const [infoPaneShown, showInfoPane, hideInfoPane] = useBooleanState(true);
    const { authenticated } = useContext(UserContext);
    const [isLeadAccessible, setIsLeadAccessible] = useState(false);
    const [joinButtonVisible, setJoinButtonVisibility] = useState(true);

    const alert = useAlert();

    const {
        data: publicLeadData,
        loading,
    } = useQuery<PublicLeadQuery, PublicLeadQueryVariables>(
        PUBLIC_LEAD,
        {
            variables: {
                uuid: leadHash,
            },
            onCompleted: (response) => {
                if (!response) {
                    alert.show(
                        'There was an issue while viewing this document.',
                        { variant: 'error' },
                    );
                    return;
                }
                setIsLeadAccessible(isDefined(response.publicLead?.lead));
            },
            onError: () => {
                alert.show(
                    'There was an issue while viewing this document.',
                    { variant: 'error' },
                );
            },
        },
    );

    const publicLeadDetails = removeNull(publicLeadData?.publicLead?.lead);
    const publicLeadProjectDetails = removeNull(publicLeadData?.publicLead?.project);

    const [
        showProjectJoinModal,
        setModalVisible,
        setModalHidden,
    ] = useModalState(false);

    const handleCopyToClipboard = useCallback(() => {
        const documentViewerLink = generatePath(routes.documentViewerRedirect.path, { leadHash });
        navigator.clipboard.writeText(`${window.location.origin}${documentViewerLink}`);

        alert.show(
            'Document link successfully copied to clipboard.',
            {
                variant: 'info',
            },
        );
    }, [
        leadHash,
        alert,
    ]);

    const handleJoinRequestSuccess = useCallback(() => {
        setJoinButtonVisibility(false);
    }, []);

    const linkForDownload = useMemo(() => {
        const attachmentUrl = isAttachmentType(publicLeadDetails?.sourceType)
            ? publicLeadDetails?.attachment?.file?.url : undefined;
        const url = isWebsiteType(publicLeadDetails?.sourceType)
            ? publicLeadDetails?.url : undefined;

        return url ?? attachmentUrl;
    }, [publicLeadDetails]);

    if (loading) {
        return (
            <PendingMessage />
        );
    }

    if (!authenticated && !isLeadAccessible) {
        return (
            <FullPageErrorMessage
                errorTitle="Oops!"
                errorMessage="This document is cannot be previewed publicly or does not exist. Try logging in."
                krakenVariant="hi"
                hideGotoHomepageButton
                buttons={(
                    <SmartButtonLikeLink
                        variant="primary"
                        route={routes.login}
                        search={`?redirect=${window.location.pathname}`}
                    >
                        Login
                    </SmartButtonLikeLink>
                )}
            />
        );
    }

    if (authenticated && !isLeadAccessible) {
        let errorMessage = 'You don\'t have access to this document.';

        if (!publicLeadProjectDetails?.membershipPending && !publicLeadProjectDetails?.isRejected) {
            errorMessage = 'You don\'t have access to this document. Try joining the project.';
        } else if (
            publicLeadProjectDetails?.membershipPending
        ) {
            errorMessage = 'You don\'t have access to this document. The project admin is currently reviewing your request to join the project.';
        }

        return (
            <>
                <FullPageErrorMessage
                    errorTitle="Oops!"
                    errorMessage={errorMessage}
                    buttons={(
                        publicLeadProjectDetails?.id
                        && !publicLeadProjectDetails?.membershipPending
                        && !publicLeadProjectDetails?.isRejected
                        && joinButtonVisible
                    ) && (
                        <Button
                            name={undefined}
                            onClick={setModalVisible}
                        >
                            Request to join project
                        </Button>
                    )}
                />
                {showProjectJoinModal && (
                    <ProjectJoinModal
                        projectId={publicLeadProjectDetails?.id}
                        onModalClose={setModalHidden}
                        onJoinRequestSuccess={handleJoinRequestSuccess}
                    />
                )}
            </>
        );
    }

    return (
        <Container
            className={_cs(className, styles.documentViewer)}
            heading={publicLeadDetails?.title}
            borderBelowHeader
            contentClassName={styles.content}
            headerClassName={styles.header}
            headerActions={(
                <>
                    {linkForDownload && (
                        <QuickActionLink
                            to={linkForDownload}
                            title="Download Document"
                            download
                        >
                            <IoDownloadOutline />
                        </QuickActionLink>
                    )}
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
            <PageTitle value={`${publicLeadDetails?.title} - DEEP`} />
            <div
                className={_cs(
                    styles.previewContainer,
                    !infoPaneShown && styles.previewContainerWithPane,
                )}
            >
                <LeadPreview
                    className={styles.preview}
                    url={
                        isWebsiteType(publicLeadDetails?.sourceType)
                            ? publicLeadDetails?.url : undefined
                    }
                    attachment={
                        isAttachmentType(publicLeadDetails?.sourceType)
                            ? publicLeadDetails?.attachment : undefined
                    }
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
                    {publicLeadDetails?.projectTitle && (
                        <TextOutput
                            label="Project"
                            className={styles.textOutput}
                            value={publicLeadDetails?.projectTitle}
                            labelContainerClassName={styles.label}
                            valueContainerClassName={styles.value}
                            hideLabelColon
                        />
                    )}
                    <TextOutput
                        className={styles.textOutput}
                        label="Created By"
                        value={publicLeadDetails?.createdByDisplayName}
                        labelContainerClassName={styles.label}
                        valueContainerClassName={styles.value}
                        hideLabelColon
                    />
                    <TextOutput
                        className={styles.textOutput}
                        label="Source"
                        value={(
                            <OrganizationLink
                                title={publicLeadDetails?.sourceTitle}
                                link={publicLeadDetails?.sourceUrl}
                            />
                        )}
                        labelContainerClassName={styles.label}
                        valueContainerClassName={styles.value}
                        hideLabelColon
                    />
                    <TextOutput
                        className={styles.textOutput}
                        label="Date of Publication"
                        value={(<DateOutput value={publicLeadDetails?.publishedOn} />)}
                        labelContainerClassName={styles.label}
                        valueContainerClassName={styles.value}
                        hideLabelColon
                    />
                </Container>
            )}
        </Container>
    );
}
export default DocumentViewer;
