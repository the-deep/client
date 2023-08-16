import React, { useMemo } from 'react';
import { removeNull } from '@togglecorp/toggle-form';

import { AssessmentRegistrySummarySubPillarTypeEnum } from '#generated/types';
import { IssuesMapType } from '#views/EditAry/AssessmentRegistryForm/formSchema';

import IssueInput from './IssueInput';

import styles from './styles.css';

type IssueOptionsType = {
    id: string;
    label: string;
    subPillar?: AssessmentRegistrySummarySubPillarTypeEnum | null;
}

interface Props {
    name: string;
    disabled?: boolean;
    issueOptions?: IssueOptionsType[] | null;
    issueList?: IssuesMapType;
    onSuccessIssueAdd: (name: string, value: string) => void;
}

function SubPillarItem(props: Props) {
    const {
        name,
        issueList,
        onSuccessIssueAdd,
        disabled,
        issueOptions,
    } = props;

    const options = useMemo(
        () => {
            const removeNullOptions = removeNull(issueOptions);
            return removeNullOptions.filter((issue) => issue.subPillar === name);
        }, [issueOptions, name],
    );

    return (
        <div className={styles.subPillarItem}>
            { name }
            <IssueInput
                name={name}
                options={options}
                value={issueList}
                onSuccessIssueAdd={onSuccessIssueAdd}
                disabled={disabled}
            />
        </div>
    );
}

export default SubPillarItem;
