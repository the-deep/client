import React, { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import {
    IoTrashOutline,
    IoPeopleCircleOutline,
    IoPencilOutline,
    IoRepeat,
} from 'react-icons/io5';
import {
    Container,
    DateOutput,
    TextOutput,
    QuickActionButton,
    QuickActionLink,
    useBooleanState,
} from '@the-deep/deep-ui';

import { Entry, Framework } from '#views/PillarAnalysis';
import { organizationTitleSelector } from '#components/selections/NewOrganizationSelectInput';
import ExcerptInput from '#components/entry/ExcerptInput';
import { GeoArea } from '#components/GeoMultiSelectInput';
import EditableEntry from '#components/entry/EditableEntry';
import routes from '#base/configs/routes';
import { transformEntry } from '../../../context';
import _ts from '#ts';

import styles from './styles.css';

interface Props {
    className?: string;
    projectId: string;
    entry: Entry;
    onRemove: (index: number) => void;
    index: number;
    framework: Framework;
    geoAreaOptions: GeoArea[] | undefined | null;
    setGeoAreaOptions: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    onEntryDataChange: () => void;
}

function EntryCard(props: Props) {
    const {
        projectId,
        className,
        entry,
        onRemove,
        index,
        framework,
        geoAreaOptions,
        setGeoAreaOptions,
        onEntryDataChange,
    } = props;

    const entryDate = entry?.createdAt;
    const [
        entryCardFlipped,
        , , ,
        toggleEntryCardFlipped,
    ] = useBooleanState(false);

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
    const authors = useMemo(() => (
        entry.lead.authors
            ?.map((author) => organizationTitleSelector(author)).join(', ')
    ), [entry.lead.authors]);

    return (
        <Container
            className={_cs(
                className,
                styles.entryCard,
                entryCardFlipped && styles.isFlipped,
            )}
            headerClassName={styles.header}
            spacing="compact"
            headingSize="extraSmall"
            headingClassName={styles.heading}
            headingSectionClassName={styles.headingSection}
            headingContainerClassName={styles.headingContainer}
            borderBelowHeader
            borderBelowHeaderWidth="thin"
            headerIcons={(
                <>
                    <IoPeopleCircleOutline />
                    {authors}
                </>
            )}
            heading={(
                <DateOutput
                    format="yyyy/MM/dd"
                    value={entryDate}
                />
            )}
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
            contentClassName={styles.content}
        >
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
        </Container>
    );
}

export default EntryCard;
