import React, { useMemo, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import {
    DateInput,
    MultiSelectInput,
    NumberInput,
    SelectInput,
} from '@the-deep/deep-ui';
import {
    EntriesAsList,
    Error,
    getErrorObject,
    getErrorString,
    SetBaseValueArg,
} from '@togglecorp/toggle-form';

import { enumKeySelector, enumLabelSelector } from '#utils/common';
import {
    GetOptionsQuery,
    GetOptionsQueryVariables,
} from '#generated/types';
import RegionMultiSelectInput, {
    BasicRegion,
} from '#components/selections/RegionMultiSelectInput';

import { PartialFormType } from '../formSchema';
import StakeholderForm from './StakeholderForm';
import styles from './styles.css';

const GET_METADATA_OPTIONS = gql`
    query GetOptions {
        crisisOptions: __type(name: "AssessmentRegistryCrisisTypeEnum") {
            enumValues {
                name
                description
            }
        }
        preparednessOptions: __type(name: "AssessmentRegistryPreparednessTypeEnum") {
            enumValues {
                name
                description
            }
        }
        externalOptions: __type(name: "AssessmentRegistryExternalTypeEnum") {
            enumValues {
                name
                description
            }
        }
        coordinationJointOptions: __type(name: "AssessmentRegistryCoordinationTypeEnum") {
            enumValues {
                name
                description
            }
        }
        detailOptions: __type(name: "AssessmentRegistryDetailTypeEnum") {
            enumValues {
                name
                description
            }
        }
        familyOptions: __type(name: "AssessmentRegistryFamilyTypeEnum") {
            enumValues {
                name
                description
            }
        }
        frequencyOptions: __type(name: "AssessmentRegistryFrequencyTypeEnum") {
            enumValues {
                name
                description
            }
        }
        confidentialityOptions: __type(name: "AssessmentRegistryConfidentialityTypeEnum") {
            enumValues {
                name
                description
            }
        }
        languageOptions: __type(name: "AssessmentRegistryLanguageTypeEnum") {
            enumValues {
                name
                description
            }
        }
    }
`;

interface Props {
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    setValue: (value: SetBaseValueArg<PartialFormType>) => void;
    error: Error<PartialFormType>;
}

function MetadataForm(props: Props) {
    const {
        value,
        setFieldValue,
        setValue,
        error: riskyError,
    } = props;
    const error = getErrorObject(riskyError);

    const [
        regionOptions,
        setRegionOptions,
    ] = useState<BasicRegion[] | undefined | null>();

    const {
        data,
        loading,
    } = useQuery<GetOptionsQuery, GetOptionsQueryVariables>(
        GET_METADATA_OPTIONS,
    );

    const [
        crisisOptions,
        preparednessOptions,
        externalOptions,
        coordinationJointOptions,
        detailOptions,
        familyOptions,
        frequencyOptions,
        confidentialityOptions,
        languageOptions,
    ] = useMemo(() => ([
        data?.crisisOptions?.enumValues,
        data?.preparednessOptions?.enumValues,
        data?.externalOptions?.enumValues,
        data?.coordinationJointOptions?.enumValues,
        data?.detailOptions?.enumValues,
        data?.familyOptions?.enumValues,
        data?.frequencyOptions?.enumValues,
        data?.confidentialityOptions?.enumValues,
        data?.languageOptions?.enumValues,
    ]), [data]);

    return (
        <div className={styles.metadataForm}>
            <div className={styles.formElement}>
                Background
                <RegionMultiSelectInput
                    label="Country"
                    name="bgCountries"
                    value={value.bgCountries}
                    onChange={setFieldValue}
                    options={regionOptions}
                    onOptionsChange={setRegionOptions}
                    publicRegions
                    error={getErrorString(error?.bgCountries)}
                />
                <SelectInput
                    label="Crisis Type"
                    name="bgCrisisType"
                    value={value.bgCrisisType}
                    onChange={setFieldValue}
                    error={error?.bgCrisisType}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    options={crisisOptions}
                />
                <DateInput
                    label="Crisis Start Date"
                    name="bgCrisisStartDate"
                    value={value.bgCrisisStartDate}
                    onChange={setFieldValue}
                    error={error?.bgCrisisStartDate}
                />
                <SelectInput
                    label="Preparedeness"
                    name="bgPreparedness"
                    value={value.bgPreparedness}
                    onChange={setFieldValue}
                    error={error?.bgPreparedness}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    options={preparednessOptions}
                />
                <SelectInput
                    label="External Support"
                    name="externalSupport"
                    value={value.externalSupport}
                    onChange={setFieldValue}
                    error={error?.externalSupport}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    options={externalOptions}
                />
                <SelectInput
                    label="Coordination"
                    name="coordinatedJoint"
                    value={value.coordinatedJoint}
                    onChange={setFieldValue}
                    error={error?.coordinatedJoint}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    options={coordinationJointOptions}
                />
            </div>
            <div className={styles.formElement}>
                Details
                <SelectInput
                    label="Type"
                    name="detailsType"
                    value={value.detailsType}
                    onChange={setFieldValue}
                    error={error?.detailsType}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    options={detailOptions}
                />
                <SelectInput
                    label="Family"
                    name="family"
                    value={value.family}
                    onChange={setFieldValue}
                    error={error?.family}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    options={familyOptions}
                />
                <SelectInput
                    label="Frequency"
                    name="frequency"
                    value={value.frequency}
                    onChange={setFieldValue}
                    error={error?.frequency}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    options={frequencyOptions}
                />
                <SelectInput
                    label="Confidentiality"
                    name="confidentiality"
                    value={value.confidentiality}
                    onChange={setFieldValue}
                    error={error?.confidentiality}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    options={confidentialityOptions}
                />
                <MultiSelectInput
                    label="Language"
                    name="language"
                    value={value.language}
                    onChange={setFieldValue}
                    keySelector={enumKeySelector}
                    labelSelector={enumLabelSelector}
                    options={languageOptions}
                />
                <NumberInput
                    label="No. of Pages"
                    name="noOfPages"
                    value={value.noOfPages}
                    onChange={setFieldValue}
                    error={error?.noOfPages}
                />
            </div>
            <div className={styles.formElement}>
                Key Dates
                <DateInput
                    label="Data Collection Start Date"
                    name="dataCollectionStartDate"
                    value={value.dataCollectionStartDate}
                    onChange={setFieldValue}
                    error={error?.dataCollectionStartDate}
                />
                <DateInput
                    label="Data Collection End Date"
                    name="dataCollectionEndDate"
                    value={value.dataCollectionEndDate}
                    onChange={setFieldValue}
                    error={error?.dataCollectionEndDate}
                />
                <DateInput
                    label="Publication Date"
                    name="publicationDate"
                    value={value.publicationDate}
                    onChange={setFieldValue}
                    error={error?.publicationDate}
                />
            </div>
            <StakeholderForm
                className={styles.stakeholderForm}
                value={value}
                setValue={setValue}
                loading={loading}
                error={error}
            />
        </div>
    );
}

export default MetadataForm;
