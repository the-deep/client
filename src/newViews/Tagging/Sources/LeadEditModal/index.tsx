import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Card,
    Button,
    Modal,
} from '@the-deep/deep-ui';
import {
    useForm,
} from '@togglecorp/toggle-form';

import LeadEditForm from './LeadEditForm';
import { schema, PartialFormType } from './LeadEditForm/schema';
import styles from './styles.scss';

interface Props {
    className?: string;
    onClose: () => void;
    leadId?: number;
    projectId: number;
}

function LeadEditModal(props: Props) {
    const {
        className,
        onClose,
        projectId,
        leadId,
    } = props;

    const initialValue: PartialFormType = useMemo(() => ({
        project: projectId,
    }), [projectId]);

    const {
        pristine,
        value,
        setFieldValue,
    } = useForm(schema, initialValue);
    console.warn('here', value, leadId);

    return (
        <Modal
            className={_cs(className, styles.leadEditModal)}
            onCloseButtonClick={onClose}
            heading="Add a source"
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    disabled={pristine}
                    name="save"
                >
                    Save
                </Button>
            )}
        >
            <Card className={styles.preview}>
                Preview
            </Card>
            <Card className={styles.formContainer}>
                <LeadEditForm
                    value={value}
                    initialValue={initialValue}
                    setFieldValue={setFieldValue}
                />
            </Card>
        </Modal>
    );
}

export default LeadEditModal;
