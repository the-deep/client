import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    isNotDefined,
    _cs,
} from '@togglecorp/fujs';
import {
    Button,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    Portal,
} from '@the-deep/deep-ui';
import { useForm } from '@togglecorp/toggle-form';

import ProjectContext from '#base/context/ProjectContext';
import { useRequest } from '#base/utils/restRequest';
import FullPageHeader from '#components/FullPageHeader';
import BackLink from '#components/BackLink';
import {
    schema as leadSchema,
    PartialFormType as PartialLeadFormType,
    Lead,
} from '#views/Sources/LeadEditModal/LeadEditForm/schema';

import SourceDetails from './SourceDetails';
import PrimaryTagging from './PrimaryTagging';
import SecondaryTagging from './SecondaryTagging';
import Review from './Review';

import styles from './styles.css';

interface Props {
    className?: string;
}

function TaggingFlow(props: Props) {
    const { className } = props;
    const { project } = React.useContext(ProjectContext);
    const { leadId } = useParams<{ leadId: string }>();
    const projectId = project ? +project.id : undefined;

    const [ready, setReady] = useState(!leadId);
    const [leadInitialValue, setLeadInitialValue] = useState<PartialLeadFormType>(() => ({
        project: projectId,
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
        <Portal>
            <div className={_cs(styles.projectEdit, className)}>
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
                                disabled={isNotDefined(projectId)}
                                transparentBorder
                            >
                                Primary Tagging
                            </Tab>
                            <Tab
                                name="secondary-tagging"
                                disabled={isNotDefined(projectId)}
                                transparentBorder
                            >
                                Secondary Tagging
                            </Tab>
                            <Tab
                                name="review"
                                disabled={isNotDefined(projectId)}
                                transparentBorder
                            >
                                Review
                            </Tab>
                        </TabList>
                    </FullPageHeader>
                    <div className={styles.tabPanelContainer}>
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
                                    projectId={projectId}
                                />
                            )}
                        </TabPanel>
                        <TabPanel
                            className={styles.tabPanel}
                            name="primary-tagging"
                        >
                            <PrimaryTagging
                                lead={lead}
                                className={styles.primaryTagging}
                            />
                        </TabPanel>
                        <TabPanel
                            name="secondary-tagging"
                            className={styles.tabPanel}
                        >
                            <SecondaryTagging />
                        </TabPanel>
                        <TabPanel
                            name="review"
                            className={styles.tabPanel}
                        >
                            <Review />
                        </TabPanel>
                    </div>
                </Tabs>
            </div>
        </Portal>
    );
}

export default TaggingFlow;
