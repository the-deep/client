import React, { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    formatDateToString,
} from '@togglecorp/fujs';
import {
    useForm,
} from '@togglecorp/toggle-form';

import { AppState } from '#types';
import {
    activeUserSelector,
    activeProjectIdFromStateSelector,
} from '#redux';

import { FileUploadResponse } from '../../types';
import { schema, PartialFormType } from '../../../LeadEditModal/LeadEditForm/schema';
import LeadEditForm from '../../../LeadEditModal/LeadEditForm';

import styles from './styles.css';

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
        attachment: file,
    }), [activeProject, file, userId]);

    const {
        value,
        setValue,
        setFieldValue,
        setPristine,
        error: riskyError,
    } = useForm(schema, partialLead);

    useEffect(() => {
        setValue(partialLead);
    }, [partialLead, setValue]);

    return (
        <LeadEditForm
            className={_cs(className, styles.leadEdit)}
            value={value}
            projectId={activeProject}
            initialValue={partialLead}
            setFieldValue={setFieldValue}
            setPristine={setPristine}
            setValue={setValue}
            error={riskyError}
        />
    );
}

export default connect(mapStateToProps)(LeadEdit);
