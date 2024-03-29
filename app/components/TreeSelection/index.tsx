import React, { useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ExpandableContainer,
    QuickActionButton,
    Checkbox,
} from '@the-deep/deep-ui';
import { GrDrag } from 'react-icons/gr';

import SortableList, {
    Attributes,
    Listeners,
} from '#components/SortableList';
import { genericMemo } from '#utils/common';

import styles from './styles.css';

interface Node {
    selected: boolean;
    key: string;
    title: string;
    nodes?: this[] | undefined;
}

const keySelector = <T extends Node>(d: T) => d.key;

// Set selected state for a particular node where selected = true/false
// and do it for all the children.
function setChildrenSelectionStatus<T extends Node>(node: T, selected: boolean): T {
    return ({
        ...node,
        selected,
        nodes: node.nodes?.map((n) => setChildrenSelectionStatus(n, selected)),
    });
}

interface SortableNodeProps<T extends Node> {
    attributes?: Attributes;
    listeners?: Listeners;
    index: number;
    node: T;
    onCheckboxClick: (newVal: boolean, key: string) => void;
    onChildrenChange: (children: T[], key: string) => void;
    checkboxHidden?: boolean;
    labelSelector?: (val: T) => React.ReactNode;
}

function SortableNode<T extends Node>(props: SortableNodeProps<T>) {
    const {
        index,
        node,
        onCheckboxClick,
        onChildrenChange,
        attributes,
        listeners,
        checkboxHidden,
        labelSelector,
    } = props;

    const {
        selected,
        key,
        nodes,
        title,
    } = node;

    const selectedNodesLength = nodes?.filter((n) => n.selected)?.length ?? 0;
    const totalNodesLength = nodes?.length ?? 0;
    const disableExpansionButton = !nodes || nodes.length === 0;
    const indeterminate = selectedNodesLength !== 0 && selectedNodesLength !== totalNodesLength;

    const label = useMemo(() => (
        labelSelector ? labelSelector(node) : title
    ), [
        labelSelector,
        node,
        title,
    ]);

    return (
        <ExpandableContainer
            className={styles.sortableNode}
            headerIcons={(
                <>
                    <QuickActionButton
                        name={index}
                        // FIXME: use translation
                        title="Drag"
                        className={styles.dragHandle}
                        variant="action"
                        {...attributes}
                        {...listeners}
                    >
                        <GrDrag />
                    </QuickActionButton>
                    {!checkboxHidden && (
                        <Checkbox
                            name={key}
                            value={selected}
                            className={styles.checkbox}
                            onChange={onCheckboxClick}
                            indeterminate={indeterminate}
                        />
                    )}
                </>
            )}
            heading={label}
            headingSize="extraSmall"
            spacing="compact"
            contentClassName={styles.sortableContent}
            headerClassName={styles.header}
            headingContainerClassName={styles.headingContainer}
            headingClassName={styles.heading}
            expansionTriggerArea="arrow"
            expansionButtonClassName={(
                disableExpansionButton
                    ? styles.expansionButtonHidden
                    : undefined
            )}
            disabled={disableExpansionButton}
        >
            {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
            <TreeSelection
                className={styles.nestedTree}
                name={key}
                value={nodes}
                onChange={onChildrenChange}
                checkboxHidden={checkboxHidden}
            />
        </ExpandableContainer>
    );
}

const MemoizedSortableNode = genericMemo(SortableNode);

interface Props<N extends string, T extends Node> {
    className?: string;
    name: N;
    value?: T[] | undefined;
    onChange: (newVal: T[], name: N) => void;
    direction?: 'vertical' | 'horizontal';
    labelSelector?: (val: T) => React.ReactNode;
    checkboxHidden?: boolean;
}

const emptyArray: unknown[] = [];

function TreeSelection<N extends string, T extends Node>(props: Props<N, T>) {
    const {
        name,
        value = emptyArray as T[],
        onChange,
        className,
        direction = 'vertical',
        checkboxHidden,
        labelSelector,
    } = props;

    // Handle toggling the state of checkbox including its children
    const handleCheckboxChange = useCallback((newValue: boolean, key: string) => {
        if (!onChange) {
            return;
        }
        const tempValue = [...value];

        const index = tempValue.findIndex((v) => v.key === key);
        tempValue[index] = setChildrenSelectionStatus(tempValue[index], newValue);

        onChange(tempValue, name);
    }, [onChange, value, name]);

    const handleChildrenChange = useCallback((nodes: T[], key: string) => {
        if (!onChange) {
            return;
        }

        const tempValue = [...value];
        const index = tempValue.findIndex((v) => v.key === key);
        const selected = nodes.some((n) => n.selected);

        tempValue[index] = {
            ...tempValue[index],
            selected,
            nodes,
        };

        onChange(tempValue, name);
    }, [onChange, value, name]);

    const sortableNodeParams = useCallback((_: string, data: T, index: number) => ({
        index,
        onCheckboxClick: handleCheckboxChange,
        onChildrenChange: handleChildrenChange,
        node: data,
        checkboxHidden,
        labelSelector,
    }), [
        handleCheckboxChange,
        handleChildrenChange,
        checkboxHidden,
        labelSelector,
    ]);

    return (
        <SortableList
            className={_cs(className, styles.treeSelection)}
            name={name}
            data={value}
            onChange={onChange}
            keySelector={keySelector}
            renderer={MemoizedSortableNode}
            direction={direction}
            rendererParams={sortableNodeParams}
            emptyMessage={null}
            emptyIcon={null}
        />
    );
}

export default genericMemo(TreeSelection);
