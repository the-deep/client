import React, { useMemo, useCallback } from 'react';
import {
    listToMap,
} from '@togglecorp/fujs';
import {
    QuickActionButton,
    useBooleanState,
    SelectInput,
} from '@the-deep/deep-ui';
import {
    IoCloseOutline,
    IoAdd,
} from 'react-icons/io5';

import {
    PredictionTag,
    CategoricalMappingsItem,
} from '#types/newAnalyticalFramework';

const predictionKeySelector = (prediction: PredictionTag) => prediction.id;
const predictionLabelSelector = (prediction: PredictionTag) => prediction.name;
const predictionGroupKeySelector = (prediction: PredictionTag) => prediction.group ?? 'Misc';

interface Props {
    disabled?: boolean;
    existingMappings: CategoricalMappingsItem[] | undefined;
    predictionTags: PredictionTag[] | undefined;
    onTagSelect: (tag: string | undefined) => void;
}

function AddFrameworkTagButton(props: Props) {
    const {
        disabled,
        existingMappings,
        predictionTags,
        onTagSelect,
    } = props;

    const [addInputShown, showAddInput, hideAddInput] = useBooleanState(false);

    const handleTagSelect = useCallback((newTag: string | undefined) => {
        onTagSelect(newTag);
        hideAddInput();
    }, [
        hideAddInput,
        onTagSelect,
    ]);

    const existingMappingsMap = useMemo(() => (
        listToMap(
            existingMappings,
            (d) => d.tag,
            () => true,
        )
    ), [existingMappings]);

    const filteredOptions = useMemo(() => (
        predictionTags?.filter(
            (tag) => !existingMappingsMap?.[tag.id],
        )
    ), [
        predictionTags,
        existingMappingsMap,
    ]);

    if (disabled) {
        return null;
    }

    if (addInputShown) {
        return (
            <>
                <SelectInput
                    value={undefined}
                    variant="general"
                    name={undefined}
                    options={filteredOptions}
                    onChange={handleTagSelect}
                    keySelector={predictionKeySelector}
                    labelSelector={predictionLabelSelector}
                    groupKeySelector={predictionGroupKeySelector}
                    groupLabelSelector={predictionGroupKeySelector}
                    grouped
                />
                <QuickActionButton
                    name={undefined}
                    onClick={hideAddInput}
                >
                    <IoCloseOutline />
                </QuickActionButton>
            </>
        );
    }

    return (
        <QuickActionButton
            name={undefined}
            onClick={showAddInput}
        >
            <IoAdd />
        </QuickActionButton>
    );
}

export default AddFrameworkTagButton;
