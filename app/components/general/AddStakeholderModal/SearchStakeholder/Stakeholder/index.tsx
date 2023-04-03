import React, { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    ElementFragments,
    DraggableContent,
    Tag,
} from '@the-deep/deep-ui';

import Avatar from '#components/Avatar';
import HighlightableTextOutput from '#components/HighlightableTextOutput';
import { OrganizationsListQuery } from '#generated/types';

import styles from './styles.css';

export type OrganizationItemType = NonNullable<NonNullable<OrganizationsListQuery['organizations']>['results']>[number];

interface Props {
    searchValue?: string;
    value: OrganizationItemType;
}

function Stakeholder(props: Props) {
    const {
        value,
        searchValue,
    } = props;

    const dragValue = useMemo(() => ({
        id: value.id,
        title: value.title,
        logoUrl: value.logo?.file?.url,
    }), [value]);

    return (
        <DraggableContent
            name="stakeholder"
            value={dragValue}
            className={styles.stakeholder}
            headerClassName={styles.header}
            contentClassName={styles.content}
        >
            <ElementFragments
                icons={isDefined(value.logo?.file?.url) && (
                    <Avatar
                        className={styles.icon}
                        src={value.logo?.file?.url}
                        alt={value.title}
                    />
                )}
                actions={value.verified && (
                    <Tag
                        spacing="compact"
                        variant="gradient1"
                    >
                        Verified
                    </Tag>
                )}
                childrenContainerClassName={styles.text}
            >
                <HighlightableTextOutput
                    className={styles.name}
                    text={value.title}
                    highlightText={searchValue}
                />
                <HighlightableTextOutput
                    className={styles.abbr}
                    text={value.shortName}
                    highlightText={searchValue}
                />
            </ElementFragments>
        </DraggableContent>
    );
}

export default Stakeholder;
