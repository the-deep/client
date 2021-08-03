import React, { useCallback } from 'react';
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
} from '#newComponents/ui/SortableList';
import { genericMemo } from '#utils/safeCommon';

import styles from './styles.scss';

interface Node {
    selected: boolean;
    key: string;
    title: string;
    nodes?: Node[];
}

const keySelector = (d: Node) => d.key;

// Set selected state for a particular node where selected = true/false
// and do it for all the children.
function setChildrenSelectionStatus(node: Node, selected: boolean): Node {
    if (node.nodes) {
        return ({
            ...node,
            nodes: node.nodes.map(n => setChildrenSelectionStatus(n, selected)),
            selected,
        });
    }
    return ({
        ...node,
        selected,
    });
}

interface SortableNodeProps {
    attributes?: Attributes;
    listeners?: Listeners;
    index: number;
    node: Node;
    onCheckboxClick: (newVal: boolean, key: string) => void;
    onChildrenChange: (children: Node[], key: string) => void;
}

function SortableNode(props: SortableNodeProps) {
    const {
        index,
        node: {
            selected,
            key,
            nodes,
            title,
        },
        onCheckboxClick,
        onChildrenChange,
        attributes,
        listeners,
    } = props;

    const selectedNodesLength = nodes?.filter(n => n.selected)?.length ?? 0;
    const totalNodesLength = nodes?.length ?? 0;
    const indeterminate = selectedNodesLength !== 0 && selectedNodesLength !== totalNodesLength;

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
                    <Checkbox
                        name={key}
                        value={selected}
                        className={styles.checkbox}
                        onChange={onCheckboxClick}
                        indeterminate={indeterminate}
                    />
                </>
            )}
            heading={title}
            headingSize="extraSmall"
            contentClassName={styles.sortableContent}
            sub
            expansionTriggerArea="arrow"
            disabled={!nodes || nodes.length === 0}
        >
            {nodes && (
                <TreeSelection
                    name={key}
                    value={nodes}
                    onChange={onChildrenChange}
                />
            )}
        </ExpandableContainer>
    );
}

const MemoizedSortableNode = genericMemo(SortableNode);

interface Props<N extends string> {
    className?: string;
    name: N;
    value: Node[];
    onChange: (newVal: Node[], name: N) => void;
    direction?: 'vertical' | 'horizontal';
}

function TreeSelection<N extends string>(props: Props<N>) {
    const {
        name,
        value,
        onChange,
        className,
        direction = 'vertical',
    } = props;

    // Handle toggling the state of checkbox including its children
    const handleCheckboxChange = useCallback((newValue: boolean, key: string) => {
        if (!onChange) {
            return;
        }
        const tempValue = [...value];

        const index = tempValue.findIndex(v => v.key === key);
        tempValue[index] = setChildrenSelectionStatus(tempValue[index], newValue);

        onChange(tempValue, name);
    }, [onChange, value, name]);

    const handleChildrenChange = useCallback((nodes: Node[], key: string) => {
        if (!onChange) {
            return;
        }

        const tempValue = [...value];
        const index = tempValue.findIndex(v => v.key === key);
        const selected = nodes.some(n => n.selected);

        tempValue[index] = {
            ...tempValue[index],
            selected,
            nodes,
        };

        onChange(tempValue, name);
    }, [onChange, value, name]);

    const sortableNodeParams = useCallback((key: string, data, index) => ({
        index,
        onCheckboxClick: handleCheckboxChange,
        onChildrenChange: handleChildrenChange,
        node: data,
    }), [handleCheckboxChange, handleChildrenChange]);

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
        />
    );
}

export default genericMemo(TreeSelection);
