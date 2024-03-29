import React, { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { CheckListInput, Message } from '@the-deep/deep-ui';
import {
    EntriesAsList,
    Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import { enumKeySelector, enumLabelSelector } from '#utils/common';
import { EnumOptions } from '#types/common';
import GeoLocationInput from '#components/GeoLocationInput';
import { GeoArea } from '#components/GeoMultiSelectInput';
import {
    GetFocusOptionsQuery,
    GetFocusOptionsQueryVariables,
    AssessmentRegistryFocusTypeEnum,
    AssessmentRegistrySectorTypeEnum,
    AssessmentRegistryProtectionInfoTypeEnum,
    AssessmentRegistryAffectedGroupTypeEnum,
    AssessmentRegistryProtectionRiskTypeEnum,
} from '#generated/types';

import { PartialFormType } from '../formSchema';
import Header from '../Header';

import styles from './styles.css';

const GET_FOCUS_OPTIONS = gql`
    query GetFocusOptions {
        frameworkOptions: __type(name: "AssessmentRegistryFocusTypeEnum") {
            enumValues {
                name
                description
            }
        }
        sectorOptions: __type(name: "AssessmentRegistrySectorTypeEnum") {
            enumValues {
                name
                description
            }
        }
        protectionOptions: __type(name: "AssessmentRegistryProtectionInfoTypeEnum") {
            enumValues {
                name
                description
            }
        }
        affectedGroupOptions: __type(name: "AssessmentRegistryAffectedGroupTypeEnum") {
            enumValues {
                name
                description
            }
        }
        protectionRiskOptions: __type(name: "AssessmentRegistryProtectionRiskTypeEnum") {
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
    setGeoAreaOptions: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    geoAreaOptions?: GeoArea[] | null;
    loading?: boolean;
}

function FocusForm(props: Props) {
    const {
        value,
        setFieldValue,
        error: riskyError,
        setGeoAreaOptions,
        geoAreaOptions,
        loading,
    } = props;

    const error = getErrorObject(riskyError);
    const {
        data,
        loading: optionsLoading,
    } = useQuery<GetFocusOptionsQuery, GetFocusOptionsQueryVariables>(
        GET_FOCUS_OPTIONS,
    );

    const [
        frameworkOptions,
        sectorOptions,
        protectionOptions,
        affectedOptions,
        protectionRiskOptions,
    ] = useMemo(() => ([
        data?.frameworkOptions?.enumValues as EnumOptions<AssessmentRegistryFocusTypeEnum>,
        data?.sectorOptions?.enumValues as EnumOptions<AssessmentRegistrySectorTypeEnum>,
        data?.protectionOptions?.enumValues as EnumOptions<
            AssessmentRegistryProtectionInfoTypeEnum
        >,
        data?.affectedGroupOptions?.enumValues as EnumOptions<
            AssessmentRegistryAffectedGroupTypeEnum
        >,
        data?.protectionRiskOptions?.enumValues as EnumOptions<
            AssessmentRegistryProtectionRiskTypeEnum
        >,
    ]), [data]);

    const handleSectorSelect = (sectorVal: AssessmentRegistrySectorTypeEnum[]) => {
        const newValue = value.scoreAnalyticalDensity?.filter(
            (sector) => sectorVal?.includes(sector?.sector as AssessmentRegistrySectorTypeEnum),
        );
        setFieldValue(sectorVal, 'sectors');
        setFieldValue(newValue, 'scoreAnalyticalDensity');
    };

    if (loading || optionsLoading) {
        return (
            <Message pending={loading || optionsLoading} />
        );
    }

    return (
        <div className={styles.focus}>
            <CheckListInput
                listContainerClassName={styles.inputContainer}
                label={(<Header title="Framework Pillars" />)}
                name="focuses"
                direction="vertical"
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.focuses}
                options={frameworkOptions ?? undefined}
                onChange={setFieldValue}
                disabled={optionsLoading}
                error={getErrorString(error?.focuses)}

            />
            <CheckListInput
                listContainerClassName={styles.inputContainer}
                label={(<Header title="Humanitarian Sectors" />)}
                name="sectors"
                direction="vertical"
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.sectors}
                options={sectorOptions ?? undefined}
                onChange={handleSectorSelect}
                disabled={optionsLoading}
                error={getErrorString(error?.sectors)}
            />
            <CheckListInput
                listContainerClassName={styles.inputContainer}
                label={(<Header title="Protection Information Management Systems" />)}
                name="protectionInfoMgmts"
                direction="vertical"
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.protectionInfoMgmts}
                options={protectionOptions ?? undefined}
                onChange={setFieldValue}
                disabled={!value.sectors?.some((sector) => sector === 'PROTECTION')}
                error={getErrorString(error?.protectionInfoMgmts)}
            />
            <CheckListInput
                listContainerClassName={styles.inputContainer}
                label={(<Header title="Protection Risks" />)}
                name="protectionRisks"
                direction="vertical"
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.protectionRisks}
                options={protectionRiskOptions ?? undefined}
                onChange={setFieldValue}
                error={getErrorString(error?.protectionRisks)}
            />
            <CheckListInput
                listContainerClassName={styles.inputContainer}
                label={(
                    <Header
                        title="Affected Groups"
                    />
                )}
                name="affectedGroups"
                direction="vertical"
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.affectedGroups}
                options={affectedOptions ?? undefined}
                onChange={setFieldValue}
                disabled={optionsLoading}
                error={getErrorString(error?.affectedGroups)}
            />
            <div className={styles.geoContainer}>
                <Header title="Geographic Locations" />
                <div className={styles.geoInputContainer}>
                    <GeoLocationInput
                        name="locations"
                        value={value.locations}
                        onChange={setFieldValue}
                        error={getErrorString(error?.locations)}
                        geoAreaOptions={geoAreaOptions}
                        onGeoAreaOptionsChange={setGeoAreaOptions}
                        showList
                    />
                </div>
            </div>
        </div>
    );
}

export default FocusForm;
