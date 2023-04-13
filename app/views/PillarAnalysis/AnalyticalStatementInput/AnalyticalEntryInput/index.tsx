import React, { memo, useMemo, useCallback, useContext } from 'react';
import { generatePath } from 'react-router-dom';
import {
    IoTrashOutline,
    IoPeopleCircleOutline,
    IoPencilOutline,
    IoRepeat,
} from 'react-icons/io5';
import {
    DropContainer,
    DraggableContent,
    QuickActionButton,
    DateOutput,
    useBooleanState,
    TextOutput,
    QuickActionLink,
} from '@the-deep/deep-ui';
import {
    Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';

import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';
import NonFieldError from '#components/NonFieldError';
import ExcerptInput from '#components/entry/ExcerptInput';
import EditableEntry from '#components/entry/EditableEntry';
import { GeoArea } from '#components/GeoMultiSelectInput';

import routes from '#base/configs/routes';

import EntryContext, { transformEntry } from '../../context';
import { AnalyticalEntryType, PartialAnalyticalEntryType } from '../../schema';
// import { AnalyticalFrameworkType } from '../..';
import { DroppedValue } from '../index';
import { Framework } from '../..';

import styles from './styles.css';

interface AnalyticalEntryInputProps {
    statementClientId: string | undefined;
    value: PartialAnalyticalEntryType;
    error: Error<AnalyticalEntryType> | undefined;
    // onChange: (value: PartialAnalyticalEntryType, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    onAnalyticalEntryDrop: (
        droppedValue: DroppedValue,
        dropOverEntryClientId: string | undefined,
    ) => void;
    dropDisabled?: boolean;
    framework: Framework;
    projectId: string;
    geoAreaOptions: GeoArea[] | undefined | null;
    setGeoAreaOptions: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    onEntryDataChange: () => void;
    // framework: Framework | undefined | null;
}

function AnalyticalEntryInput(props: AnalyticalEntryInputProps) {
    const {
        value,
        error: riskyError,
        // onChange,
        onRemove,
        index,
        statementClientId,
        onAnalyticalEntryDrop,
        dropDisabled,
        framework,
        projectId,
        geoAreaOptions,
        setGeoAreaOptions,
        onEntryDataChange,
    } = props;

    const error = getErrorObject(riskyError);

    const [
        entryDraggedStatus,
        setDragStart,
        setDragEnd,
    ] = useModalState(false);

    const [
        entryCardFlipped,
        , , ,
        toggleEntryCardFlipped,
    ] = useBooleanState(false);

    const handleAnalyticalEntryAdd = useCallback(
        (val: Record<string, unknown> | undefined) => {
            if (!val) {
                return;
            }
            const typedVal = val as { entryId: string, statementClientId: string };
            onAnalyticalEntryDrop(typedVal, value.clientId);
        },
        [value, onAnalyticalEntryDrop],
    );

    const dragValue = useMemo(() => ({
        entryId: value.entry,
        statementClientId,
    }), [value.entry, statementClientId]);

    const { entries } = useContext(EntryContext);
    const entry = value.entry ? entries[value.entry] : undefined;

    const authors = entry?.lead.authors
        ?.map((author) => (author.shortName)).join(', ');
    const entryDate = entry?.createdAt;

    const editEntryLink = useMemo(() => ({
        pathname: generatePath(routes.entryEdit.path, {
            projectId,
            leadId: entry?.lead.id,
        }),
        state: {
            entryId: entry?.clientId,
            activePage: 'primary',
        },
        hash: '#/primary-tagging',
    }), [
        projectId,
        entry?.lead.id,
        entry?.clientId,
    ]);

    // const onFieldChange = useFormObject(index, value, onChange);

    return (
        <DropContainer
            className={_cs(
                styles.dropContainer,
                entryDraggedStatus && styles.hide,
            )}
            name="entry"
            // NOTE: Disabled drop on the same entry which is being dragged
            onDrop={!entryDraggedStatus ? handleAnalyticalEntryAdd : undefined}
            dropOverlayContainerClassName={styles.overlay}
            draggedOverClassName={styles.draggedOver}
            contentClassName={styles.content}
            disabled={dropDisabled}
            // TODO: disable this when entries count is greater than certain count
        >
            <DraggableContent
                className={_cs(
                    styles.entry,
                    entryDraggedStatus && styles.isBeingDragged,
                    entryCardFlipped && styles.isFlipped,
                )}
                name="entry"
                dropEffect="move"
                value={dragValue}
                onDragStart={setDragStart}
                onDragStop={setDragEnd}
                contentClassName={styles.content}
                headerIcons={(
                    <>
                        <IoPeopleCircleOutline />
                        <span
                            title={authors}
                            className={styles.authors}
                        >
                            {authors}
                        </span>
                    </>
                )}
                heading={(
                    <DateOutput
                        format="yyyy/MM/dd"
                        value={entryDate}
                    />
                )}
                headingClassName={styles.heading}
                headingSectionClassName={styles.headingSection}
                headingContainerClassName={styles.headingContainer}
                headingSize="extraSmall"
                borderBelowHeader
                borderBelowHeaderWidth="thin"
                headerActionsContainerClassName={styles.headerActions}
                headerActions={(
                    <>
                        <QuickActionLink
                            title="Edit entry"
                            to={editEntryLink}
                            variant="transparent"
                        >
                            <IoPencilOutline />
                        </QuickActionLink>
                        <QuickActionButton
                            name={index}
                            onClick={onRemove}
                            title={_ts('pillarAnalysis', 'removeAnalyticalEntryButtonTitle')}
                            variant="transparent"
                        >
                            <IoTrashOutline />
                        </QuickActionButton>
                        <QuickActionButton
                            name={undefined}
                            onClick={toggleEntryCardFlipped}
                            title="flip"
                            variant="transparent"
                        >
                            <IoRepeat />
                        </QuickActionButton>
                    </>
                )}
            >
                <NonFieldError error={error} />
                <NonFieldError error={error?.entry} />
                {entry && !entryCardFlipped && (
                    <ExcerptInput
                        className={styles.excerpt}
                        value={entry.excerpt}
                        image={entry.image}
                        entryType={entry.entryType}
                        readOnly
                        imageRaw={undefined}
                        leadImageUrl={undefined}
                    />
                )}
                {entry && entryCardFlipped && (
                    <>
                        <div className={styles.extraDetails}>
                            <TextOutput
                                label="Created Date"
                                value={<DateOutput value={entry.createdAt} />}
                            />
                            <TextOutput
                                label="Added By"
                                value={entry.createdBy?.displayName}
                            />
                        </div>
                        <EditableEntry
                            className={styles.entryDetail}
                            entry={transformEntry(entry)}
                            entryId={entry.id}
                            leadId={entry.lead.id}
                            projectId={projectId}
                            primaryTagging={framework?.primaryTagging}
                            secondaryTagging={framework?.secondaryTagging}
                            entryImage={entry.image}
                            controlled={entry.controlled}
                            verifiedBy={entry.verifiedBy}
                            geoAreaOptions={geoAreaOptions}
                            onGeoAreaOptionsChange={setGeoAreaOptions}
                            onEntryDataChange={onEntryDataChange}
                            compact
                            noPaddingInWidgetContainer
                        />
                    </>
                )}
            </DraggableContent>
        </DropContainer>
    );
}

export default memo(AnalyticalEntryInput);
