import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoCopyOutline,
    IoTrashBinOutline,
} from 'react-icons/io5';
import {
    Button,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';
import {
    ProjectExportsQuery,
} from '#generated/types';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import routes from '#base/configs/routes';
import styles from './styles.css';

type ExportItem = NonNullable<NonNullable<NonNullable<NonNullable<ProjectExportsQuery['project']>['exports']>>['results']>[number];

export interface Props {
    className?: string;
    onDeleteClick: (data: ExportItem) => void;
    onViewExportClick: (data: ExportItem) => void;
    viewDisabled: boolean;
    disabled?: boolean;
    data: ExportItem;
}

function TableActions(props: Props) {
    const {
        className,
        disabled,
        onDeleteClick,
        onViewExportClick,
        viewDisabled,
        data,
    } = props;

    const handleDeleteClick = useCallback(() => {
        onDeleteClick(data);
    }, [onDeleteClick, data]);

    return (
        <div className={_cs(styles.actions, className)}>
            <QuickActionConfirmButton
                name={undefined}
                title="Remove export"
                onConfirm={handleDeleteClick}
                message="Are you sure you want to remove this export?"
                showConfirmationInitially={false}
                disabled={disabled}
            >
                <IoTrashBinOutline />
            </QuickActionConfirmButton>
            {data.type === 'ENTRIES' && (
                <SmartButtonLikeLink
                    className={styles.button}
                    childrenContainerClassName={styles.children}
                    variant="secondary"
                    title="Create new export with these filters"
                    route={routes.exportCreate}
                    attrs={{
                        projectId: data.project ?? undefined,
                    }}
                    state={{
                        format: data.format,
                        filters: data.filters,
                        filtersData: data.filtersData,
                        extraOptions: data.extraOptions,
                    }}
                >
                    <IoCopyOutline />
                </SmartButtonLikeLink>
            )}
            {data.type === 'ASSESSMENTS' && (
                <SmartButtonLikeLink
                    className={styles.button}
                    childrenContainerClassName={styles.children}
                    variant="secondary"
                    title="Create new assessment export with these filters"
                    route={routes.assessmentExportCreate}
                    attrs={{
                        projectId: data.project ?? undefined,
                    }}
                    state={{
                        filters: data.filters,
                        filtersData: data.filtersData,
                    }}
                >
                    <IoCopyOutline />
                </SmartButtonLikeLink>
            )}
            <Button
                name={data}
                onClick={onViewExportClick}
                variant="secondary"
                disabled={disabled || viewDisabled}
            >
                View
            </Button>
        </div>
    );
}

export default TableActions;
