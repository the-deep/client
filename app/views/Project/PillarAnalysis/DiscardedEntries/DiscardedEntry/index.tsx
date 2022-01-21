import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { AiOutlineUndo } from 'react-icons/ai';

import {
    Container,
    PendingMessage,
    Tag,
    QuickActionConfirmButton,
    useAlert,
} from '@the-deep/deep-ui';

import { useLazyRequest } from '#base/utils/restRequest';
import ExcerptInput from '#components/entry/ExcerptInput';
import _ts from '#ts';

import { EntryMin } from '../../context';
import styles from './styles.css';

export interface Props {
    className?: string;
    discardedEntryId: number;
    pillarId: number;
    tagDisplay: string;
    onEntryUndiscard: () => void;

    excerpt: EntryMin['excerpt'];
    image?: EntryMin['image'];
    entryType: EntryMin['entryType'];
}

function DiscardedEntry(props: Props) {
    const {
        className,
        discardedEntryId,
        pillarId,
        onEntryUndiscard,
        tagDisplay,
        entryType,
        excerpt,
        image,
    } = props;

    const alert = useAlert();

    const {
        pending,
        trigger,
    } = useLazyRequest<unknown>({
        url: `server://analysis-pillar/${pillarId}/discarded-entries/${discardedEntryId}/`,
        method: 'DELETE',
        failureMessage: 'Failed to undiscarded entry.',
        onSuccess: () => {
            onEntryUndiscard();
            alert.show(
                'Successfully undiscarded the selected entry entry.',
                { variant: 'success' },
            );
        },
    });

    const handleUndiscardClick = useCallback(() => {
        trigger(null);
    }, [trigger]);

    return (
        <Container
            className={_cs(className, styles.entryItem)}
            contentClassName={_cs(
                styles.children,
                entryType === 'IMAGE' && styles.image,
            )}
            footerIcons={(
                <Tag>
                    {tagDisplay}
                </Tag>
            )}
            footerActions={(
                <QuickActionConfirmButton
                    name="undiscard"
                    title="Undiscard entry"
                    disabled={pending}
                    onConfirm={handleUndiscardClick}
                    message={_ts('pillarAnalysis', 'confirmUndiscardEntryMessage')}
                    showConfirmationInitially={false}
                >
                    <AiOutlineUndo />
                </QuickActionConfirmButton>
            )}
        >
            {pending && (<PendingMessage />)}
            <ExcerptInput
                entryType={entryType}
                image={image}
                value={excerpt}
                imageRaw={undefined}
                leadImageUrl={undefined}
                readOnly
            />
        </Container>
    );
}

export default DiscardedEntry;
