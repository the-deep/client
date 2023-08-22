import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { doesObjectHaveNoData } from '@togglecorp/fujs';
import { IoClose } from 'react-icons/io5';
import {
    TextInput,
    DateDualRangeInput,
    Button,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
} from '@togglecorp/toggle-form';
import {
    AssessmentListQueryVariables,
} from '#generated/types';
import ProjectMemberMultiSelectInput,
{
    ProjectMember,
} from '#components/selections/ProjectMemberMultiSelectInput';

import styles from './styles.css';

type FormType = Omit<AssessmentListQueryVariables, 'projectId'>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        search: [],
        createdBy: [],
        createdAtLte: [],
        createdAtGte: [],
        publicationDateLte: [],
        publicationDateGte: [],
    }),
};

const initialValue: FormType = {};

interface Props {
    filters: Omit<AssessmentListQueryVariables, 'projectId'> | undefined;
    onFiltersChange: (filters: Omit<AssessmentListQueryVariables, 'projectId'> | undefined) => void;
    projectId?: string;
}

function AssessmentFilterForm(props: Props) {
    const {
        filters,
        onFiltersChange,
        projectId,
    } = props;

    const {
        pristine,
        value,
        setValue,
        setFieldValue,
    } = useForm(schema, initialValue);

    useEffect(() => {
        setValue(filters ?? initialValue);
    }, [filters, setValue]);

    const [
        projectUserOptions,
        setProjectUserOptions,
    ] = useState<ProjectMember[] | undefined | null>(undefined);

    const isFilterEmpty = useMemo(() => (
        doesObjectHaveNoData(value, [''])
    ), [value]);

    const isClearDisabled = isFilterEmpty && pristine;

    const handleClearFilters = useCallback(() => {
        onFiltersChange({});
    }, [onFiltersChange]);

    const handleSubmit = useCallback(() => {
        onFiltersChange(value);
    }, [onFiltersChange, value]);

    return (
        <div className={styles.content}>
            <div className={styles.filters}>
                <TextInput
                    name="search"
                    label="Search"
                    value={value?.search}
                    onChange={setFieldValue}
                    placeholder="any"
                />
                <DateDualRangeInput
                    label="Creation Date"
                    fromName="createdAtGte"
                    toName="createdAtLte"
                    fromOnChange={setFieldValue}
                    toOnChange={setFieldValue}
                    fromValue={value?.createdAtGte}
                    toValue={value?.createdAtLte}
                />
                <DateDualRangeInput
                    label="Publication Date"
                    fromName="publicationDateGte"
                    toName="publicationDateLte"
                    fromOnChange={setFieldValue}
                    toOnChange={setFieldValue}
                    fromValue={value?.publicationDateGte}
                    toValue={value?.publicationDateLte}
                />
                {projectId && (
                    <ProjectMemberMultiSelectInput
                        label="Created by"
                        name="createdBy"
                        options={projectUserOptions}
                        onOptionsChange={setProjectUserOptions}
                        onChange={setFieldValue}
                        value={value?.createdBy}
                        projectId={projectId}
                    />
                )}
            </div>
            <div className={styles.buttonContainer}>
                <Button
                    name={undefined}
                    onClick={handleSubmit}
                    disabled={pristine}
                    variant="transparent"
                >
                    Apply
                </Button>
                <Button
                    name={undefined}
                    disabled={isClearDisabled}
                    onClick={handleClearFilters}
                    actions={<IoClose />}
                    variant="transparent"
                >
                    Clear
                </Button>
            </div>
        </div>
    );
}

export default AssessmentFilterForm;
