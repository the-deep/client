import React, { useCallback } from 'react';
import { GrDrag } from 'react-icons/gr';
import {
    Modal,
    Element,
    TextOutput,
    DateOutput,
    QuickActionButton,
} from '@the-deep/deep-ui';
import { gql, useMutation } from '@apollo/client';

import SortableList, { type Attributes, type Listeners } from '#components/SortableList';
import { reorder } from '#utils/common';
import {
    ReorderPinnedProjectsMutation,
    ReorderPinnedProjectsMutationVariables,
} from '#generated/types';

import { type PinnedProjectDetailType } from '..';
import styles from './styles.css';

const REORDER_PINNED_PROJECTS = gql`
    mutation ReorderPinnedProjects(
        $projects: [UserPinnedProjectReOrderInputType!],
    ){
        reorderPinnedProjects(items: $projects) {
            errors
            ok
        }
    }
`;

interface ItemProps {
    title: string;
    date: string;
    index: number;
    attributes?: Attributes;
    listeners?: Listeners;
}

function ListItem(props: ItemProps) {
    const {
        title,
        date,
        index,
        attributes,
        listeners,
    } = props;

    return (
        <Element
            className={styles.item}
            icons={(
                <QuickActionButton
                    name={index}
                    title="Reorder projects"
                    {...attributes}
                    {...listeners}
                >
                    <GrDrag />
                </QuickActionButton>
            )}
        >
            <TextOutput
                value={title}
                description={<DateOutput value={date} />}
                block
                spacing="none"
            />
        </Element>
    );
}

const keySelector = (p: PinnedProjectDetailType) => p.clientId;

interface Props {
    onModalClose: () => void;
    pinnedProjects: PinnedProjectDetailType[];
    setPinnedProjects: React.Dispatch<React.SetStateAction<PinnedProjectDetailType[] | undefined>>;
    onSuccess: () => void;
}

function ProjectReorderModal(props: Props) {
    const {
        onModalClose,
        pinnedProjects,
        setPinnedProjects,
        onSuccess,
    } = props;

    const [
        reorderProjects,
    ] = useMutation<ReorderPinnedProjectsMutation, ReorderPinnedProjectsMutationVariables>(
        REORDER_PINNED_PROJECTS,
        {
            onCompleted: (response) => {
                if (response?.reorderPinnedProjects?.ok) {
                    onSuccess();
                }
            },
        },
    );

    const handleProjectsOrderChange = useCallback((newProjectsOrder: PinnedProjectDetailType[]) => {
        const orderedProjects = reorder(newProjectsOrder);
        setPinnedProjects(orderedProjects);

        const orderedProjectsSafe = orderedProjects.map((project) => ({
            order: project.order,
            id: project.id,
        }));

        reorderProjects({
            variables: {
                projects: orderedProjectsSafe,
            },
        });
    }, [
        reorderProjects,
        setPinnedProjects,
    ]);

    const rendererParams = useCallback(
        (
            _: string,
            datum: PinnedProjectDetailType,
            index: number,
        ) => ({
            title: datum.project.title,
            date: datum.project.createdAt,
            onOrderChange: handleProjectsOrderChange,
            index,
        }), [
            handleProjectsOrderChange,
        ],
    );

    return (
        <Modal
            size="small"
            onCloseButtonClick={onModalClose}
            heading="Re-order pinned projects"
        >
            <SortableList
                name="projects"
                data={pinnedProjects}
                className={styles.projects}
                onChange={handleProjectsOrderChange}
                keySelector={keySelector}
                renderer={ListItem}
                rendererParams={rendererParams}
                direction="vertical"
                emptyMessage={null}
                emptyIcon={null}
            />
        </Modal>
    );
}

export default ProjectReorderModal;
