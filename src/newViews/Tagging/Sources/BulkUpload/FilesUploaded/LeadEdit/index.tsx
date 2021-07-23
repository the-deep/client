import React, { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    formatDateToString,
} from '@togglecorp/fujs';
import {
    useForm,
} from '@togglecorp/toggle-form';

import { AppState } from '#typings';
import {
    activeUserSelector,
    activeProjectIdFromStateSelector,
} from '#redux';

import { FileUploadResponse } from '../../types';
import { schema, PartialFormType } from '../../../LeadEditModal/LeadEditForm/schema';
import LeadEditForm from '../../../LeadEditModal/LeadEditForm';

import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    activeUser: activeUserSelector(state),
    activeProject: activeProjectIdFromStateSelector(state),
});

interface Props {
    className?: string;
    activeProject: number;
    activeUser: { userId: number };
    file?: FileUploadResponse;
}

function LeadEdit(props: Props) {
    const {
        className,
        activeProject,
        file,
        activeUser: {
            userId,
        },
    } = props;

    const partialLead: PartialFormType = useMemo(() => ({
        title: file?.title,
        project: activeProject,
        assignee: userId,
        sourceType: file?.sourceType ?? 'website',
        publishedOn: formatDateToString(new Date(), 'yyyy-MM-dd'),
        confidentiality: 'unprotected',
        isAssessmentLead: false,
        priority: 100,
        attachment: {
            id: file?.id,
            file: file?.file,
            mimeType: file?.mimeType,
            title: file?.title,
        },
    }), [activeProject, file, userId]);

    const {
        value,
        setValue,
        setFieldValue,
        error: riskyError,
    } = useForm(schema, partialLead);

    useEffect(() => {
        setValue(partialLead);
    }, [partialLead, setValue]);

    return (
        <div className={_cs(className, styles.leadEdit)}>
            <LeadEditForm
                className={styles.form}
                value={value}
                projectId={activeProject}
                initialValue={partialLead}
                setFieldValue={setFieldValue}
                error={riskyError}
            />
        </div>
    );
}

export default connect(mapStateToProps)(LeadEdit);
