import React, { useMemo } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';
import {
    Modal,
} from '@the-deep/deep-ui';

import {
    AutoEntriesForLeadQuery,
    AutoEntriesForLeadQueryVariables,
} from '#generated/types';

const AUTO_ENTRIES_FOR_LEAD = gql`
    query AutoEntriesForLead(
        $projectId: ID!,
        $leadIds: [ID!],
    ) {
        project(id: $projectId) {
            assistedTagging {
                draftEntryByLeads(
                filter: {
                    draftEntryType: AUTO,
                    lead: $leadIds,
                }) {
                    id
                    excerpt
                    predictionReceivedAt
                    predictionStatus
                }
            }
        }
    }
`;

interface Props {
    onModalClose: () => void;
    projectId: string;
    leadId: string;
}

function AutoEntriesModal(props: Props) {
    const {
        onModalClose,
        projectId,
        leadId,
    } = props;

    const autoEntriesVariables = useMemo(() => ({
        projectId,
        leadIds: [leadId],
    }), [
        projectId,
        leadId,
    ]);

    const {
        data: autoEntries,
    } = useQuery<AutoEntriesForLeadQuery, AutoEntriesForLeadQueryVariables>(
        AUTO_ENTRIES_FOR_LEAD,
        {
            skip: isNotDefined(autoEntriesVariables),
            variables: autoEntriesVariables,
        },
    );

    console.log('here', autoEntries);

    return (
        <Modal
            onCloseButtonClick={onModalClose}
        >
            Auto entries here
        </Modal>
    );
}

export default AutoEntriesModal;
