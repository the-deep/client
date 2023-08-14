import React from 'react';
import { Modal } from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';

const GET_ISSUE_OPTIONS = gql`
    query GetIssueOptions {
        subDimmensionOptions: __type(name: "AssessmentRegistrySummarySubDimmensionTypeEnum") {
            enumValues {
                name
                description
            }
        }
        subPillarOptions: __type(name: "AssessmentRegistrySummarySubPillarTypeEnum") {
            enumValues {
                name
                description
            }
        }
    }
`;

interface Props {
    handleCloseModal: () => void;
}
function IssueEditor(props: Props) {
    const {
        handleCloseModal,
    } = props;

    const {
        data: options,
    } = useQuery(
        GET_ISSUE_OPTIONS,
    );

    console.log('option', options);

    return (
        <Modal
            heading="Issue editor"
            size="medium"
            onCloseButtonClick={handleCloseModal}
        >
            modal
        </Modal>
    );
}

export default IssueEditor;
