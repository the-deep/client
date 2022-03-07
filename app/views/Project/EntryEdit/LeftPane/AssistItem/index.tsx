import React, { useState, useMemo, useCallback } from 'react';
import { FaBrain } from 'react-icons/fa';
import {
    listToMap,
    _cs,
    randomString,
} from '@togglecorp/fujs';
import {
    useForm,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    QuickActionButton,
    Container,
} from '@the-deep/deep-ui';
import { IoClose } from 'react-icons/io5';

import { useModalState } from '#hooks/stateManagement';
import { GeoArea } from '#components/GeoMultiSelectInput';

import {
    PartialEntryType as EntryInput,
    getEntrySchema,
} from '../../schema';
import { createDefaultAttributes } from '../../utils';
import { Framework } from '../../types';
import AssistPopup from '../AssistPopup';

import styles from './styles.css';

interface Props {
    className?: string;
    text: string;
    onAssistedEntryAdd: ((newEntry: EntryInput) => void) | undefined;
    frameworkDetails: Framework;
    leadId: string;
    onAssistCancel: () => void;
    disabled?: boolean;
}

function AssistItem(props: Props) {
    const {
        className,
        text,
        onAssistedEntryAdd,
        frameworkDetails,
        leadId,
        onAssistCancel,
        disabled,
    } = props;

    const allWidgets = useMemo(
        () => {
            const widgetsFromPrimary = frameworkDetails?.primaryTagging?.flatMap(
                (item) => (item.widgets ?? []),
            ) ?? [];
            const widgetsFromSecondary = frameworkDetails?.secondaryTagging ?? [];
            return [
                ...widgetsFromPrimary,
                ...widgetsFromSecondary,
            ];
        },
        [frameworkDetails?.primaryTagging, frameworkDetails?.secondaryTagging],
    );

    const schema = useMemo(
        () => {
            const widgetsMapping = listToMap(
                allWidgets,
                (item) => item.id,
                (item) => item,
            );
            return getEntrySchema(widgetsMapping);
        },
        [allWidgets],
    );

    const emptyEntry: EntryInput = useMemo(() => ({
        clientId: randomString(),
        entryType: 'EXCERPT' as const,
        lead: leadId,
        excerpt: text,
        droppedExcerpt: text,
        attributes: createDefaultAttributes(allWidgets),
    }), [
        leadId,
        allWidgets,
        text,
    ]);

    const [
        isAssistedTaggingModalShown,
        showAssistedTaggingModal,
        hideAssistedTaggingModal,
    ] = useModalState(true);

    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<GeoArea[] | undefined | null>(undefined);

    const {
        setValue,
        value,
        validate,
        setError,
        error,
    } = useForm(schema, emptyEntry);

    const handleEntryCreateButtonClick = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (entryData) => {
                if (onAssistedEntryAdd) {
                    onAssistedEntryAdd(entryData);
                }
            },
        );
        submit();
    }, [
        validate,
        setError,
        onAssistedEntryAdd,
    ]);

    return (
        <Container
            className={_cs(className, styles.assistItem)}
            footerActions={(
                <QuickActionButton
                    name={undefined}
                    title="Assist"
                    className={styles.button}
                    onClick={showAssistedTaggingModal}
                    disabled={disabled}
                    variant="tertiary"
                >
                    <FaBrain />
                </QuickActionButton>
            )}
            headerActions={(
                <QuickActionButton
                    name={undefined}
                    title="Cancel"
                    onClick={onAssistCancel}
                    disabled={disabled}
                    variant="action"
                >
                    <IoClose />
                </QuickActionButton>
            )}
            contentClassName={styles.content}
        >
            {text}
            {isAssistedTaggingModalShown && (
                <AssistPopup
                    onCloseButtonClick={hideAssistedTaggingModal}
                    frameworkDetails={frameworkDetails}
                    value={value}
                    onChange={setValue}
                    error={error}
                    leadId={leadId}
                    selectedText={text}
                    onEntryCreateButtonClick={handleEntryCreateButtonClick}
                    geoAreaOptions={geoAreaOptions}
                    onGeoAreaOptionsChange={setGeoAreaOptions}
                />
            )}
        </Container>
    );
}

export default AssistItem;
