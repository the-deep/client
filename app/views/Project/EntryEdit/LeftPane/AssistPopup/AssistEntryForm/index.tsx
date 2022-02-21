import React, { useCallback, useState, useMemo } from 'react';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';
import {
    useForm,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    Button,
    Container,
} from '@the-deep/deep-ui';

import { GeoArea } from '#components/GeoMultiSelectInput';
import EntryInput from '#components/entry/EntryInput';

import {
    getEntrySchema,
    PartialEntryType,
} from '../../../schema';
import {
    Framework,
    Widget,
} from '../../../types';

import styles from './styles.css';

interface Props {
    className?: string;
    frameworkDetails: Framework;
    entry: PartialEntryType;
    leadId: string;
    allWidgets: Widget[];
    onEntryCreate: (newEntry: PartialEntryType) => void;
}

function AssistEntryForm(props: Props) {
    const {
        className,
        entry,
        leadId,
        allWidgets,
        frameworkDetails,
        onEntryCreate,
    } = props;

    const schema = useMemo(
        () => {
            const widgetsMapping = listToMap(
                allWidgets,
                (item) => item.id,
                (item) => item,
            );
            return getEntrySchema(widgetsMapping);
        },
        [allWidgets],
    );

    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<GeoArea[] | undefined | null>(undefined);

    const {
        setValue,
        value,
        validate,
        setError,
        error,
    } = useForm(schema, entry);

    const handleSaveButtonClick = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (entryData) => {
                onEntryCreate(entryData);
            },
        );
        submit();
    }, [
        onEntryCreate,
        validate,
        setError,
    ]);

    return (
        <Container
            className={_cs(className, styles.assistEntryForm)}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleSaveButtonClick}
                    variant="primary"
                >
                    Save
                </Button>
            )}
        >
            <EntryInput
                leadId={leadId}
                name={undefined}
                error={error}
                value={value}
                onChange={setValue}
                primaryTagging={frameworkDetails.primaryTagging}
                secondaryTagging={frameworkDetails.secondaryTagging}
                entryImage={undefined}
                onAddButtonClick={undefined}
                geoAreaOptions={geoAreaOptions}
                onGeoAreaOptionsChange={setGeoAreaOptions}
                allWidgets={allWidgets}
                compact
            />
        </Container>
    );
}

export default AssistEntryForm;
