import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    // Error,
    // SetValueArg,
    EntriesAsList,
    useFormArray,
} from '@togglecorp/toggle-form';
import {
    ListView,
    Container,
} from '@the-deep/deep-ui';

import EntryInput from '#components/entry/EntryInput';
import FrameworkImageButton from '#components/framework/FrameworkImageButton';
import { Section, Widget } from '../types';
import { PartialFormType, PartialEntryType } from '../schema';

import styles from './styles.css';

const entryKeySelector = (e: PartialEntryType) => e.clientId;

interface Props {
    className?: string;
    frameworkId: string | undefined;
    secondaryTagging: Widget[] | null | undefined;
    primaryTagging: Section[] | null | undefined;

    value: PartialFormType,
    // error: Error<PartialFormType>,
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;
}

function Review(props: Props) {
    const {
        className,
        frameworkId,
        secondaryTagging,
        primaryTagging,

        value,
        // error,
        onChange,
    } = props;

    const {
        setValue: onEntryChange,
    } = useFormArray<'entries', PartialEntryType>('entries', onChange);

    const entryDataRendererParams = useCallback(
        (_: string, data: PartialEntryType, index: number) => ({
            value: data,
            name: index,
            index,
            onChange: onEntryChange,
            secondaryTagging,
            primaryTagging,
            // error,
        }),
        [secondaryTagging, primaryTagging, onEntryChange],
    );

    return (
        <Container
            className={_cs(className, styles.review)}
            headerActions={(
                <FrameworkImageButton
                    frameworkId={frameworkId}
                    label="View framework image for reference"
                    variant="secondary"
                />
            )}
        >
            <ListView
                className={styles.entries}
                keySelector={entryKeySelector}
                renderer={EntryInput}
                data={value.entries}
                rendererParams={entryDataRendererParams}
            />
        </Container>
    );
}

export default Review;
