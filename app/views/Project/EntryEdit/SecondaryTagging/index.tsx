import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Container } from '@the-deep/deep-ui';

import { Widget } from '#types/newAnalyticalFramework';
import { Lead } from '#components/LeadEditForm/schema';
import FrameworkImageButton from '#components/FrameworkImageButton';
import FrameworkOutput from '#components/framework/FrameworkOutput';

import _ts from '#ts';
import LeftPane, { Entry } from '../LeftPane';

import styles from './styles.css';

interface Props {
    className?: string;
    lead?: Lead;
    widgets?: Widget[];
    frameworkId: string;

    entries: Entry[];

    activeEntry: string | undefined;
    onActiveEntryChange: React.Dispatch<React.SetStateAction<string | undefined>>;
}

function SecondaryTagging(props: Props) {
    const {
        className,
        lead,
        widgets,
        entries,
        activeEntry,
        onActiveEntryChange,
        frameworkId,
    } = props;

    return (
        <div className={_cs(className, styles.secondaryTagging)}>
            <LeftPane
                className={styles.sourcePreview}
                entries={entries}
                activeEntry={activeEntry}
                onEntryClick={onActiveEntryChange}
                lead={lead}
                hideSimplifiedPreview
                hideOriginalPreview
            />
            <Container
                className={styles.rightContainer}
                contentClassName={styles.frameworkOutput}
                headerActions={frameworkId && (
                    <FrameworkImageButton
                        frameworkId={frameworkId}
                        label={_ts('analyticalFramework.primaryTagging', 'viewFrameworkImageButtonLabel')}
                        variant="secondary"
                    />
                )}
            >
                <FrameworkOutput
                    name={undefined}
                    widgets={widgets}
                    isSecondary
                />
            </Container>
        </div>
    );
}

export default SecondaryTagging;
