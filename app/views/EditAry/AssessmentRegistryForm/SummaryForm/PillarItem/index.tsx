import React, { useCallback, useMemo } from 'react';
import { ExpandableContainer, List, NumberInput } from '@the-deep/deep-ui';
import { PartialForm } from '@togglecorp/toggle-form';
import { listToGroupList, noOp } from '@togglecorp/fujs';

import {
    AssessmentRegistrySummarySubSectorTypeEnum,
    SummaryOptionType,
} from '#generated/types';

import SubPillarItem from './SubPillarItem';
import { IssuesInputType } from '..';
import styles from './styles.css';

interface Props {
    data: SummaryOptionType;
    value: IssuesInputType[];
    onValueChange: (id: string, name: string) => void;
}

const keySelector = (d: PartialForm<SummaryOptionType['subSector']>[number]) => d;

function PillarItem(props: Props) {
    const {
        data,
        value,
        onValueChange,
    } = props;

    const issuesParams = useCallback(
        (name: AssessmentRegistrySummarySubSectorTypeEnum) => ({
            subPillarName: name,
            value,
            onValueChange,
        }),
        [value, onValueChange],
    );

    return (
        <div className={styles.pillar}>
            <ExpandableContainer
                className={styles.expandableContainer}
                contentClassName={styles.expandableContent}
                heading={data.sector}
                withoutBorder
                headerActions={(
                    <NumberInput
                        className={styles.inputMetadata}
                        inputSectionClassName={styles.inputSection}
                        name="totalDeath"
                        placeholder="Total people assessed"
                        value={undefined}
                        onChange={noOp}
                    />
                )}
            >
                <List
                    data={data.subSector}
                    keySelector={keySelector}
                    renderer={SubPillarItem}
                    rendererParams={issuesParams}
                />
            </ExpandableContainer>

        </div>
    );
}

export default PillarItem;
