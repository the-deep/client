import React, { useMemo } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    Modal,
    Message,
    Button,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    Error,
} from '@togglecorp/toggle-form';

import EntryInput from '#components/entry/EntryInput';
import { GeoArea } from '#components/GeoMultiSelectInput';
import {
    WidgetHint,
} from '#types/newAnalyticalFramework';
import {
    Framework,
} from '../../types';
import {
    PartialEntryType,
} from '../../schema';

import styles from './styles.css';

interface Props {
    className?: string;
    frameworkDetails: Framework;
    leadId: string;
    value: PartialEntryType;
    onChange: (val: SetValueArg<PartialEntryType>, name: undefined) => void;
    error: Error<PartialEntryType> | undefined;
    onEntryCreateButtonClick: () => void;
    geoAreaOptions: GeoArea[] | undefined | null;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    onCloseButtonClick: () => void;
    loadingPredictions?: boolean;
    hints: WidgetHint[] | undefined;
}

function AssistPopup(props: Props) {
    const {
        className,
        onCloseButtonClick,
        leadId,
        value,
        onChange,
        error,
        frameworkDetails,
        onEntryCreateButtonClick,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        loadingPredictions,
        hints,
    } = props;

    const allWidgets = useMemo(() => {
        const widgetsFromPrimary = frameworkDetails.primaryTagging?.flatMap(
            (item) => (item.widgets ?? []),
        ) ?? [];
        const widgetsFromSecondary = frameworkDetails.secondaryTagging ?? [];
        const widgets = [
            ...widgetsFromPrimary,
            ...widgetsFromSecondary,
        ];
        return widgets;
    }, [
        frameworkDetails,
    ]);

    const isMessageShown = loadingPredictions;

    return (
        <Modal
            className={_cs(className, styles.assistPopup)}
            heading="Assisted Tagging"
            headingSize="extraSmall"
            onCloseButtonClick={onCloseButtonClick}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={onEntryCreateButtonClick}
                    disabled={isMessageShown}
                >
                    Create Entry
                </Button>
            )}
        >
            {isMessageShown ? (
                <Message
                    pendingMessage="DEEP is analyzing your text."
                    pending
                />
            ) : (
                <EntryInput
                    leadId={leadId}
                    name={undefined}
                    error={error}
                    value={value}
                    onChange={onChange}
                    primaryTagging={frameworkDetails.primaryTagging}
                    secondaryTagging={frameworkDetails.secondaryTagging}
                    entryImage={undefined}
                    onAddButtonClick={undefined}
                    geoAreaOptions={geoAreaOptions}
                    onGeoAreaOptionsChange={onGeoAreaOptionsChange}
                    allWidgets={allWidgets}
                    widgetsHints={hints}
                    emptyValueHidden
                    addButtonHidden
                    compact
                />
            )}
        </Modal>
    );
}

export default AssistPopup;
