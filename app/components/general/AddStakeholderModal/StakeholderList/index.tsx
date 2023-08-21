import React, { useCallback } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';
import {
    PurgeNull,
    PartialForm,
} from '@togglecorp/toggle-form';
import {
    List,
    DropContainer,
} from '@the-deep/deep-ui';

import { BasicOrganization } from '#types';
import {
    ProjectOrganizationGqInputType,
    ProjectOrganizationTypeEnum,
} from '#generated/types';

import StakeholderRow from './StakeholderRow';

import styles from './styles.css';

export type BasicProjectOrganization = PurgeNull<ProjectOrganizationGqInputType>
    & { clientId: string };
const stakeholderRowKeySelector = (d: PartialForm<BasicProjectOrganization, 'clientId'>) => d.clientId;

interface Props {
    className?: string;
    value?: PartialForm<BasicProjectOrganization[], 'clientId'>;
    onChange: (stakeholders: PartialForm<BasicProjectOrganization[], 'clientId'>, name: ProjectOrganizationTypeEnum) => void;
    options: BasicOrganization[];
    onOptionsChange: (value: BasicOrganization[]) => void;
    label: string;
    name: ProjectOrganizationTypeEnum;
}

function StakeholderList(props: Props) {
    const {
        className,
        onChange,
        value,
        options,
        onOptionsChange,
        name,
        label,
    } = props;

    const handleDrop = useCallback((val: Record<string, unknown> | undefined) => {
        if (!val) {
            return;
        }
        const typedVal = val as { id: string; title: string; logoUrl?: string };
        if (options.findIndex((option) => option.id === typedVal.id) < 0) {
            onOptionsChange([...options, typedVal]);
        }
        if (!value) {
            onChange([
                {
                    organization: typedVal.id,
                    organizationType: name,
                    clientId: randomString(),
                },
            ], name);
        } else if (value.findIndex((v) => v.organization === typedVal.id) === -1) {
            onChange([
                ...value,
                {
                    organization: typedVal.id,
                    organizationType: name,
                    clientId: randomString(),
                },
            ], name);
        }
    }, [value, name, onChange, onOptionsChange, options]);

    const getValueLabel = useCallback((val: PartialForm<BasicProjectOrganization>) => (
        options.find((v) => v.id === val.organization)?.title
    ), [options]);

    const onRowRemove = useCallback((id: string) => {
        if (value) {
            onChange(value.filter((v) => v.organization !== id), name);
        }
    }, [value, name, onChange]);

    const rowRendererParams = useCallback((
        _: string,
        val: PartialForm<BasicProjectOrganization, 'clientId'>,
    ) => ({
        onRemove: onRowRemove,
        value: val.clientId,
        displayValue: getValueLabel(val),
    }), [onRowRemove, getValueLabel]);

    return (
        <DropContainer
            className={_cs(
                styles.stakeholderList,
                className,
            )}
            name="stakeholder"
            onDrop={handleDrop}
            contentClassName={styles.content}
            heading={label}
            headingSize="small"
        >
            <List
                data={value}
                renderer={StakeholderRow}
                keySelector={stakeholderRowKeySelector}
                rendererClassName={styles.row}
                rendererParams={rowRendererParams}
            />
        </DropContainer>
    );
}

export default StakeholderList;
