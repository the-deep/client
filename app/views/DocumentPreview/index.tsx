import React, { useState, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
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
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import UserContext from '#base/context/UserContext';
import FullPageErrorMessage from '#views/FullPageErrorMessage';
import { useModalState } from '#hooks/stateManagement';

// import ProjectJoinModal from '#views/ExploreDeep/ActionCell/ProjectJoinModal';

import {
    PublicLeadQuery,
    PublicLeadQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const PUBLIC_LEAD = gql`
    query PublicLead($uuid: UUID!) {
        publicLead(uuid: $uuid) {
            lead {
                attachment {
                    title
                    file {
                        name
                        url
                    }
                }
                createdByDisplayName
                publishedOn
                sourceTitle
                sourceType
                sourceTypeDisplay
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

function DocumentPreview(props: Props) {
    const {
        className,
    } = props;
    const { leadHash } = useParams<{ leadHash: string }>();
    const [infoPaneShown, showInfoPane, hideInfoPane] = useBooleanState(true);
    const { authenticated } = useContext(UserContext);
    const [isLeadAccessible, setIsLeadAccessible] = useState(false);

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
                    return;
                }
                const { publicLead } = response;
                if (isDefined(publicLead)) {
                    setIsLeadAccessible(true);
                } else {
                    setIsLeadAccessible(false);
                }
            },
        },
    );

    const publicLeadDetails = removeNull(publicLeadData?.publicLead?.lead);
    const publicLeadProjectDetails = removeNull(publicLeadData?.publicLead?.project);

    const alert = useAlert();
    const [
        showProjectJoinModal,
        setModalVisible,
        setModalHidden,
    ] = useModalState(false);

    const handleCopyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(publicLeadDetails?.url ?? publicLeadDetails?.attachment?.file?.url ?? '');

        alert.show(
            'URL successfully copied to clipboard',
            {
                variant: 'info',
            },
        );
    }, [
        publicLeadDetails,
        alert,
    ]);

    const handlePrintClick = useCallback(() => {
        window.print();
    }, []);

    if (loading) {
        return (
            <PendingMessage />
        );
    }

    if (!authenticated && !isLeadAccessible) {
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

    if (authenticated && !isLeadAccessible) {
        return (
            <FullPageErrorMessage
                errorTitle="Forbidden"
                errorMessage={(
                    publicLeadProjectDetails?.id
                    || !publicLeadProjectDetails?.isRejected
                )
                    ? 'You cannot see this lead. Try joining project.'
                    : 'Go to homepage'}
                buttons={(
                    !publicLeadProjectDetails?.id
                    || publicLeadProjectDetails?.isRejected
                ) && (
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
            heading={publicLeadDetails?.sourceTitle}
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
                    url={publicLeadDetails?.url ?? undefined}
                    attachment={publicLeadDetails?.attachment ?? undefined}
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
                    {publicLeadProjectDetails?.id && (
                        <TextOutput
                            label="Project"
                            value={publicLeadProjectDetails?.title}
                            labelContainerClassName={styles.label}
                            valueContainerClassName={styles.value}
                        />
                    )}
                    <TextOutput
                        label="Created By"
                        value={publicLeadDetails?.createdByDisplayName}
                        labelContainerClassName={styles.label}
                        valueContainerClassName={styles.value}
                    />
                    <TextOutput
                        label="Source"
                        value={publicLeadDetails?.sourceTitle}
                        labelContainerClassName={styles.label}
                        valueContainerClassName={styles.value}
                    />
                    <TextOutput
                        label="Date of Publication"
                        value={(<DateOutput value={publicLeadDetails?.publishedOn} />)}
                        labelContainerClassName={styles.label}
                        valueContainerClassName={styles.value}
                    />
                    {/* showProjectJoinModal && (
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
                        ) */}
                </Container>
            )}
        </Container>
    );
}
export default DocumentPreview;
