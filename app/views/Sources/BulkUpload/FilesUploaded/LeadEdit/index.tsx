import React, { useEffect, useMemo } from 'react';
import {
    _cs,
    formatDateToString,
} from '@togglecorp/fujs';
import { useForm } from '@togglecorp/toggle-form';

import UserContext from '#base/context/UserContext';
import ProjectContext from '#base/context/ProjectContext';

import { FileUploadResponse } from '../../types';
import { schema, PartialFormType } from '../../../LeadEditModal/LeadEditForm/schema';
import LeadEditForm from '../../../LeadEditModal/LeadEditForm';

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

    const { project: activeProject } = React.useContext(ProjectContext);
    const { user } = React.useContext(UserContext);

    const partialLead: PartialFormType = useMemo(() => ({
        title: file?.title,
        project: activeProject ? +activeProject : undefined,
        assignee: user?.id ? +user.id : undefined,
        sourceType: file?.sourceType ?? 'website',
        publishedOn: formatDateToString(new Date(), 'yyyy-MM-dd'),
        confidentiality: 'unprotected',
        isAssessmentLead: false,
        priority: 100,
        attachment: file,
    }), [activeProject, file, user]);

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
