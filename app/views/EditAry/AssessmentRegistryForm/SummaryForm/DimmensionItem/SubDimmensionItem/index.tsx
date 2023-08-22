import React, { useMemo } from 'react';
import { removeNull } from '@togglecorp/toggle-form';
import { Header, QuickActionButton } from '@the-deep/deep-ui';
import { noOp } from '@togglecorp/fujs';
import { IoAddCircleOutline } from 'react-icons/io5';

import {
    AssessmentRegistrySummarySubDimmensionTypeEnum,
} from '#generated/types';

import IssueInput from '../../PillarItem/SubPillarItem/IssueInput';
import { DimmensionType } from '../..';

import styles from './styles.css';

type IssueOptionsType = {
    id: string;
    label: string;
    subDimmension?: AssessmentRegistrySummarySubDimmensionTypeEnum | null;
}

interface Props {
    data: NonNullable<DimmensionType['subDimmensionInformation']>[number];
    name: string;
    disabled?: boolean;
    issueOptions?: IssueOptionsType[] | null;
    refetchIssuesOptions: () => void;
}

function SubDimmensionItem(props: Props) {
    const {
        data,
        name,
        disabled,
        issueOptions,
        refetchIssuesOptions,
    } = props;

    const options = useMemo(
        () => {
            const removeNullOptions = removeNull(issueOptions);
            return removeNullOptions.filter((issue) => issue.subDimmension === name);
        }, [issueOptions, name],
    );

    return (
        <div className={styles.subDimmensionItem}>
            <Header
                heading={data.subDimmensionDisplay}
                headingSize="extraSmall"
                actions={(
                    <QuickActionButton
                        name={data.subDimmension}
                        // onClick={showModal}
                        title="add issue"
                    >
                        <IoAddCircleOutline />
                    </QuickActionButton>
                )}
            />
            <IssueInput
                name={name}
                options={options}
                value={undefined}
                onSuccessIssueAdd={noOp}
                disabled={disabled}
            />

        </div>
    );
}

export default SubDimmensionItem;
