import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Tabs,
    TabPanel,
    TabList,
    Tab,
} from '@the-deep/deep-ui';

import LeadPreview, { Attachment } from '#components/lead/LeadPreview';
import SimplifiedTextView from '#views/EntryEdit/LeftPane/SimplifiedTextView';

import styles from './styles.css';

type TabOptions = 'simplified' | 'original';

interface Props {
    className?: string;
    attachment: Attachment | null | undefined;
    leadId: string;
    projectId: string;
    textExtract: string | undefined;
    url: string;
}

function LeadView(props: Props) {
    const {
        className,
        attachment,
        leadId,
        projectId,
        textExtract,
        url,
    } = props;
    const [activeTab, setActiveTab] = useState<TabOptions | undefined>('simplified');

    return (
        <div className={_cs(className, styles.leadView)}>
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
                variant="secondary"
            >
                <TabList className={styles.tabList}>
                    <Tab
                        name="simplified"
                    >
                        Simplified Text
                    </Tab>
                    <Tab
                        name="original"
                    >
                        Original
                    </Tab>
                </TabList>
                <TabPanel
                    className={styles.content}
                    name="simplified"
                    retainMount="lazy"
                >
                    <SimplifiedTextView
                        projectId={projectId}
                        text={textExtract}
                        assistedTaggingEnabled={false}
                        leadId={leadId}
                    />
                </TabPanel>
                <TabPanel
                    className={styles.content}
                    name="original"
                    retainMount="lazy"
                >
                    <LeadPreview
                        className={styles.leadPreview}
                        url={url}
                        attachment={attachment}
                    />
                </TabPanel>
            </Tabs>
        </div>
    );
}

export default LeadView;
