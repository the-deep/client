import React, { useCallback, useMemo, useState } from 'react';
import {
    _cs,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';
import {
    TextInput,
    Container,
    Button,
    InputLabel,
    Checkbox,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
} from '@togglecorp/toggle-form';

import DismissableTextOutput from '#components/input/DismissableTextOutput';
import DismissableListOutput from '#components/input/DismissableListOutput';
import DismissableBooleanOutput from '#components/input/DismissableBooleanOutput';
import PublicOrganizationMultiSelectInput, {
    BasicOrganization,
    keySelector as organizationKeySelector,
    organizationTitleSelector as organizationLabelSelector,
} from '#components/selections/NewOrganizationMultiSelectInput';
import PublicFrameworkMultiSelectInput, {
    AnalysisFramework,
    keySelector as frameworkKeySelector,
    labelSelector as frameworkLabelSelector,
} from '#components/selections/PublicFrameworkMultiSelectInput';
import RegionMultiSelectInput, {
    BasicRegion,
    keySelector as regionKeySelector,
    labelSelector as regionLabelSelector,
} from '#components/selections/RegionMultiSelectInput';

import styles from './styles.css';

export type FormType = {
    search?: string;
    organizations?: string[];
    analysisFrameworks?: string[];
    regions?: string[];
    excludeTestProject?: boolean;
    excludeProjectsLessThan?: boolean;
};

type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        search: [],
        organizations: [],
        analysisFrameworks: [],
        regions: [],
    }),
};

interface Props {
    className?: string;
    initialValue: FormType | undefined;
    onFiltersChange: (filters: FormType | undefined) => void;
    readOnly: boolean;
}

function ProjectFilters(props: Props) {
    const {
        className,
        onFiltersChange,
        initialValue,
        readOnly,
    } = props;

    const {
        pristine,
        setPristine,
        value,
        setValue,
        setFieldValue,
    } = useForm(schema, initialValue ?? {});

    const isFilterEmpty = useMemo(() => (
        doesObjectHaveNoData(value, [''])
    ), [value]);

    const isClearDisabled = isFilterEmpty && pristine;

    const handleClearFilters = useCallback(() => {
        onFiltersChange({});
        setPristine(true);
        setValue({});
    }, [
        setPristine,
        onFiltersChange,
        setValue,
    ]);

    const [
        organizationOptions,
        setOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const [
        analysisFrameworkOptions,
        setAnalysisFrameworkOptions,
    ] = useState<AnalysisFramework[] | undefined | null>();

    const [
        regionOptions,
        setRegionOptions,
    ] = useState<BasicRegion[] | undefined | null>();

    const handleSubmit = useCallback(() => {
        setPristine(true);
        onFiltersChange(value);
    }, [
        onFiltersChange,
        value,
        setPristine,
    ]);

    return (
        <div className={_cs(styles.projectFilters, className)}>
            {readOnly ? (
                <DismissableTextOutput
                    name="search"
                    label="Search"
                    value={value?.search}
                    onDismiss={setFieldValue}
                    readOnly
                />
            ) : (
                <TextInput
                    name="search"
                    label="Search"
                    value={value?.search}
                    onChange={setFieldValue}
                    placeholder="any"
                />
            )}
            {readOnly ? (
                <DismissableListOutput
                    name="organizations"
                    label="Organizations"
                    value={value?.organizations}
                    onDismiss={setFieldValue}
                    options={organizationOptions}
                    labelSelector={organizationLabelSelector}
                    keySelector={organizationKeySelector}
                    readOnly
                />
            ) : (
                <PublicOrganizationMultiSelectInput
                    name="organizations"
                    label="Organizations"
                    value={value?.organizations}
                    onChange={setFieldValue}
                    options={organizationOptions}
                    onOptionsChange={setOrganizationOptions}
                    placeholder="any"
                />
            )}
            {readOnly ? (
                <DismissableListOutput
                    name="analysisFrameworks"
                    label="Organizations"
                    value={value?.analysisFrameworks}
                    onDismiss={setFieldValue}
                    options={analysisFrameworkOptions}
                    keySelector={frameworkKeySelector}
                    labelSelector={frameworkLabelSelector}
                    readOnly
                />
            ) : (
                <PublicFrameworkMultiSelectInput
                    name="analysisFrameworks"
                    label="Analysis Frameworks"
                    placeholder="any"
                    value={value?.analysisFrameworks}
                    onChange={setFieldValue}
                    options={analysisFrameworkOptions}
                    onOptionsChange={setAnalysisFrameworkOptions}
                />
            )}
            {readOnly ? (
                <DismissableListOutput
                    name="regions"
                    label="Regions"
                    value={value?.regions}
                    onDismiss={setFieldValue}
                    options={regionOptions}
                    keySelector={regionKeySelector}
                    labelSelector={regionLabelSelector}
                    readOnly
                />
            ) : (
                <RegionMultiSelectInput
                    name="regions"
                    label="Location"
                    placeholder="any"
                    value={value?.regions}
                    onChange={setFieldValue}
                    options={regionOptions}
                    onOptionsChange={setRegionOptions}
                    publicRegions
                />
            )}
            {readOnly ? (
                <>
                    <DismissableBooleanOutput
                        label=""
                        name="excludeTestProject"
                        onDismiss={setFieldValue}
                        trueLabel="Test projects excluded"
                        falseLabel="Test projects included"
                        value={value.excludeTestProject ?? false}
                        readOnly
                    />
                    <DismissableBooleanOutput
                        label=""
                        name="excludeProjectsLessThan"
                        onDismiss={setFieldValue}
                        trueLabel="Projects less than 100 projects excluded"
                        falseLabel="Projects less than 100 projects included"
                        value={value.excludeProjectsLessThan ?? false}
                        readOnly
                    />
                </>
            ) : (
                <Container
                    className={styles.excludeContainer}
                    heading={<InputLabel>Exclude</InputLabel>}
                    headingSize="extraSmall"
                    spacing="compact"
                    contentClassName={styles.excludeContent}
                >
                    <Checkbox
                        name="excludeTestProject"
                        label="Test Project"
                        value={value?.excludeTestProject}
                        onChange={setFieldValue}
                    />
                    <Checkbox
                        name="excludeProjectsLessThan"
                        label="Projects < 100 entries"
                        value={value?.excludeProjectsLessThan}
                        onChange={setFieldValue}
                    />
                </Container>
            )}
            {!readOnly && (
                <>
                    <Button
                        name={undefined}
                        disabled={isClearDisabled}
                        onClick={handleClearFilters}
                        variant="secondary"
                        spacing="compact"
                    >
                        Clear
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleSubmit}
                        disabled={pristine}
                        variant="primary"
                        spacing="compact"
                    >
                        Apply
                    </Button>
                </>
            )}
        </div>
    );
}

export default ProjectFilters;
