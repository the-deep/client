import React, { useCallback } from 'react';
import { ExpandableContainer, ListView } from '@the-deep/deep-ui';
import { Error } from '@togglecorp/toggle-form';

import { AssessmentRegistrySummarySubDimmensionTypeEnum } from '#generated/types';

import SubDimmensionItem from './SubDimmensionItem';
import { PartialFormType } from '../../formSchema';
import { DimmensionType } from '..';

import styles from './styles.css';

type IssueOptionsType = {
    id: string;
    label: string;
    subDimmension?: AssessmentRegistrySummarySubDimmensionTypeEnum | null;
}

interface Props {
    data: DimmensionType;
    issueOptions?: IssueOptionsType[] | null;
    disabled?: boolean;
    error: Error<PartialFormType>;
    refetchIssuesOptions: () => void;
}

const keySelector = (d: NonNullable<
    DimmensionType['subDimmensionInformation']
>[number]) => d.subDimmension;

function DimmensionItem(props: Props) {
    const {
        data,
        issueOptions,
        disabled,
        error,
        refetchIssuesOptions,
    } = props;

    const subDimensionParams = useCallback(
        (name: string, subDimmensionData) => ({
            data: subDimmensionData,
            name,
            issueOptions,
            disabled,
            refetchIssuesOptions,
        }),
        [
            issueOptions,
            disabled,
            refetchIssuesOptions,
        ],
    );

    return (
        <div className={styles.dimension}>
            <ExpandableContainer
                className={styles.expandableContainer}
                heading={data.dimmensionDisplay}
                headingSize="extraSmall"
                withoutBorder
                // headerActions={headerActions}
                expansionTriggerArea="arrow"
            >
                <ListView
                    className={styles.subDimensionItem}
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
