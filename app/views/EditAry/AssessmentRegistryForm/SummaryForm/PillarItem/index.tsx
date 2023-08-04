import React, { useCallback } from 'react';
import { PartialForm } from '@togglecorp/toggle-form';
import { noOp } from '@togglecorp/fujs';
import { ExpandableContainer, List, NumberInput } from '@the-deep/deep-ui';

import {
    AssessmentRegistrySummarySubSectorTypeEnum,
    SummaryOptionType,
} from '#generated/types';

import SubPillarItem from './SubPillarItem';
import { SubSectorIssueInputType } from '../../formSchema';

import styles from './styles.css';

interface Props {
    data: SummaryOptionType;
    value: SubSectorIssueInputType[];
    onValueChange: (id: string, name: string) => void;
    disabled?: boolean;
}

const keySelector = (d: PartialForm<SummaryOptionType['subSector']>[number]) => d;

function PillarItem(props: Props) {
    const {
        data,
        value,
        onValueChange,
        disabled,
    } = props;

    const issuesParams = useCallback(
        (name: AssessmentRegistrySummarySubSectorTypeEnum) => ({
            subPillarName: name,
            value,
            onValueChange,
            disabled,
        }),
        [value, onValueChange, disabled],
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
                        disabled={disabled}
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
