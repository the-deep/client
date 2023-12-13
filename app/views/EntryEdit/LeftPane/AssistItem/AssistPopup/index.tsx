import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Kraken,
    Container,
    Message,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    Error,
} from '@togglecorp/toggle-form';

import EntryInput from '#components/entry/EntryInput';
import { GeoArea } from '#components/GeoMultiSelectInput';
import { WidgetHint } from '#types/newAnalyticalFramework';
import { Framework } from '#components/entry/types';
import {
    PartialEntryType,
    PartialAttributeType,
} from '#components/entry/schema';

import styles from './styles.css';

interface Props<NAME extends string | number | undefined> {
    className?: string;
    entryInputClassName?: string;
    frameworkDetails: Framework;
    leadId: string;
    value: PartialEntryType;
    onChange: (val: SetValueArg<PartialEntryType>, name: NAME) => void;
    error: Error<PartialEntryType> | undefined;
    variant?: 'normal' | 'compact' | 'nlp';
    // NOTE: Normal entry creation refers to entry created without use of
    // recommendations
    geoAreaOptions: GeoArea[] | undefined | null;
    onGeoAreaOptionsChange: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    predictionsLoading?: boolean;
    hints: WidgetHint[] | undefined;
    recommendations: PartialAttributeType[] | undefined;
    predictionsErrored: boolean;
    name: NAME;
    messageText: string | undefined;
    excerptShown?: boolean;
    displayHorizontally?: boolean;

    footerActions: React.ReactNode;
}

function AssistPopup<NAME extends string | number | undefined>(props: Props<NAME>) {
    const {
        className,
        entryInputClassName,
        variant = 'nlp',
        leadId,
        value,
        onChange,
        name,
        error,
        frameworkDetails,
        geoAreaOptions,
        onGeoAreaOptionsChange,
        predictionsLoading,
        hints,
        predictionsErrored,
        messageText,
        recommendations,
        excerptShown = false,
        displayHorizontally = false,
        footerActions,
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
        <Container
            className={_cs(className, styles.assistPopup)}
            // heading="Assisted Tagging"
            headingSize="extraSmall"
            spacing="compact"
            footerQuickActions={footerActions}
            contentClassName={styles.body}
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
                    className={_cs(styles.entryInput, entryInputClassName)}
                    leadId={leadId}
                    name={name}
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
                    recommendations={recommendations}
                    emptyValueHidden
                    addButtonHidden
                    variant={variant}
                    excerptShown={excerptShown}
                    displayHorizontally={displayHorizontally}
                />
            )}
        </Container>
    );
}

export default AssistPopup;
