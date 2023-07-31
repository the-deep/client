import React, { useCallback, useState } from 'react';
import { ExpandableContainer, List, NumberInput } from '@the-deep/deep-ui';
import { PartialForm } from '@togglecorp/toggle-form';

import {
    AssessmentRegistrySummarySubSectorTypeEnum,
    SummaryOptionType,
    SummarySubSectorIssueInputType,
} from '#generated/types';

import SubPillarItem from './SubPillarItem';
import styles from './styles.css';

interface Props {
    data: SummaryOptionType;
    value: SummarySubSectorIssueInputType;
    onValueChange: React.Dispatch<React.SetStateAction<SummarySubSectorIssueInputType>>;
    onAdd: (summaryId: string, text: string) => void;
}

const keySelector = (d: PartialForm<SummaryOptionType['subSector']>[number]) => d;

function PillarItem(props: Props) {
    const {
        data,
        value,
        onValueChange,
        onAdd,
    } = props;

    const issuesParams = useCallback(
        (name: AssessmentRegistrySummarySubSectorTypeEnum) => ({
            data: name,
            value,
            onValueChange,
            onAdd,
        }),
        [],
    );

    return (
        <div className={styles.pillar}>
            <ExpandableContainer
                className={styles.expandableContainer}
                contentClassName={styles.expandableContent}
                heading={data.sector}
                withoutBorder
            >
                <List
                    data={data.subSector}
                    keySelector={keySelector}
                    renderer={SubPillarItem}
                    rendererParams={issuesParams}
                />
            </ExpandableContainer>

            {/*
            TODO: Styling fix
            <NumberInput
                className={styles.inputMetadata}
                inputSectionClassName={styles.inputSection}
                name="totalDeath"
                placeholder="Total people assessed"
                value={undefined}
                onChange={noOp}
            /> */}
        </div>
    );
}

export default PillarItem;
