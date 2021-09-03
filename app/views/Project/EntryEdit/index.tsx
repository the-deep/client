import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    isNotDefined,
    _cs,
} from '@togglecorp/fujs';
import {
    PendingMessage,
    Button,
    Tabs,
    Tab,
    TabList,
    TabPanel,
} from '@the-deep/deep-ui';
import {
    useForm,
    removeNull,
} from '@togglecorp/toggle-form';
import { useQuery } from '@apollo/client';

import ProjectContext from '#base/context/ProjectContext';
import { useRequest } from '#base/utils/restRequest';
import FullPageHeader from '#components/FullPageHeader';
import BackLink from '#components/BackLink';
import {
    schema as leadSchema,
    PartialFormType as PartialLeadFormType,
    Lead,
} from '#components/LeadEditForm/schema';
import {
    ProjectFrameworkQuery,
    ProjectFrameworkQueryVariables,
} from '#generated/types';
import { AnalysisFramework } from '#types/newAnalyticalFramework';
import { PROJECT_FRAMEWORK } from './queries';

import type { Entry as EditableEntry } from './LeftPane';
import SourceDetails from './SourceDetails';
import PrimaryTagging from './PrimaryTagging';
import SecondaryTagging from './SecondaryTagging';
import Review from './Review';

import styles from './styles.css';

type FrameworkDetailsMini = Pick<AnalysisFramework, 'id' | 'primaryTagging' | 'secondaryTagging'>;
/*
type Entry = NonNullable<
NonNullable<NonNullable<NonNullable<ProjectFrameworkQuery['project']>['lead']>['entries']>[number]
>;
*/

interface Props {
    className?: string;
}

function EntryEdit(props: Props) {
    const { className } = props;
    const { project } = React.useContext(ProjectContext);
    const { leadId } = useParams<{ leadId: string }>();
    const projectId = project ? project.id : undefined;
    const frameworkId = project?.analysisFramework?.id;

    const [entries, setEntries] = React.useState<EditableEntry[]>([]);
    const [activeEntry, setActiveEntry] = React.useState<EditableEntry['clientId'] | undefined>();

    const variables = useMemo(
        (): ProjectFrameworkQueryVariables | undefined => (
            (frameworkId && leadId && projectId) ? {
                frameworkId,
                projectId,
                leadId,
            } : undefined
        ),
        [
            frameworkId,
            leadId,
            projectId,
        ],
    );
    const {
        data,
        loading,
    } = useQuery<ProjectFrameworkQuery, ProjectFrameworkQueryVariables>(
        PROJECT_FRAMEWORK,
        {
            skip: isNotDefined(variables),
            variables,
        },
    );

    const frameworkDetails = useMemo(
        () => removeNull(data?.analysisFramework),
        [data?.analysisFramework],
    );

    const [ready, setReady] = useState(!leadId);
    const [leadInitialValue, setLeadInitialValue] = useState<PartialLeadFormType>(() => ({
        project: projectId ? +projectId : undefined,
        sourceType: 'website',
        priority: 100,
        confidentiality: 'unprotected',
        isAssessmentLead: false,
    }));

    const {
        value: leadValue,
        setFieldValue: setLeadFieldValue,
        setValue: setLeadValue,
        setPristine: setLeadPristine,
        error: leadFormError,
    } = useForm(leadSchema, leadInitialValue);

    const {
        pending: leadGetPending,
        response: lead,
    } = useRequest<Lead>({
        skip: !leadId,
        url: `server://v2/leads/${leadId}/`,
        onSuccess: (response) => {
            setLeadInitialValue(response);
            setLeadValue(response);
            setReady(true);
        },
        failureHeader: 'Leads',
    });

    return (
        <div className={_cs(styles.entryEdit, className)}>
            <Tabs
                useHash
                defaultHash="source-details"
            >
                <FullPageHeader
                    className={styles.header}
                    heading="Source"
                    description={lead?.title}
                    actions={(
                        <>
                            <BackLink defaultLink="/">
                                Close
                            </BackLink>
                            <Button
                                name={undefined}
                                variant="secondary"
                                // NOTE: To be fixed later
                                disabled
                            >
                                Save
                            </Button>
                            <Button
                                name={undefined}
                                // NOTE: To be fixed later
                                disabled
                            >
                                Finalize
                            </Button>
                        </>
                    )}
                >
                    <TabList>
                        <Tab
                            name="source-details"
                            transparentBorder
                        >
                            Source Details
                        </Tab>
                        <Tab
                            name="primary-tagging"
                            disabled={isNotDefined(frameworkId)}
                            transparentBorder
                        >
                            Primary Tagging
                        </Tab>
                        <Tab
                            name="secondary-tagging"
                            disabled={isNotDefined(frameworkId)}
                            transparentBorder
                        >
                            Secondary Tagging
                        </Tab>
                        <Tab
                            name="review"
                            disabled={isNotDefined(frameworkId)}
                            transparentBorder
                        >
                            Review
                        </Tab>
                    </TabList>
                </FullPageHeader>
                <div className={styles.tabPanelContainer}>
                    {loading && <PendingMessage />}
                    <TabPanel
                        className={styles.tabPanel}
                        name="source-details"
                    >
                        {projectId && (
                            <SourceDetails
                                leadValue={leadValue}
                                setValue={setLeadValue}
                                setPristine={setLeadPristine}
                                setLeadFieldValue={setLeadFieldValue}
                                leadFormError={leadFormError}
                                ready={ready}
                                pending={leadGetPending}
                                leadInitialValue={leadInitialValue}
                                projectId={+projectId}
                            />
                        )}
                    </TabPanel>
                    <TabPanel
                        className={styles.tabPanel}
                        name="primary-tagging"
                    >
                        {frameworkDetails && (
                            <PrimaryTagging
                                lead={lead}
                                className={styles.primaryTagging}
                                sections={frameworkDetails.primaryTagging as AnalysisFramework['primaryTagging']}
                                frameworkId={frameworkDetails.id}
                                entries={entries}
                                onEntriesChange={setEntries}
                                activeEntry={activeEntry}
                                onActiveEntryChange={setActiveEntry}
                            />
                        )}
                    </TabPanel>
                    <TabPanel
                        className={styles.tabPanel}
                        name="secondary-tagging"
                    >
                        {frameworkDetails && (
                            <SecondaryTagging
                                className={styles.secondaryTagging}
                                widgets={frameworkDetails.secondaryTagging as AnalysisFramework['secondaryTagging']}
                                frameworkId={frameworkDetails.id}
                                entries={entries}
                                activeEntry={activeEntry}
                                onActiveEntryChange={setActiveEntry}
                            />
                        )}
                    </TabPanel>
                    <TabPanel
                        name="review"
                        className={styles.tabPanel}
                    >
                        <Review
                            framework={frameworkDetails as FrameworkDetailsMini}
                        />
                    </TabPanel>
                </div>
            </Tabs>
        </div>
    );
}

export default EntryEdit;
