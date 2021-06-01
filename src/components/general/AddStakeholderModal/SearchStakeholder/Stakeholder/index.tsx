import React, { useMemo } from 'react';
import Avatar from '#dui/Avatar';
import HighlightableTextOutput from '#components/viewer/HighlightableTextOutput';
import {
    ElementFragments,
    DraggableContent,
} from '@the-deep/deep-ui';

import { Organization } from '#typings';

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
    }), [value]);

    return (
        <DraggableContent
            name="stakeholder"
            value={dragValue}
            className={styles.item}
            headerClassName={styles.header}
            contentClassName={styles.content}
        >
            <ElementFragments
                icons={(
                    <Avatar
                        className={styles.icon}
                        src={value.logoUrl}
                    />
                )}
            >
                <div className={styles.text}>
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
                </div>
            </ElementFragments>
        </DraggableContent>
    );
}

export default Stakeholder;
