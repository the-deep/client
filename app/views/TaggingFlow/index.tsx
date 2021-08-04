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
} from '@the-deep/deep-ui';
import { useForm } from '@togglecorp/toggle-form';

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
    const {
        projectId,
        leadId,
    } = useParams<{
        projectId: string;
        leadId: string;
    }>();

    const [ready, setReady] = useState(!leadId);
    const [leadInitialValue, setLeadInitialValue] = useState<PartialLeadFormType>(() => ({
        project: +projectId,
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
        <div className={_cs(styles.projectEdit, className)}>
            <Tabs
                useHash
                defaultHash="source-details"
            >
                <FullPageHeader
                    className={styles.header}
                    actionsClassName={styles.actions}
                    heading={`Source ${lead?.title}`}
                    contentClassName={styles.content}
                    actions={(
                        <>
                            <BackLink
                                className={styles.button}
                                defaultLink="/"
                            >
                                Close
                            </BackLink>
                            <Button
                                name={undefined}
                                className={styles.button}
                                variant="secondary"
                                // NOTE: To be fixed later
                                disabled
                            >
                                Save
                            </Button>
                            <Button
                                name={undefined}
                                className={styles.button}
                                // NOTE: To be fixed later
                                disabled
                            >
                                Finalize
                            </Button>
                        </>
                    )}
                >
                    <TabList className={styles.tabList}>
                        <Tab
                            name="source-details"
                            className={styles.tab}
                            activeClassName={styles.activeTab}
                            transparentBorder
                        >
                            Source Details
                        </Tab>
                        <Tab
                            name="primary-tagging"
                            className={styles.tab}
                            disabled={isNotDefined(projectId)}
                            activeClassName={styles.activeTab}
                            transparentBorder
                        >
                            Primary Tagging
                        </Tab>
                        <Tab
                            name="secondary-tagging"
                            className={styles.tab}
                            disabled={isNotDefined(projectId)}
                            activeClassName={styles.activeTab}
                            transparentBorder
                        >
                            Secondary Tagging
                        </Tab>
                        <Tab
                            name="review"
                            className={styles.tab}
                            disabled={isNotDefined(projectId)}
                            activeClassName={styles.activeTab}
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
                    </TabPanel>
                    <TabPanel
                        className={styles.tabPanel}
                        name="primary-tagging"
                    >
                        <PrimaryTagging className={styles.primaryTagging} />
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
    );
}

export default TaggingFlow;
