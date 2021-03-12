import React, { useMemo, useEffect, useCallback, useState } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import { IoChevronForward } from 'react-icons/io5';
import {
    Card,
    Button,
    List,
    DateOutput,
    PendingMessage,
    RawButton,
    TextInput,
    SelectInput,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    PartialForm,
    requiredCondition,
    useForm,
} from '@togglecorp/toggle-form';

import {
    ProjectDetails,
    MultiResponse,
} from '#typings';
import { useRequest } from '#utils/request';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { notifyOnFailure } from '#utils/requestNotify';
import _ts from '#ts';

import FrameworkDetail from './FrameworkDetail';
import styles from './styles.scss';

interface FrameworkMini {
    id: number;
    title: string;
    createdAt: string;
}

const frameworkKeySelector = (d: FrameworkMini) => d.id;

interface ItemProps<T> {
    itemKey: T;
    title: string;
    createdAt: string;
    onClick: (key: T) => void;
    isSelected: boolean;
}

function Item<T>(props: ItemProps<T>) {
    const {
        itemKey,
        title,
        createdAt,
        onClick,
        isSelected,
    } = props;

    const handleItemClick = useCallback(() => {
        onClick(itemKey);
    }, [onClick, itemKey]);

    return (
        <RawButton
            name={`item-${itemKey}`}
            className={_cs(
                styles.item,
                isSelected && styles.selected,
            )}
            onClick={handleItemClick}
        >
            <div className={styles.title}>
                {title}
            </div>
            <div className={styles.createdAtContainer}>
                {_ts('projectEdit', 'createdOnLabel')}
                <DateOutput
                    format="dd MMM, yyyy"
                    className={styles.createdDate}
                    value={createdAt}
                />
            </div>
        </RawButton>
    );
}

interface Option {
    // NOTE: SelectInput doesn't support boolean as key
    key: 'true' | 'false';
    label: string;
}

const frameworkFilterOptions: Option[] = [
    {
        key: 'true',
        label: _ts('projectEdit', 'myFrameworksLabel'),
    },
    {
        key: 'false',
        label: _ts('projectEdit', 'allFrameworksLabel'),
    },
];

const relatedToMeKeySelector = (d: Option) => d.key;
const relatedToMeLabelSelector = (d: Option) => d.label;

type FormType = {
    relatedToMe?: 'true' | 'false';
    search: string;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        search: [],
        relatedToMe: [requiredCondition],
    }),
};

const defaultFormValue: PartialForm<FormType> = {
    relatedToMe: 'true',
    search: '',
};

interface Props {
    className?: string;
    projectId: number;
}

function ProjectFramework(props: Props) {
    const {
        className,
        projectId,
    } = props;

    const [projectDetails, setProjectDetails] = useState<ProjectDetails | undefined>(undefined);

    useRequest<ProjectDetails>({
        skip: isNotDefined(projectId),
        url: `server://projects/${projectId}/`,
        method: 'GET',
        onSuccess: (response) => {
            setProjectDetails(response);
        },
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('projectEdit', 'projectDetailsLabel'))({ error: errorBody }),
    });

    const [
        selectedFramework,
        setSelectedFramework,
    ] = useState<number| undefined>(projectDetails?.analysisFramework);

    useEffect(() => {
        setSelectedFramework(projectDetails?.analysisFramework);
    }, [projectDetails?.analysisFramework]);

    const [frameworkList, setFrameworkList] = useState<FrameworkMini[]>([]);
    const [offset, setOffset] = useState<number>(0);

    const {
        value,
        onValueChange,
    } = useForm(defaultFormValue, schema);

    const delayedValue = useDebouncedValue(value);

    useEffect(() => {
        setOffset(0);
        setFrameworkList([]);
    }, [delayedValue]);

    const queryForFrameworks = useMemo(() => ({
        fields: ['id', 'title', 'created_at'],
        offset,
        order: 'created_at',
        limit: 10,
        search: delayedValue.search,
        relatedToMe: delayedValue.relatedToMe,
    }), [delayedValue, offset]);

    const {
        pending: frameworksGetPending,
        response: frameworksResponse,
    } = useRequest<MultiResponse<FrameworkMini>>({
        url: 'server://analysis-frameworks/',
        query: queryForFrameworks,
        method: 'GET',
        onSuccess: (response) => {
            setFrameworkList([
                ...frameworkList,
                ...response.results,
            ]);
        },
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('projectEdit', 'frameworkDetails'))({ error: errorBody }),
        preserveResponse: true,
    });

    const frameworksRendererParams = useCallback((key, data) => ({
        itemKey: key,
        title: data.title,
        createdAt: data.createdAt,
        onClick: setSelectedFramework,
        isSelected: key === selectedFramework,
    }), [selectedFramework]);

    const handleShowMoreButtonClick = useCallback(() => {
        setOffset(frameworkList.length);
    }, [frameworkList.length]);

    return (
        <div className={_cs(styles.framework, className)}>
            <div className={styles.leftContainer}>
                <div className={styles.filters}>
                    <SelectInput
                        name="relatedToMe"
                        className={styles.filter}
                        onChange={onValueChange}
                        options={frameworkFilterOptions}
                        keySelector={relatedToMeKeySelector}
                        labelSelector={relatedToMeLabelSelector}
                        value={value.relatedToMe}
                        nonClearable
                    />
                    <TextInput
                        name="search"
                        className={styles.filter}
                        onChange={onValueChange}
                        value={value.search}
                        label={_ts('projectEdit', 'searchLabel')}
                        placeholder={_ts('projectEdit', 'searchPlaceholder')}
                    />
                </div>
                <div className={styles.bottomContainer}>
                    {frameworksGetPending && <PendingMessage />}
                    {frameworkList.length > 0 ? (
                        <Card className={styles.listContainer}>
                            <List
                                data={frameworkList}
                                keySelector={frameworkKeySelector}
                                renderer={Item}
                                rendererParams={frameworksRendererParams}
                            />
                            {(frameworkList.length < (frameworksResponse?.count ?? 0)) && (
                                <Button
                                    className={styles.showMoreButton}
                                    variant="action"
                                    name="showMore"
                                    onClick={handleShowMoreButtonClick}
                                    actions={(
                                        <IoChevronForward />
                                    )}
                                >
                                    {/* TODO: Might move to component library, no need to use ts */}
                                    Show More
                                </Button>
                            )}
                        </Card>
                    ) : (
                        <Card className={styles.emptyContainer}>
                            {!frameworksGetPending && _ts('projectEdit', 'noFrameworks')}
                        </Card>
                    )}
                </div>
            </div>
            {selectedFramework && (
                <FrameworkDetail
                    projectFrameworkId={projectDetails?.analysisFramework}
                    projectId={projectId}
                    frameworkId={selectedFramework}
                    className={styles.rightContainer}
                    onProjectChange={setProjectDetails}
                    onFrameworkChange={setSelectedFramework}
                />
            )}
        </div>
    );
}

export default ProjectFramework;