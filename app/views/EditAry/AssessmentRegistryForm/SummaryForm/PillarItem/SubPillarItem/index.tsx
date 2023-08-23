import React from 'react';
import { Header, Modal, QuickActionButton, useModalState } from '@the-deep/deep-ui';
import { IoAddCircleOutline } from 'react-icons/io5';

import { SubPillarIssuesMapType, SummaryIssueType } from '#views/EditAry/AssessmentRegistryForm/formSchema';

import IssueInput from './IssueInput';
import AddIssueModal from '../../AddIssueModal';
import { PillarType } from '../..';

import styles from './styles.css';

interface Props {
    data: NonNullable<PillarType['subPillarInformation']>[number];
    name: string;
    disabled?: boolean;
    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    pillarIssuesList?: SubPillarIssuesMapType;
    onSuccessIssueAdd: (name: string, value: string) => void;
}

function SubPillarItem(props: Props) {
    const {
        data,
        name,
        pillarIssuesList,
        onSuccessIssueAdd,
        disabled,
        issuesOptions,
        setIssuesOptions,
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
                value={pillarIssuesList}
                options={issuesOptions}
                setOptions={setIssuesOptions}
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
                        onClose={closeModal}
                    />
                </Modal>
            )}
        </div>
    );
}

export default SubPillarItem;
