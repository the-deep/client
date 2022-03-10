import React, { useMemo } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    Modal,
    Kraken,
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
    predictionsLoading?: boolean;
    hints: WidgetHint[] | undefined;
    predictionsErrored: boolean;
    messageText: string | undefined;
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
        predictionsLoading,
        hints,
        predictionsErrored,
        messageText,
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

    const isMessageShown = predictionsLoading || predictionsErrored || !!messageText;

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
            bodyClassName={styles.body}
        >
            {isMessageShown ? (
                <Message
                    className={styles.message}
                    pendingMessage="DEEP is analyzing your text."
                    pending={predictionsLoading}
                    errored={predictionsErrored}
                    message={messageText}
                    icon={(
                        <Kraken
                            variant="icecream"
                            size="large"
                        />
                    )}
                    erroredEmptyIcon={(
                        <Kraken
                            variant="crutches"
                            size="large"
                        />
                    )}
                    erroredEmptyMessage="DEEP was unable to provide predictions."
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
