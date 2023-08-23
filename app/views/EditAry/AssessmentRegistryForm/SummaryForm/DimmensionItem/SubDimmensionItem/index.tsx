import React from 'react';
import { Header, QuickActionButton } from '@the-deep/deep-ui';
import { noOp } from '@togglecorp/fujs';
import { IoAddCircleOutline } from 'react-icons/io5';

import IssueInput from '../../PillarItem/SubPillarItem/IssueInput';
import { DimmensionType } from '../..';

import styles from './styles.css';
import { SummaryIssueType } from '#views/EditAry/AssessmentRegistryForm/formSchema';

interface Props {
    data: NonNullable<DimmensionType['subDimmensionInformation']>[number];
    name: string;
    disabled?: boolean;
    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
}

function SubDimmensionItem(props: Props) {
    const {
        data,
        name,
        disabled,
        issuesOptions,
        setIssuesOptions,
    } = props;

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
                options={issuesOptions}
                setOptions={setIssuesOptions}
                value={undefined}
                onSuccessIssueAdd={noOp}
                disabled={disabled}
            />

        </div>
    );
}

export default SubDimmensionItem;
