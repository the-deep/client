import React, { useCallback, useMemo } from 'react';
import { EntriesAsList, Error } from '@togglecorp/toggle-form';
import {
    listToMap,
    isDefined,
    noOp,
} from '@togglecorp/fujs';
import {
    IoEllipseSharp,
    IoAddCircleOutline,
} from 'react-icons/io5';
import { Header, Modal, QuickActionButton, useModalState } from '@the-deep/deep-ui';

import { AssessmentRegistrySectorTypeEnum } from '#generated/types';
import {
    PartialFormType,
    SubDimensionIssueType,
    SummaryIssueType,
} from '#views/EditAry/AssessmentRegistryForm/formSchema';

import SelectIssueInput from './SelectIssueInput';
import { DimensionType } from '../..';
import AddIssueModal from '../../AddIssueModal';

import styles from './styles.css';

const colorMap: Record<number, string> = {
    1: '#ff7d7d',
    2: '#ffc2c2',
    3: '#fbfbbd',
    4: '#a5d9c1',
    5: '#78c7a2',
    6: '#78c7a2',
    7: '#78c7a2',
};

export interface Props {
    data: NonNullable<DimensionType['subDimensionInformation']>[number];
    value?: SubDimensionIssueType[];
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;
    name: string;
    disabled?: boolean;
    dimensionIssueToClientIdMap: Record<string, string>;
    setDimensionIssueToClientIdMap: React.Dispatch<React.SetStateAction<
    Record<string, string>>>;

    dimensionIssuesOptions?: SummaryIssueType[] | null;
    setDimensionIssuesOptions: React.Dispatch<React.SetStateAction<
    SummaryIssueType[]
    | undefined
    | null
    >>;
    error: Error<PartialFormType['summarySubDimensionIssue']>;
    sector: AssessmentRegistrySectorTypeEnum;
}

function SubDimensionItem(props: Props) {
    const {
        data,
        name,
        value,
        onChange,
        dimensionIssuesOptions,
        setDimensionIssuesOptions,
        dimensionIssueToClientIdMap,
        setDimensionIssueToClientIdMap,
        sector,
        disabled,
        error,
    } = props;

    const [
        isModalShown,
        showModal,
        closeModal,
    ] = useModalState(false);

    const filledValues = useMemo(() => {
        const valueMap = listToMap(value, (item) => item.clientId, () => true);
        return Object.keys(dimensionIssueToClientIdMap)
            ?.filter((item) => item.startsWith(`${sector}-${name}`))
            ?.map(
                (item) => (
                    valueMap?.[dimensionIssueToClientIdMap[item]]
                        ? dimensionIssueToClientIdMap[item] : undefined
                ),
            ).filter(isDefined);
    }, [
        sector,
        value,
        dimensionIssueToClientIdMap,
        name,
    ]);

    const getFieldValue = useCallback(
        (n: string) => {
            const clientId = dimensionIssueToClientIdMap[n];
            if (!clientId) {
                return undefined;
            }
            const itemInValue = value?.find((item) => item.clientId === clientId);
            return itemInValue;
        }, [value, dimensionIssueToClientIdMap],
    );

    const getMainIndex = useCallback(
        (n: string) => {
            const clientId = dimensionIssueToClientIdMap[n];
            if (!clientId) {
                return undefined;
            }
            const mainIndex = value?.findIndex((item) => item.clientId === clientId);
            return mainIndex;
        }, [value, dimensionIssueToClientIdMap],
    );

    return (
        <div className={styles.subDimensionItem}>
            <Header
                heading={data.subDimensionDisplay}
                headingSize="extraSmall"
                icons={(
                    <IoEllipseSharp
                        className={styles.indicator}
                        style={{
                            color: colorMap[filledValues.length] ?? '#ff7d7d',
                        }}
                    />
                )}
                actions={(
                    <QuickActionButton
                        name={data.subDimension}
                        onClick={showModal}
                        title="add issue"
                    >
                        <IoAddCircleOutline />
                    </QuickActionButton>
                )}
            />
            <div className={styles.issueInput}>
                <SelectIssueInput
                    name={`${sector}-${name}-1`}
                    order={1}
                    placeholder="1. Field Name"
                    value={getFieldValue(`${sector}-${name}-1`)}
                    mainIndex={getMainIndex(`${sector}-${name}-1`)}
                    onChange={onChange}
                    dimensionIssuesOptions={dimensionIssuesOptions}
                    setDimensionIssueToClientIdMap={setDimensionIssueToClientIdMap}
                    setDimensionIssuesOptions={setDimensionIssuesOptions}
                    subDimension={data.subDimension}
                    sector={sector}
                    disabled={disabled}
                    error={error}
                />
                <SelectIssueInput
                    name={`${sector}-${name}-2`}
                    order={2}
                    placeholder="2. Field Name"
                    value={getFieldValue(`${sector}-${name}-2`)}
                    mainIndex={getMainIndex(`${sector}-${name}-2`)}
                    onChange={onChange}
                    dimensionIssuesOptions={dimensionIssuesOptions}
                    setDimensionIssueToClientIdMap={setDimensionIssueToClientIdMap}
                    setDimensionIssuesOptions={setDimensionIssuesOptions}
                    subDimension={data.subDimension}
                    sector={sector}
                    disabled={disabled}
                    error={error}
                />
                <SelectIssueInput
                    name={`${sector}-${name}-3`}
                    order={3}
                    placeholder="3. Field Name"
                    value={getFieldValue(`${sector}-${name}-3`)}
                    mainIndex={getMainIndex(`${sector}-${name}-3`)}
                    onChange={onChange}
                    dimensionIssuesOptions={dimensionIssuesOptions}
                    setDimensionIssueToClientIdMap={setDimensionIssueToClientIdMap}
                    setDimensionIssuesOptions={setDimensionIssuesOptions}
                    subDimension={data.subDimension}
                    sector={sector}
                    disabled={disabled}
                    error={error}
                />
                <SelectIssueInput
                    name={`${sector}-${name}-4`}
                    order={4}
                    placeholder="4. Field Name"
                    value={getFieldValue(`${sector}-${name}-4`)}
                    mainIndex={getMainIndex(`${sector}-${name}-4`)}
                    onChange={onChange}
                    dimensionIssuesOptions={dimensionIssuesOptions}
                    setDimensionIssueToClientIdMap={setDimensionIssueToClientIdMap}
                    setDimensionIssuesOptions={setDimensionIssuesOptions}
                    subDimension={data.subDimension}
                    sector={sector}
                    disabled={disabled}
                    error={error}
                />
                <SelectIssueInput
                    name={`${sector}-${name}-5`}
                    order={5}
                    placeholder="5. Field Name"
                    value={getFieldValue(`${sector}-${name}-5`)}
                    mainIndex={getMainIndex(`${sector}-${name}-5`)}
                    onChange={onChange}
                    dimensionIssuesOptions={dimensionIssuesOptions}
                    setDimensionIssueToClientIdMap={setDimensionIssueToClientIdMap}
                    setDimensionIssuesOptions={setDimensionIssuesOptions}
                    subDimension={data.subDimension}
                    sector={sector}
                    disabled={disabled}
                    error={error}
                />
                <SelectIssueInput
                    name={`${sector}-${name}-6`}
                    order={6}
                    placeholder="6. Field Name"
                    value={getFieldValue(`${sector}-${name}-6`)}
                    mainIndex={getMainIndex(`${sector}-${name}-6`)}
                    onChange={onChange}
                    dimensionIssuesOptions={dimensionIssuesOptions}
                    setDimensionIssueToClientIdMap={setDimensionIssueToClientIdMap}
                    setDimensionIssuesOptions={setDimensionIssuesOptions}
                    subDimension={data.subDimension}
                    sector={sector}
                    disabled={disabled}
                    error={error}
                />
                <SelectIssueInput
                    name={`${sector}-${name}-7`}
                    order={7}
                    placeholder="7. Field Name"
                    value={getFieldValue(`${sector}-${name}-7`)}
                    mainIndex={getMainIndex(`${sector}-${name}-7`)}
                    onChange={onChange}
                    dimensionIssuesOptions={dimensionIssuesOptions}
                    setDimensionIssueToClientIdMap={setDimensionIssueToClientIdMap}
                    setDimensionIssuesOptions={setDimensionIssuesOptions}
                    subDimension={data.subDimension}
                    sector={sector}
                    disabled={disabled}
                    error={error}
                />
            </div>
            {isModalShown && (
                <Modal
                    heading={`Issue Editor: ${data.subDimensionDisplay}`}
                    size="medium"
                    onCloseButtonClick={closeModal}
                    freeHeight
                >
                    <AddIssueModal
                        type="dimension"
                        subDimension={data.subDimension}
                        onClose={closeModal}
                        refetch={noOp}
                    />
                </Modal>
            )}
        </div>
    );
}

export default SubDimensionItem;
