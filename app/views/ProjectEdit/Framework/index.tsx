import React, { useMemo, useEffect, useCallback, useState } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    IoChevronForward,
    IoAdd,
    IoSearch,
} from 'react-icons/io5';
import {
    Button,
    List,
    PendingMessage,
    RawButton,
    TextInput,
    SelectInput,
    Header,
    TextOutput,
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
} from '#types';
import { useRequest } from '#base/utils/restRequest';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

import AddFrameworkModal from './AddFrameworkModal';
import FrameworkDetail from './FrameworkDetail';
import styles from './styles.css';

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
            <TextOutput
                className={styles.createdOn}
                label={_ts('projectEdit', 'createdOnLabel')}
                value={createdAt}
                valueType="date"
            />
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

    const {
        response: projectDetails,
        retrigger: retriggerProjectDetailsRequest,
    } = useRequest<ProjectDetails>({
        skip: isNotDefined(projectId),
        url: `server://projects/${projectId}/`,
        method: 'GET',
        failureHeader: _ts('projectEdit', 'projectDetailsLabel'),
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
        setFieldValue,
    } = useForm(schema, defaultFormValue);

    const delayedValue = useDebouncedValue(value);

    const [
        frameworkAddModalShown,
        showFrameworkAddModal,
        hideFrameworkAddModal,
    ] = useModalState(false);

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
        retrigger: retriggerGetFrameworkListRequest,
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
        failureHeader: _ts('projectEdit', 'frameworkDetails'),
        preserveResponse: true,
    });

    const handleFrameworkAddClick = useCallback(() => {
        showFrameworkAddModal();
    }, [showFrameworkAddModal]);

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

    const handleNewFrameworkAddSuccess = useCallback((newFrameworkId: number) => {
        setSelectedFramework(newFrameworkId);
        retriggerGetFrameworkListRequest();
        hideFrameworkAddModal();
    }, [setSelectedFramework, hideFrameworkAddModal, retriggerGetFrameworkListRequest]);

    return (
        <div className={_cs(styles.framework, className)}>
            <div className={styles.leftPadding} />
            <div className={styles.leftContainer}>
                <div className={styles.filters}>
                    <SelectInput
                        name="relatedToMe"
                        className={styles.filter}
                        onChange={setFieldValue}
                        options={frameworkFilterOptions}
                        keySelector={relatedToMeKeySelector}
                        labelSelector={relatedToMeLabelSelector}
                        value={value.relatedToMe}
                        nonClearable
                    />
                    <TextInput
                        icons={<IoSearch />}
                        name="search"
                        className={styles.filter}
                        onChange={setFieldValue}
                        value={value.search}
                        placeholder={_ts('projectEdit', 'searchLabel')}
                    />
                </div>
                <div className={styles.frameworkList}>
                    {frameworksGetPending && <PendingMessage />}
                    {frameworkList.length > 0 ? (
                        <>
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
                        </>
                    ) : (
                        !frameworksGetPending && (
                            <div className={styles.emptyContainer}>
                                {_ts('projectEdit', 'noFrameworks')}
                            </div>
                        )
                    )}
                </div>
            </div>
            <div className={styles.mainContainer}>
                <Header
                    heading={_ts('projectEdit', 'infoOnFrameworkLabel')}
                    headingSize="extraSmall"
                    actions={(
                        <Button
                            name="addNewFramework"
                            title={_ts('projectEdit', 'addNewFrameworkButtonLabel')}
                            icons={(<IoAdd />)}
                            onClick={handleFrameworkAddClick}
                            variant="tertiary"
                        >
                            {_ts('projectEdit', 'addNewFrameworkButtonLabel')}
                        </Button>
                    )}
                />
                {frameworkAddModalShown && (
                    <AddFrameworkModal
                        onActionSuccess={handleNewFrameworkAddSuccess}
                        onModalClose={hideFrameworkAddModal}
                    />
                )}
                {selectedFramework ? (
                    <FrameworkDetail
                        projectFrameworkId={projectDetails?.analysisFramework}
                        projectId={projectId}
                        frameworkId={selectedFramework}
                        className={styles.selectedFrameworkDetails}
                        onProjectChange={retriggerProjectDetailsRequest}
                        onFrameworkChange={setSelectedFramework}
                        onFrameworkCreate={retriggerGetFrameworkListRequest}
                    />
                ) : (
                    <div className={styles.noFrameworkSelected}>
                        {_ts('projectEdit', 'noFrameworkSelectedMessage')}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProjectFramework;
