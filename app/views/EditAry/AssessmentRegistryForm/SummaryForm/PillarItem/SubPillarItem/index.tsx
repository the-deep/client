import React, { useCallback } from 'react';
import { Header, Modal, QuickActionButton, useModalState } from '@the-deep/deep-ui';
import { IoAddCircleOutline } from 'react-icons/io5';
import {
    EntriesAsList, Error,
} from '@togglecorp/toggle-form';

import {
    SummaryIssueType,
    SubPillarIssueType,
    PartialFormType,
} from '#views/EditAry/AssessmentRegistryForm/formSchema';

import SelectIssueInput from './SelectIssueInput';
import AddIssueModal from '../../AddIssueModal';
import { PillarType } from '../..';

import styles from './styles.css';

export interface Props {
    data: NonNullable<PillarType['subPillarInformation']>[number];

    name: string;
    disabled?: boolean;
    value: SubPillarIssueType[] | undefined;
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType['summarySubPillarIssue']>;

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
        error,
        issueItemToClientIdMap,
        setIssueItemToClientIdMap,
    } = props;

    const [
        isModalShown,
        showModal,
        closeModal,
    ] = useModalState(false);

    const getFieldValue = useCallback(
        (n: string) => {
            const clientId = issueItemToClientIdMap[n];
            if (!clientId) {
                return undefined;
            }
            const itemInValue = value?.find((item) => item.clientId === clientId);
            return itemInValue;
        }, [value, issueItemToClientIdMap],
    );

    const getMainIndex = useCallback(
        (n: string) => {
            const clientId = issueItemToClientIdMap[n];
            if (!clientId) {
                return undefined;
            }
            const mainIndex = value?.findIndex((item) => item.clientId === clientId);
            return mainIndex;
        }, [value, issueItemToClientIdMap],
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
            <div className={styles.issueInput}>
                <SelectIssueInput
                    name={`${name}-1`}
                    order={1}
                    placeholder="1. Field Name"
                    value={getFieldValue(`${name}-1`)}
                    mainIndex={getMainIndex(`${name}-1`)}
                    onChange={onChange}
                    issuesOptions={issuesOptions}
                    setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                    setIssuesOptions={setIssuesOptions}
                    subPillar={data.subPillar}
                    disabled={disabled}
                    error={error}
                />
                <SelectIssueInput
                    name={`${name}-2`}
                    order={2}
                    placeholder="2. Field Name"
                    value={getFieldValue(`${name}-2`)}
                    mainIndex={getMainIndex(`${name}-2`)}
                    onChange={onChange}
                    issuesOptions={issuesOptions}
                    setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                    setIssuesOptions={setIssuesOptions}
                    subPillar={data.subPillar}
                    disabled={disabled}
                    error={error}
                />
                <SelectIssueInput
                    name={`${name}-3`}
                    order={3}
                    placeholder="3. Field Name"
                    value={getFieldValue(`${name}-3`)}
                    mainIndex={getMainIndex(`${name}-3`)}
                    onChange={onChange}
                    issuesOptions={issuesOptions}
                    setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                    subPillar={data.subPillar}
                    setIssuesOptions={setIssuesOptions}
                    disabled={disabled}
                    error={error}
                />
                <SelectIssueInput
                    name={`${name}-4`}
                    order={4}
                    placeholder="4. Field Name"
                    value={getFieldValue(`${name}-4`)}
                    mainIndex={getMainIndex(`${name}-4`)}
                    onChange={onChange}
                    issuesOptions={issuesOptions}
                    setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                    subPillar={data.subPillar}
                    setIssuesOptions={setIssuesOptions}
                    disabled={disabled}
                    error={error}
                />
                <SelectIssueInput
                    name={`${name}-5`}
                    order={5}
                    placeholder="5. Field Name"
                    value={getFieldValue(`${name}-5`)}
                    mainIndex={getMainIndex(`${name}-5`)}
                    onChange={onChange}
                    issuesOptions={issuesOptions}
                    setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                    subPillar={data.subPillar}
                    setIssuesOptions={setIssuesOptions}
                    disabled={disabled}
                    error={error}
                />
                <SelectIssueInput
                    name={`${name}-6`}
                    order={6}
                    placeholder="6. Field Name"
                    value={getFieldValue(`${name}-6`)}
                    mainIndex={getMainIndex(`${name}-6`)}
                    onChange={onChange}
                    issuesOptions={issuesOptions}
                    setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                    subPillar={data.subPillar}
                    setIssuesOptions={setIssuesOptions}
                    disabled={disabled}
                    error={error}
                />
                <SelectIssueInput
                    name={`${name}-7`}
                    order={7}
                    placeholder="7. Field Name"
                    value={getFieldValue(`${name}-7`)}
                    mainIndex={getMainIndex(`${name}-7`)}
                    onChange={onChange}
                    issuesOptions={issuesOptions}
                    setIssueItemToClientIdMap={setIssueItemToClientIdMap}
                    subPillar={data.subPillar}
                    setIssuesOptions={setIssuesOptions}
                    error={error}
                />
            </div>
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
