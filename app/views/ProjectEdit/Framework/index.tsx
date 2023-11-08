import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoChevronForward,
    IoAdd,
    IoSearch,
} from 'react-icons/io5';
import {
    Button,
    Container,
    Kraken,
    ListView,
    Message,
    RawButton,
    SelectInput,
    TextInput,
    TextOutput,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    PartialForm,
    requiredCondition,
    useForm,
} from '@togglecorp/toggle-form';
import {
    useQuery,
    gql,
} from '@apollo/client';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import useDebouncedValue from '#hooks/useDebouncedValue';
import ProjectContext from '#base/context/ProjectContext';
import { isFiltered } from '#utils/common';
import routes from '#base/configs/routes';
import _ts from '#ts';
import {
    ProjectAnalysisFrameworksQueryVariables,
    ProjectAnalysisFrameworksQuery,
} from '#generated/types';

import FrameworkDetail from './FrameworkDetail';

import styles from './styles.css';

const PAGE_SIZE = 10;
type FrameworkType = NonNullable<NonNullable<ProjectAnalysisFrameworksQuery['analysisFrameworks']>['results']>[number];

const frameworkKeySelector = (d: FrameworkType) => d.id;

export const PROJECT_FRAMEWORKS = gql`
    query ProjectAnalysisFrameworks(
        $isCurrentUserMember: Boolean,
        $search: String,
        $page: Int,
        $pageSize: Int,
        $createdBy: [ID!],
    ) {
        analysisFrameworks(
            search: $search,
            isCurrentUserMember: $isCurrentUserMember
            page: $page,
            pageSize: $pageSize,
            createdBy: $createdBy,
        ) {
            results {
                title
                id
                createdAt
            }
            page
            totalCount
        }
    }
`;

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

    return (
        <RawButton
            name={itemKey}
            className={_cs(
                styles.item,
                isSelected && styles.selected,
            )}
            onClick={onClick}
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

    const [frameworkList, setFrameworkList] = useState<FrameworkType[]>([]);

    const {
        value,
        setFieldValue,
    } = useForm(schema, defaultFormValue);

    const delayedValue = useDebouncedValue(value);
    const analysisFrameworkVariables = useMemo(() => (
        {
            isCurrentUserMember: delayedValue.relatedToMe === 'true' ? true : undefined,
            search: delayedValue.search,
            page: 1,
            pageSize: PAGE_SIZE,
        }
    ), [
        delayedValue.relatedToMe,
        delayedValue.search,
    ]);

    const {
        previousData,
        data: projectFrameworks = previousData,
        loading: frameworksGetPending,
        refetch: retriggerGetFrameworkListRequest,
        fetchMore,
    } = useQuery<ProjectAnalysisFrameworksQuery, ProjectAnalysisFrameworksQueryVariables>(
        PROJECT_FRAMEWORKS,
        {
            variables: analysisFrameworkVariables,
            onCompleted: (response) => {
                setFrameworkList(response?.analysisFrameworks?.results ?? []);
            },
        },
    );

    const handleShowMoreButtonClick = useCallback(() => {
        fetchMore({
            variables: {
                ...analysisFrameworkVariables,
                page: (projectFrameworks?.analysisFrameworks?.page ?? 1) + 1,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!previousResult.analysisFrameworks) {
                    return previousResult;
                }

                const oldFrameworks = previousResult.analysisFrameworks;
                const newFrameworks = fetchMoreResult?.analysisFrameworks;

                if (!newFrameworks) {
                    return previousResult;
                }

                const newFrameworkList = ({
                    ...previousResult,
                    analysisFrameworks: {
                        ...newFrameworks,
                        results: [
                            ...(oldFrameworks.results ?? []),
                            ...(newFrameworks.results ?? []),
                        ],
                    },
                });
                setFrameworkList(newFrameworkList.analysisFrameworks.results ?? []);
                return newFrameworkList;
            },
        });
    }, [
        fetchMore,
        analysisFrameworkVariables,
        projectFrameworks?.analysisFrameworks?.page,
    ]);

    const totalFrameworksCount = projectFrameworks?.analysisFrameworks?.totalCount ?? 0;
    const frameworks = projectFrameworks?.analysisFrameworks?.results || [];

    const frameworksRendererParams = useCallback((key: string, data: FrameworkType): ItemProps => ({
        itemKey: String(key),
        title: data.title,
        createdAt: data.createdAt,
        onClick: setSelectedFramework,
        isSelected: String(key) === selectedFramework,
    }), [selectedFramework]);

    const handleNewFrameworkAddSuccess = useCallback((newFrameworkId: string) => {
        setSelectedFramework(newFrameworkId);
        setFrameworkList([]);
        retriggerGetFrameworkListRequest();
    }, [
        setSelectedFramework,
        retriggerGetFrameworkListRequest,
    ]);

    return (
        <div className={_cs(styles.framework, className)}>
            <div className={styles.leftContainer}>
                <div className={styles.filters}>
                    <SelectInput
                        inputSectionClassName={styles.relatedToMeSelect}
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
                        data={frameworks}
                        keySelector={frameworkKeySelector}
                        renderer={Item}
                        filtered={isFiltered(value)}
                        rendererParams={frameworksRendererParams}
                        messageShown
                        messageIconShown
                    />
                    {(
                        totalFrameworksCount > 0
                        && (frameworkList.length < totalFrameworksCount)
                    ) && (
                        <Button
                            className={styles.showMoreButton}
                            variant="action"
                            name={undefined}
                            onClick={handleShowMoreButtonClick}
                            disabled={frameworksGetPending}
                            actions={(
                                <IoChevronForward />
                            )}
                        >
                            Show More
                        </Button>
                    )}
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
                        onClonedFrameworkClick={setSelectedFramework}
                        className={styles.selectedFrameworkDetails}
                        onFrameworkCreate={handleNewFrameworkAddSuccess}
                    />
                ) : (
                    <div className={styles.noFrameworkSelected}>
                        <Message
                            icon={
                                <Kraken variant="sleep" />
                            }
                            message={_ts('projectEdit', 'noFrameworkSelectedMessage')}
                        />
                    </div>
                )}
            </Container>
        </div>
    );
}

export default ProjectFramework;
