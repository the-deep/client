import React, { useMemo } from 'react';
import {
    ElementFragments,
    DraggableContent,
} from '@the-deep/deep-ui';

import Avatar from '#newComponents/ui/Avatar';
import HighlightableTextOutput from '#newComponents/viewer/HighlightableTextOutput';
import { Organization } from '#types';

import styles from './styles.scss';

interface Props {
    searchValue?: string;
    value: Organization;
}

function Stakeholder(props: Props) {
    const {
        value,
        searchValue,
    } = props;

    const dragValue = useMemo(() => ({
        id: value.id,
        title: value.title,
        logoUrl: value.logoUrl,
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
                icons={(
                    <Avatar
                        className={styles.icon}
                        src={value.logoUrl}
                        alt={value.title}
                    />
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
