import React from 'react';
import { Header, Modal, QuickActionButton, useModalState } from '@the-deep/deep-ui';
import { IoAddCircleOutline } from 'react-icons/io5';
import {
    EntriesAsList,
} from '@togglecorp/toggle-form';

import {
    SummaryIssueType,
    SubPillarIssueType,
    PartialFormType,
} from '#views/EditAry/AssessmentRegistryForm/formSchema';

import IssueInput from './IssueInput';
import AddIssueModal from '../../AddIssueModal';
import { PillarType } from '../..';

import styles from './styles.css';

export interface Props {
    data: NonNullable<PillarType['subPillarInformation']>[number];

    name: string;
    disabled?: boolean;
    value: SubPillarIssueType[] | undefined;
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;

    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    issueItemToClientIdMap: Record<string, string>;
    setIssueItemToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

function SubPillarItem(props: Props) {
    const {
        data,
        name,
        disabled,
        issuesOptions,
        setIssuesOptions,
        value,
        onChange,
        issueItemToClientIdMap,
        setIssueItemToClientIdMap,
    } = props;

    const [
        isModalShown,
        showModal,
        closeModal,
    ] = useModalState(false);

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
                subPillar={data.subPillar}
                value={value}
                onChange={onChange}
                issueOptions={issuesOptions}
                setIssueOptions={setIssuesOptions}
                disabled={disabled}
                issueItemToClientIdMap={issueItemToClientIdMap}
                setIssueItemToClientIdMap={setIssueItemToClientIdMap}
            />
            {isModalShown && (
                <Modal
                    heading="Issue Editor"
                    size="medium"
                    onCloseButtonClick={closeModal}
                >
                    <AddIssueModal
                        data={data}
                        onClose={closeModal}
                    />
                </Modal>
            )}
        </div>
    );
}

export default SubPillarItem;
