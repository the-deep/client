import React, { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import {
    DateInput,
    MultiSelectInput,
    NumberInput,
    PendingAnimation,
    SelectInput,
} from '@the-deep/deep-ui';
import {
    EntriesAsList,
    Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import { enumKeySelector, enumLabelSelector } from '#utils/common';
import RegionMultiSelectInput, {
    BasicRegion,
} from '#components/selections/RegionMultiSelectInput';
import { BasicOrganization } from '#types';
import { EnumOptions } from '#types/common';
import {
    GetOptionsQuery,
    GetOptionsQueryVariables,
    AssessmentRegistryCrisisTypeEnum,
    AssessmentRegistryPreparednessTypeEnum,
    AssessmentRegistryExternalTypeEnum,
    AssessmentRegistryCoordinationTypeEnum,
    AssessmentRegistryDetailTypeEnum,
    AssessmentRegistryFamilyTypeEnum,
    AssessmentRegistryFrequencyTypeEnum,
    AssessmentRegistryConfidentialityTypeEnum,
    AssessmentRegistryLanguageTypeEnum,
} from '#generated/types';

import { PartialFormType } from '../formSchema';
import Header from '../Header';
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
    error: Error<PartialFormType>;
    setRegionOptions?: React.Dispatch<React.SetStateAction<BasicRegion[] | null | undefined>>;
    regionOptions?: BasicRegion[] | null;
    setStakeholderOptions: React.Dispatch<React.SetStateAction<BasicOrganization[]>>;
    stakeholderOptions: BasicOrganization[];
    loading?: boolean;
}

function MetadataForm(props: Props) {
    const {
        value,
        setFieldValue,
        error: riskyError,
        regionOptions,
        setRegionOptions,
        stakeholderOptions,
        setStakeholderOptions,
        loading,
    } = props;

    const error = getErrorObject(riskyError);

    const {
        data,
        loading: optionsLoading,
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
        data?.crisisOptions?.enumValues as EnumOptions<AssessmentRegistryCrisisTypeEnum>,
        data?.preparednessOptions?.enumValues as EnumOptions<
            AssessmentRegistryPreparednessTypeEnum
        >,
        data?.externalOptions?.enumValues as EnumOptions<AssessmentRegistryExternalTypeEnum>,
        data?.coordinationJointOptions?.enumValues as EnumOptions<
            AssessmentRegistryCoordinationTypeEnum
        >,
        data?.detailOptions?.enumValues as EnumOptions<AssessmentRegistryDetailTypeEnum>,
        data?.familyOptions?.enumValues as EnumOptions<AssessmentRegistryFamilyTypeEnum>,
        data?.frequencyOptions?.enumValues as EnumOptions<AssessmentRegistryFrequencyTypeEnum>,
        data?.confidentialityOptions?.enumValues as EnumOptions<
            AssessmentRegistryConfidentialityTypeEnum
        >,
        data?.languageOptions?.enumValues as EnumOptions<AssessmentRegistryLanguageTypeEnum>,
    ]), [data]);

    if (loading) {
        return (
            <div className={styles.pending}>
                <PendingAnimation />
            </div>
        );
    }

    return (
        <div className={styles.metadataForm}>
            <div className={styles.formElement}>
                <Header title="Background" />
                <div className={styles.inputs}>
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
                        label="Preparedness"
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
            </div>
            <div className={styles.formElement}>
                <Header title="Details" />
                <div className={styles.inputs}>
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
                        error={getErrorString(error?.language)}
                    />
                    <NumberInput
                        label="No. of Pages"
                        name="noOfPages"
                        value={value.noOfPages}
                        onChange={setFieldValue}
                        error={error?.noOfPages}
                    />
                </div>
            </div>
            <div className={styles.formElement}>
                <Header title="Key Dates" />
                <div className={styles.inputs}>
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
            </div>
            <StakeholderForm
                className={styles.stakeholderForm}
                value={value}
                setFieldValue={setFieldValue}
                loading={optionsLoading}
                error={error}
                stakeholderOptions={stakeholderOptions}
                setStakeholderOptions={setStakeholderOptions}
            />
        </div>
    );
}

export default MetadataForm;
