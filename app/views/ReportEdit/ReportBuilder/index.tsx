import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';
import {
    ListView,
    Modal,
    Header,
    QuickActionButton,
} from '@the-deep/deep-ui';
import {
    type Error,
    analyzeErrors,
    getErrorObject,
    type EntriesAsList,
} from '@togglecorp/toggle-form';
import { IoPencil } from 'react-icons/io5';

import Avatar from '#components/Avatar';
import { useModalState } from '#hooks/stateManagement';
import {
    BasicOrganization,
    organizationTitleSelector,
    organizationLogoSelector,
} from '#components/selections/NewOrganizationMultiSelectInput';
import NonFieldError from '#components/NonFieldError';

import {
    type PartialFormType,
    type ReportContainerType,
} from '../schema';

import ReportContainer from './ReportContainer';
import MetadataEdit from './MetadataEdit';

import styles from './styles.css';

const metadataFields: (keyof PartialFormType)[] = [
    'slug',
    'title',
    'subTitle',
];

const reportContainerKeySelector = (item: ReportContainerType) => item.clientId;

interface Props {
    className?: string;
    value: PartialFormType;
    error: Error<PartialFormType>;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    readOnly?: boolean;
    disabled?: boolean;
    organizationOptions: BasicOrganization[] | undefined | null;
    onOrganizationOptionsChange: React.Dispatch<React.SetStateAction<
        BasicOrganization[] | undefined | null
    >>;
}

function ReportBuilder(props: Props) {
    const {
        className,
        error,
        value,
        setFieldValue,
        readOnly,
        disabled,
        organizationOptions,
        onOrganizationOptionsChange,
    } = props;

    const orgMap = useMemo(() => (
        listToMap(
            organizationOptions,
            (org) => org.id,
            (org) => org,
        )
    ), [organizationOptions]);

    const [
        contentEditModalVisible,
        showContentEditModal,
        hideContentEditModal,
    ] = useModalState(false);

    const reportContainerRendererParams = useCallback(
        (
            containerKey: string,
            item: ReportContainerType,
        ) => {
            const containersError = getErrorObject(error)?.containers;
            const itemError = getErrorObject(containersError)?.[containerKey];

            return ({
                row: item.row,
                containerKey,
                column: item.column,
                width: item.width,
                allItems: value?.containers,
                configuration: item.contentConfiguration,
                contentType: item.contentType,
                error: itemError,
                setFieldValue,
                readOnly,
                disabled,
            });
        },
        [
            error,
            value?.containers,
            setFieldValue,
            readOnly,
            disabled,
        ],
    );

    const errorInMetadata = useMemo(() => (
        metadataFields.some((field) => analyzeErrors(getErrorObject(error)?.[field]))
    ), [error]);

    console.log('aditya', value);

    return (
        <div className={_cs(className, styles.reportBuilder)}>
            <div className={styles.report}>
                <div
                    className={_cs(
                        errorInMetadata && styles.error,
                        styles.headingContainer,
                    )}
                >
                    <Header
                        heading={value?.title ?? 'Title goes here'}
                        headingSize="extraLarge"
                        description={value?.subTitle}
                        actions={value?.organizations?.map((org) => (
                            <Avatar
                                className={styles.organizationLogo}
                                key={org}
                                src={orgMap?.[org]
                                    ? organizationLogoSelector(orgMap[org]) : undefined}
                                name={orgMap?.[org]
                                    ? organizationTitleSelector(orgMap[org]) : undefined}
                            />
                        ))}
                    />
                    <QuickActionButton
                        name={undefined}
                        onClick={showContentEditModal}
                        className={styles.editButton}
                    >
                        <IoPencil />
                    </QuickActionButton>
                </div>
                <NonFieldError error={getErrorObject(error)?.containers} />
                <ListView
                    className={styles.containers}
                    data={value?.containers}
                    keySelector={reportContainerKeySelector}
                    renderer={ReportContainer}
                    rendererParams={reportContainerRendererParams}
                    errored={false}
                    filtered={false}
                    pending={false}
                />
            </div>
            {contentEditModalVisible && (
                <Modal
                    heading="Edit metadata"
                    onCloseButtonClick={hideContentEditModal}
                    freeHeight
                >
                    <MetadataEdit
                        setFieldValue={setFieldValue}
                        organizationOptions={organizationOptions}
                        onOrganizationOptionsChange={onOrganizationOptionsChange}
                        error={error}
                        value={value}
                    />
                </Modal>
            )}
        </div>
    );
}

export default ReportBuilder;
