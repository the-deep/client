import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoChevronForward,
    IoAdd,
    IoSearch,
} from 'react-icons/io5';
import {
    Container,
    Button,
    ListView,
    RawButton,
    TextInput,
    SelectInput,
    TextOutput,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    PartialForm,
    requiredCondition,
    useForm,
} from '@togglecorp/toggle-form';

import {
    MultiResponse,
} from '#types';
import { useRequest } from '#base/utils/restRequest';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import useDebouncedValue from '#hooks/useDebouncedValue';
import ProjectContext from '#base/context/ProjectContext';
import { isFiltered } from '#utils/common';
import routes from '#base/configs/routes';
import _ts from '#ts';

import FrameworkDetail from './FrameworkDetail';

import styles from './styles.css';

interface FrameworkMini {
    id: number;
    title: string;
    createdAt: string;
}

const frameworkKeySelector = (d: FrameworkMini) => d.id;

interface ItemProps {
    itemKey: string;
    title: string;
    createdAt: string;
    onClick: (key: string) => void;
    isSelected: boolean;
}

function Item(props: ItemProps) {
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
    projectId: string;
}

function ProjectFramework(props: Props) {
    const {
        className,
        projectId,
    } = props;

    const { project } = React.useContext(ProjectContext);

    const [
        selectedFramework,
        setSelectedFramework,
    ] = useState<string | undefined>(project?.analysisFramework?.id);

    useEffect(() => {
        setSelectedFramework(project?.analysisFramework?.id);
    }, [project?.analysisFramework]);

    const [frameworkList, setFrameworkList] = useState<FrameworkMini[]>([]);
    const [offset, setOffset] = useState<number>(0);

    const {
        value,
        setFieldValue,
    } = useForm(schema, defaultFormValue);

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
        preserveResponse: true,
    });

    const frameworksRendererParams = useCallback((key: number, data: FrameworkMini) => ({
        itemKey: String(key),
        title: data.title,
        createdAt: data.createdAt,
        onClick: setSelectedFramework,
        isSelected: String(key) === selectedFramework,
    }), [selectedFramework]);

    const handleShowMoreButtonClick = useCallback(() => {
        setOffset(frameworkList.length);
    }, [frameworkList.length]);

    const handleNewFrameworkAddSuccess = useCallback((newFrameworkId: string) => {
        setSelectedFramework(newFrameworkId);
        setFrameworkList([]);
        if (offset !== 0) {
            setOffset(0);
        } else {
            retriggerGetFrameworkListRequest();
        }
    }, [
        setSelectedFramework,
        retriggerGetFrameworkListRequest,
        offset,
    ]);

    return (
        <div className={_cs(styles.framework, className)}>
            <div className={styles.leftContainer}>
                <div className={styles.filters}>
                    <SelectInput
                        name="relatedToMe"
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
                        onChange={setFieldValue}
                        value={value.search}
                        placeholder={_ts('projectEdit', 'searchLabel')}
                    />
                </div>
                <div className={styles.bottomContent}>
                    <ListView
                        className={styles.frameworkList}
                        pending={frameworksGetPending}
                        errored={false}
                        data={frameworkList}
                        keySelector={frameworkKeySelector}
                        renderer={Item}
                        filtered={isFiltered(value)}
                        rendererParams={frameworksRendererParams}
                        messageShown
                        messageIconShown
                    />
                    {
                        (frameworkList.length < (frameworksResponse?.count ?? 0))
                        && (
                            <Button
                                className={styles.showMoreButton}
                                variant="action"
                                name="showMore"
                                onClick={handleShowMoreButtonClick}
                                disabled={frameworksGetPending}
                                actions={(
                                    <IoChevronForward />
                                )}
                            >
                                {/* TODO: Might move to component library, no need to use ts */}
                                Show More
                            </Button>
                        )
                    }
                </div>
            </div>
            <Container
                className={styles.mainContainer}
                headerActions={(
                    <SmartButtonLikeLink
                        title={_ts('projectEdit', 'addNewFrameworkButtonLabel')}
                        icons={(<IoAdd />)}
                        route={routes.analyticalFrameworkCreate}
                        variant="tertiary"
                    >
                        {_ts('projectEdit', 'addNewFrameworkButtonLabel')}
                    </SmartButtonLikeLink>
                )}
                contentClassName={styles.mainContainerContent}
            >
                {selectedFramework ? (
                    <FrameworkDetail
                        projectFrameworkId={project?.analysisFramework?.id}
                        projectId={projectId}
                        frameworkId={selectedFramework}
                        className={styles.selectedFrameworkDetails}
                        onFrameworkCreate={handleNewFrameworkAddSuccess}
                    />
                ) : (
                    <div className={styles.noFrameworkSelected}>
                        {_ts('projectEdit', 'noFrameworkSelectedMessage')}
                    </div>
                )}
            </Container>
        </div>
    );
}

export default ProjectFramework;
