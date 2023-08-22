import React, { useMemo } from 'react';
import { removeNull } from '@togglecorp/toggle-form';
import { Header, Modal, QuickActionButton, useModalState } from '@the-deep/deep-ui';
import { IoAddCircleOutline } from 'react-icons/io5';

import { AssessmentRegistrySummarySubPillarTypeEnum } from '#generated/types';
import { SubPillarIssuesMapType } from '#views/EditAry/AssessmentRegistryForm/formSchema';

import IssueInput from './IssueInput';
import AddIssueModal from '../../AddIssueModal';
import { PillarType } from '../..';

import styles from './styles.css';

type IssueOptionsType = {
    id: string;
    label: string;
    subPillar?: AssessmentRegistrySummarySubPillarTypeEnum | null;
}

interface Props {
    data: NonNullable<PillarType['subPillarInformation']>[number];
    name: string;
    disabled?: boolean;
    issueOptions?: IssueOptionsType[] | null;
    pillarIssuesList?: SubPillarIssuesMapType;
    onSuccessIssueAdd: (name: string, value: string) => void;
    refetchIssuesOptions: () => void;
}

function SubPillarItem(props: Props) {
    const {
        data,
        name,
        pillarIssuesList,
        onSuccessIssueAdd,
        disabled,
        issueOptions,
        refetchIssuesOptions,
    } = props;

    const [
        isModalShown,
        showModal,
        closeModal,
    ] = useModalState(false);
    const options = useMemo(
        () => {
            const removeNullOptions = removeNull(issueOptions);
            return removeNullOptions.filter((issue) => issue.subPillar === name);
        }, [issueOptions, name],
    );

    return (
        <div className={styles.subPillarItem}>
            <Header
                heading={data.subPillarDisplay}
                headingSize="extraSmall"
                actions={(
                    <QuickActionButton
                        name={data.subPillar}
                        onClick={showModal}
                        title="add issue"
                    >
                        <IoAddCircleOutline />
                    </QuickActionButton>
                )}
            />
            <IssueInput
                name={name}
                options={options}
                value={pillarIssuesList}
                onSuccessIssueAdd={onSuccessIssueAdd}
                disabled={disabled}
            />

            {isModalShown && (
                <Modal
                    heading="Issue Editor"
                    size="medium"
                    onCloseButtonClick={closeModal}
                >
                    <AddIssueModal
                        data={data}
                        refetchIssuesOptions={refetchIssuesOptions}
                    />
                </Modal>
            )}
        </div>
    );
}

export default SubPillarItem;
