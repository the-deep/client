import React, { useMemo, useState, useCallback } from 'react';
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

import {
    type PartialFormType,
    type ReportContainerType,
} from '../schema';

import ReportContainer from './ReportContainer';
import MetadataEdit from './MetadataEdit';

import styles from './styles.css';

const reportContainerKeySelector = (item: ReportContainerType) => item.clientId;

interface Props {
    className?: string;
    value: PartialFormType;
    error: Error<PartialFormType>;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    readOnly?: boolean;
    disabled?: boolean;
}

function ReportBuilder(props: Props) {
    const {
        className,
        error,
        value,
        setFieldValue,
        readOnly,
        disabled,
    } = props;

    const [
        organizationOptions,
        setOrganizationOptions,
    ] = useState<BasicOrganization[] | null | undefined>();

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
        ) => ({
            row: item.row,
            containerKey,
            column: item.column,
            width: item.width,
            allItems: value?.containers,
            configuration: item.contentConfiguration,
            contentType: item.contentType,
            setFieldValue,
            readOnly,
            disabled,
        }),
        [
            value?.containers,
            setFieldValue,
            readOnly,
            disabled,
        ],
    );

    return (
        <div className={_cs(className, styles.reportBuilder)}>
            <div className={styles.report}>
                <div className={styles.headingContainer}>
                    <Header
                        heading={value?.title ?? 'Title goes here'}
                        headingSize="extraLarge"
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
                        onOrganizationOptionsChange={setOrganizationOptions}
                        error={error}
                        value={value}
                    />
                </Modal>
            )}
        </div>
    );
}

export default ReportBuilder;
