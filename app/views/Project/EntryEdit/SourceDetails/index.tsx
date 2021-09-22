import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Card } from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import {
    EntriesAsList,
    Error,
    SetBaseValueArg,
} from '@togglecorp/toggle-form';

import {
    LeadType,
    LeadOptionsQuery,
    LeadOptionsQueryVariables,
} from '#generated/types';
import LeadPreview from '#components/lead/LeadPreview';
import LeadEditForm from '#components/lead/LeadEditForm';
import { PartialFormType } from '#components/lead/LeadEditForm/schema';
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
    }
`;

interface Props {
    className?: string;
    pending: boolean;
    leadValue: PartialFormType;
    setLeadFieldValue: (...values: EntriesAsList<PartialFormType>) => void;
    leadFormError: Error<PartialFormType> | undefined;
    setValue: (value: SetBaseValueArg<PartialFormType>) => void;
    setPristine: (val: boolean) => void;
    projectId: string;
    disabled?: boolean;
    sourceOrganization: BasicOrganization | undefined | null;
    authorOrganizations: BasicOrganization[] | undefined | null;
    leadGroup: BasicLeadGroup | undefined | null;
    assignee: BasicProjectUser | undefined | null;
    attachment: LeadType['attachment'];
}

function SourceDetails(props: Props) {
    const {
        className,
        leadValue,
        setLeadFieldValue,
        setValue,
        setPristine,
        leadFormError,
        pending,
        projectId,
        disabled,
        sourceOrganization,
        authorOrganizations,
        leadGroup,
        assignee,
        attachment,
    } = props;

    const {
        loading: leadOptionsLoading,
        data: leadOptions,
    } = useQuery<LeadOptionsQuery, LeadOptionsQueryVariables>(
        LEAD_OPTIONS,
    );

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
                <LeadEditForm
                    pending={pending || leadOptionsLoading}
                    value={leadValue}
                    setFieldValue={setLeadFieldValue}
                    error={leadFormError}
                    setValue={setValue}
                    setPristine={setPristine}
                    projectId={projectId}
                    disabled={disabled}
                    sourceOrganization={sourceOrganization}
                    authorOrganizations={authorOrganizations}
                    leadGroup={leadGroup}
                    assignee={assignee}
                    attachment={attachment}
                    priorityOptions={leadOptions?.leadPriorityOptions?.enumValues}
                />
            </Card>
        </div>
    );
}

export default SourceDetails;
