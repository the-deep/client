import React, { useCallback, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import { Card } from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import {
    Error,
    SetBaseValueArg,
} from '@togglecorp/toggle-form';

import {
    LeadType,
    LeadOptionsQuery,
    LeadOptionsQueryVariables,
} from '#generated/types';
import { ProjectContext } from '#base/context/ProjectContext';
import LeadPreview from '#components/lead/LeadPreview';
import LeadInput from '#components/lead/LeadInput';
import { PartialFormType } from '#components/lead/LeadInput/schema';
import { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import { BasicProjectUser } from '#components/selections/ProjectUserSelectInput';
import { BasicLeadGroup } from '#components/selections/LeadGroupSelectInput';

import styles from './styles.css';

const LEAD_OPTIONS = gql`
    query LeadOptions {
        leadPriorityOptions: __type(name: "LeadPriorityEnum") {
            enumValues {
                name
                description
            }
        }
        leadConfidentialityOptions: __type(name: "LeadConfidentialityEnum") {
            enumValues {
                name
                description
            }
        }
    }
`;

interface Props {
    className?: string;
    pending: boolean;
    leadValue: PartialFormType;
    leadFormError: Error<PartialFormType> | undefined;
    setValue: (value: SetBaseValueArg<PartialFormType>, reset?: boolean) => void;
    projectId: string;
    disabled?: boolean;
    sourceOrganizationOptions: BasicOrganization[] | undefined | null;
    // eslint-disable-next-line max-len
    onSourceOrganizationOptionsChange: React.Dispatch<React.SetStateAction<BasicOrganization[] | undefined | null>>;
    authorOrganizationOptions: BasicOrganization[] | undefined | null;
    // eslint-disable-next-line max-len
    onAuthorOrganizationOptionsChange: React.Dispatch<React.SetStateAction<BasicOrganization[] | undefined | null>>;
    leadGroupOptions: BasicLeadGroup[] | undefined | null;
    // eslint-disable-next-line max-len
    onLeadGroupOptionsChange: React.Dispatch<React.SetStateAction<BasicLeadGroup[] | undefined | null>>;
    assigneeOptions: BasicProjectUser[] | undefined | null;
    // eslint-disable-next-line max-len
    onAssigneeOptionChange: React.Dispatch<React.SetStateAction<BasicProjectUser[] | undefined | null>>;
    attachment: LeadType['attachment'];
}

function SourceDetails(props: Props) {
    const {
        className,
        leadValue,
        setValue,
        leadFormError,
        pending,
        projectId,
        disabled,
        attachment,
        sourceOrganizationOptions,
        onSourceOrganizationOptionsChange,
        authorOrganizationOptions,
        onAuthorOrganizationOptionsChange,
        leadGroupOptions,
        onLeadGroupOptionsChange,
        assigneeOptions,
        onAssigneeOptionChange,
    } = props;

    const { project } = useContext(ProjectContext);

    const {
        loading: leadOptionsLoading,
        data: leadOptions,
    } = useQuery<LeadOptionsQuery, LeadOptionsQueryVariables>(
        LEAD_OPTIONS,
    );

    const handleLeadChange = useCallback((newValue: SetBaseValueArg<PartialFormType>) => {
        setValue(newValue, true);
    }, [setValue]);

    return (
        <div className={_cs(className, styles.sourceDetails)}>
            <Card className={styles.previewContainer}>
                <LeadPreview
                    className={styles.preview}
                    url={leadValue.url ?? undefined}
                    attachment={attachment}
                />
            </Card>
            <Card className={styles.formContainer}>
                <LeadInput
                    name="lead"
                    pending={pending || leadOptionsLoading}
                    value={leadValue}
                    error={leadFormError}
                    onChange={handleLeadChange}
                    projectId={projectId}
                    disabled={disabled}
                    sourceOrganizationOptions={sourceOrganizationOptions}
                    onSourceOrganizationOptionsChange={onSourceOrganizationOptionsChange}
                    authorOrganizationOptions={authorOrganizationOptions}
                    onAuthorOrganizationOptionsChange={onAuthorOrganizationOptionsChange}
                    leadGroupOptions={leadGroupOptions}
                    onLeadGroupOptionsChange={onLeadGroupOptionsChange}
                    assigneeOptions={assigneeOptions}
                    onAssigneeOptionChange={onAssigneeOptionChange}
                    attachment={attachment}
                    priorityOptions={leadOptions?.leadPriorityOptions?.enumValues}
                    confidentialityOptions={
                        leadOptions?.leadConfidentialityOptions?.enumValues
                    }
                    hasAssessment={project?.hasAssessmentTemplate}
                />
            </Card>
        </div>
    );
}

export default SourceDetails;
