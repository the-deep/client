import React, { useMemo, useCallback } from 'react';
import {
    isDefined,
    sum,
} from '@togglecorp/fujs';
import {
    IoClose,
    IoTrashBinOutline,
    IoCopy,
} from 'react-icons/io5';
import {
    Button,
    ConfirmButton,
    useModalState,
} from '@the-deep/deep-ui';

import _ts from '#ts';
import LeadCopyModal from '../LeadCopyModal';
import { Lead } from '../types';

import styles from './styles.css';

interface Props {
    selectedLeads: Lead[];
    onClearSelection: () => void;
    activeProject: string;
    onRemoveClick: (leadsToDelete: string[]) => void;
}

function BulkActions(props: Props) {
    const {
        selectedLeads,
        onClearSelection,
        activeProject,
        onRemoveClick,
    } = props;

    const [
        leadCopyModalShown,
        showLeadCopyModal,
        hideLeadCopyModal,
    ] = useModalState(false);

    const entriesCount = useMemo(() => (
        sum(selectedLeads.map((lead) => lead.entriesCount?.total).filter(isDefined))
    ), [selectedLeads]);

    const assessmentsCount = useMemo(() => (
        selectedLeads.filter((lead) => isDefined(lead.assessmentId)).length
    ), [selectedLeads]);

    const onRemoveBulkLead = useCallback(() => {
        if (onRemoveClick) {
            onRemoveClick(selectedLeads.map((lead) => lead.id));
        }
    }, [onRemoveClick, selectedLeads]);

    const selectedLeadsIds = useMemo(() => (
        selectedLeads.map((lead) => lead.id)
    ), [selectedLeads]);

    return (
        <div className={styles.bulkActionsBar}>
            <div className={styles.text}>
                {_ts('leads', 'selectedLeadsCount', { count: selectedLeads.length })}
            </div>
            <Button
                name="clear"
                title={_ts('leads', 'clearSelectedLeadsTitle')}
                icons={(<IoClose />)}
                variant="general"
                onClick={onClearSelection}
                className={styles.button}
            >
                {_ts('leads', 'clearSelectionButtonTitle')}
            </Button>
            <Button
                name="bulk-copy"
                title="Copy to Projects"
                icons={<IoCopy />}
                variant="general"
                onClick={showLeadCopyModal}
            >
                Copy to Other Projects
            </Button>
            <ConfirmButton
                name="bulk-delete"
                title={_ts('leads', 'removeLeadLeadButtonTitle')}
                onConfirm={onRemoveBulkLead}
                variant="tertiary"
                icons={<IoTrashBinOutline />}
                className={styles.button}
                message={_ts('leads', 'removeMultipleLeadsConfirm', {
                    leadsCount: (
                        <b>
                            {`${selectedLeads.length} Source(s)`}
                        </b>
                    ),
                    entriesCount: (
                        <b>
                            {`${entriesCount} Entry(s)`}
                        </b>
                    ),
                    assessmentsCount: (
                        <b>
                            {`${assessmentsCount} Assessment(s)`}
                        </b>
                    ),
                })}
            >
                {_ts('leads', 'bulkDeleteButtonText')}
            </ConfirmButton>
            {leadCopyModalShown && (
                <LeadCopyModal
                    projectId={activeProject}
                    onClose={hideLeadCopyModal}
                    leadIds={selectedLeadsIds}
                />
            )}
        </div>
    );
}

export default BulkActions;
