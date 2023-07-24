import React, { useMemo } from 'react';
import { EntriesAsList, Error, SetBaseValueArg } from '@togglecorp/toggle-form';
import { gql, useQuery } from '@apollo/client';
import { CheckListInput } from '@the-deep/deep-ui';
import { IoPeopleSharp } from 'react-icons/io5';

import { enumKeySelector, enumLabelSelector } from '#utils/common';
import { GetFocusOptionsQuery, GetFocusOptionsQueryVariables } from '#generated/types';

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
    setValue: (value: SetBaseValueArg<PartialFormType>) => void;
    error: Error<PartialFormType>;
}

function FocusForm(props: Props) {
    const {
        value,
        setFieldValue,
        setValue,
        error,
    } = props;

    const {
        data,
        loading,
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
                labelContainerClassName={styles.label}
                label={(<Header title="Framewok Pillars" />)}
                name="focuses"
                direction="vertical"
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.focuses}
                options={frameworkOptions}
                onChange={setFieldValue}
            />
            <CheckListInput
                listContainerClassName={styles.inputContainer}
                labelContainerClassName={styles.label}
                label={(<Header title="Humanitarian Sectors" />)}
                name="sectors"
                direction="vertical"
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.sectors}
                options={sectorOptions}
                onChange={setFieldValue}
            />
            <CheckListInput
                listContainerClassName={styles.inputContainer}
                labelContainerClassName={styles.label}
                label={(<Header title="Protection Information Management Systems" />)}
                name="protectionInfoMgmts"
                direction="vertical"
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.protectionInfoMgmts}
                options={protectionOptions}
                onChange={setFieldValue}
            />
            <CheckListInput
                listContainerClassName={styles.inputContainer}
                labelContainerClassName={styles.label}
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
            />
        </div>
    );
}

export default FocusForm;
