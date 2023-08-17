import React, { useCallback } from 'react';
import { ExpandableContainer, ListView } from '@the-deep/deep-ui';

import SubDimmensionItem from './SubDimmensionItem';

import { DimmensionType } from '..';
import styles from './styles.css';

const keySelector = (d: NonNullable<
    DimmensionType['subDimmensionInformation']
>[number]) => d.subDimmension;

interface Props {
    data: DimmensionType;
}

function DimmensionItem(props: Props) {
    const { data } = props;

    const subDimensionParams = useCallback(
        (name: string) => ({
            name,
        }),
        [],
    );
    return (
        <div className={styles.dimmension}>
            <ExpandableContainer
                // className={styles.expandableContainer}
                // contentClassName={styles.expandableContent}
                heading={data.dimmensionDisplay}
                withoutBorder
                // headerActions={headerActions}
                expansionTriggerArea="arrow"
            >
                <ListView
                    data={data.subDimmensionInformation}
                    keySelector={keySelector}
                    renderer={SubDimmensionItem}
                    rendererParams={subDimensionParams}
                    errored={false}
                    filtered={false}
                    pending={false}
                    messageShown
                    messageIconShown
                />
            </ExpandableContainer>

        </div>
    );
}

export default DimmensionItem;
