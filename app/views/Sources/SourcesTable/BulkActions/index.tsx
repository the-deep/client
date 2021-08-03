import React, { useMemo, useCallback } from 'react';
import {
    isDefined,
    sum,
} from '@togglecorp/fujs';
import {
    IoClose,
    IoTrashOutline,
} from 'react-icons/io5';
import {
    Button,
    ConfirmButton,
    PendingMessage,
    useAlert,
} from '@the-deep/deep-ui';

import { useLazyRequest } from '#base/utils/restRequest';
import { Lead } from '#types';
import _ts from '#ts';

import styles from './styles.css';

interface Props {
    selectedLeads: Lead[];
    onClearSelection: () => void;
    activeProject: number;
    onRemoveSuccess: () => void;
}

function BulkActions(props: Props) {
    const {
        selectedLeads,
        onClearSelection,
        activeProject,
        onRemoveSuccess,
    } = props;

    const alert = useAlert();

    const {
        pending: bulkDeletePending,
        trigger: bulkLeadDeleteTrigger,
    } = useLazyRequest<unknown, number[]>({
        url: `server://project/${activeProject}/leads/bulk-delete/`,
        method: 'POST',
        body: (ctx) => ({ leads: ctx }),
        onSuccess: () => {
            alert.show(
                'Leads deleted successfully!',
                { variant: 'success' },
            );
            onRemoveSuccess();
        },
        failureHeader: _ts('leads', 'leads'),
    });

    const entriesCount = useMemo(() => (
        sum(selectedLeads.map((lead) => lead?.entriesCount).filter(isDefined))
    ), [selectedLeads]);

    const assessmentsCount = useMemo(() => (
        selectedLeads.filter((lead) => isDefined(lead.assessmentId)).length
    ), [selectedLeads]);

    const onRemoveBulkLead = useCallback(() => {
        bulkLeadDeleteTrigger(selectedLeads.map((lead) => lead.id));
    }, [bulkLeadDeleteTrigger, selectedLeads]);

    return (
        <div className={styles.bulkActionsBar}>
            {bulkDeletePending && <PendingMessage />}
            <span className={styles.text}>
                {_ts('leads', 'selectedLeadsCount', { count: selectedLeads.length })}
            </span>
            <Button
                name="clear"
                title={_ts('leads', 'clearSelectedLeadsTitle')}
                icons={(<IoClose />)}
                onClick={onClearSelection}
                className={styles.button}
            >
                {_ts('leads', 'clearSelectionButtonTitle')}
            </Button>
            <ConfirmButton
                name="bulk-delete"
                title={_ts('leads', 'removeLeadLeadButtonTitle')}
                onConfirm={onRemoveBulkLead}
                icons={<IoTrashOutline />}
                className={styles.button}
                message={_ts('leads', 'removeMultipleLeadsConfirm', {
                    leadsCount: (
                        <b>
                            {`${selectedLeads.length} Leads`}
                        </b>
                    ),
                    entriesCount: (
                        <b>
                            {`${entriesCount} Entries`}
                        </b>
                    ),
                    assessmentsCount: (
                        <b>
                            {`${assessmentsCount} Assessments`}
                        </b>
                    ),
                })}
            >
                {_ts('leads', 'bulkDeleteButtonText')}
            </ConfirmButton>
        </div>
    );
}

export default BulkActions;
