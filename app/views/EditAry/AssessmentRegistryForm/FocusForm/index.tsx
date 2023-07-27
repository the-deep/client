import React, { useMemo, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { CheckListInput } from '@the-deep/deep-ui';
import { IoGlobeOutline, IoPeopleSharp } from 'react-icons/io5';
import {
    EntriesAsList,
    Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import { enumKeySelector, enumLabelSelector } from '#utils/common';
import { GetFocusOptionsQuery, GetFocusOptionsQueryVariables } from '#generated/types';
import GeoLocationInput from '#components/GeoLocationInput';
import { GeoArea } from '#components/GeoMultiSelectInput';

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
    }
`;
interface Props {
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    error: Error<PartialFormType>;
}

function FocusForm(props: Props) {
    const {
        value,
        setFieldValue,
        error: riskyError,
    } = props;

    const error = getErrorObject(riskyError);
    const [geoAreaOptions, setGeoAreaOptions] = useState<GeoArea[] | undefined | null>();
    const {
        data,
        loading: pending,
    } = useQuery<GetFocusOptionsQuery, GetFocusOptionsQueryVariables>(
        GET_FOCUS_OPTIONS,
    );

    const [
        frameworkOptions,
        sectorOptions,
        protectionOptions,
        affectedOptions,
    ] = useMemo(() => ([
        data?.frameworkOptions?.enumValues ?? undefined,
        data?.sectorOptions?.enumValues ?? undefined,
        data?.protectionOptions?.enumValues ?? undefined,
        data?.affectedGroupOptions?.enumValues ?? undefined,
    ]), [data]);

    return (
        <div className={styles.focus}>
            <CheckListInput
                listContainerClassName={styles.inputContainer}
                label={(<Header title="Framewok Pillars" />)}
                name="focuses"
                direction="vertical"
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.focuses}
                options={frameworkOptions}
                onChange={setFieldValue}
                disabled={pending}
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
                options={sectorOptions}
                onChange={setFieldValue}
                disabled={pending}
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
                options={protectionOptions}
                onChange={setFieldValue}
                disabled={pending}
                error={getErrorString(error?.protectionInfoMgmts)}
            />
            <CheckListInput
                listContainerClassName={styles.inputContainer}
                label={(
                    <Header
                        title="Affected Groups"
                        icons={<IoPeopleSharp />}
                    />
                )}
                name="affectedGroups"
                direction="vertical"
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.affectedGroups}
                options={affectedOptions}
                onChange={setFieldValue}
                disabled={pending}
                error={getErrorString(error?.affectedGroups)}
            />
            <div className={styles.geoContainer}>
                <Header title="Geographic Locations" icons={<IoGlobeOutline />} />
                <div className={styles.geoInputContainer}>
                    <GeoLocationInput
                        name="locations"
                        value={value.locations}
                        onChange={setFieldValue}
                        error={error?.locations}
                        geoAreaOptions={geoAreaOptions}
                        onGeoAreaOptionsChange={setGeoAreaOptions}
                    />
                </div>
            </div>
        </div>
    );
}

export default FocusForm;
