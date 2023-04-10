import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ContainerCard,
    DateOutput,
    ImagePreview,
} from '@the-deep/deep-ui';
import { IoPersonOutline } from 'react-icons/io5';

import { EntryMin } from '#views/PillarAnalysis/context';
import { organizationTitleSelector } from '#components/selections/NewOrganizationSelectInput';

import styles from './styles.css';

interface Props {
    className?: string;
    entry: EntryMin;
}

function EntryCard(props: Props) {
    const {
        className,
        entry,
    } = props;

    const authors = useMemo(() => (
        entry.lead.authors
            ?.map((author) => organizationTitleSelector(author)).join(', ')
    ), [entry.lead.authors]);

    return (
        <ContainerCard
            className={_cs(className, styles.entryCard)}
            headerClassName={styles.header}
            headingSize="extraSmall"
            headerActions={(
                <DateOutput
                    tooltip="Entry Created At"
                    value={entry.createdAt}
                />
            )}
            headerIcons={(
                <IoPersonOutline title="authors" />
            )}
            heading={authors}
            contentClassName={styles.content}
        >
            {entry.image?.file?.url && (
                <ImagePreview
                    alt={entry.image?.title}
                    src={entry.image?.file?.url}
                />
            )}
            {entry.excerpt}
        </ContainerCard>
    );
}

export default EntryCard;
