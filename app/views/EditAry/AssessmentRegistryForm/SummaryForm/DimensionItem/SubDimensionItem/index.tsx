import React from 'react';
import { Header, QuickActionButton } from '@the-deep/deep-ui';
import { IoAddCircleOutline } from 'react-icons/io5';

import { SummaryIssueType } from '#views/EditAry/AssessmentRegistryForm/formSchema';

import { DimensionType } from '../..';

import styles from './styles.css';

interface Props {
    data: NonNullable<DimensionType['subDimensionInformation']>[number];
    name: string;
    disabled?: boolean;
    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
}

function SubDimensionItem(props: Props) {
    const {
        data,
        name,
        disabled,
        issuesOptions,
        setIssuesOptions,
    } = props;

    return (
        <div className={styles.subDimensionItem}>
            <Header
                heading={data.subDimensionDisplay}
                headingSize="extraSmall"
                actions={(
                    <QuickActionButton
                        name={data.subDimension}
                        // onClick={showModal}
                        title="add issue"
                    >
                        <IoAddCircleOutline />
                    </QuickActionButton>
                )}
            />
        </div>
    );
}

export default SubDimensionItem;
