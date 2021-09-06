import React, { useEffect, useMemo } from 'react';
import {
    _cs,
    formatDateToString,
} from '@togglecorp/fujs';
import { useForm } from '@togglecorp/toggle-form';

import UserContext from '#base/context/UserContext';
import ProjectContext from '#base/context/ProjectContext';

import { FileUploadResponse } from '../../types';
import { schema, PartialFormType } from '#components/lead/LeadEditForm/schema';
import LeadEditForm from '#components/lead/LeadEditForm';

import styles from './styles.css';

interface Props {
    className?: string;
    file?: FileUploadResponse;
}

function LeadEdit(props: Props) {
    const {
        className,
        file,
    } = props;

    const { project } = React.useContext(ProjectContext);
    const { user } = React.useContext(UserContext);

    const activeProject = project ? +project.id : undefined;
    const userId = user ? +user.id : undefined;

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

    if (!activeProject) {
        return null;
    }

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

export default LeadEdit;
