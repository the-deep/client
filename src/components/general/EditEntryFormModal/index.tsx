import React from 'react';
import { detachedFaram, Schema, ComputeSchema } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import WidgetForm from '#components/general/WidgetForm';

import { FrameworkFields } from '#types/framework';
import { Entry } from '#types/entry';

import { FgRestBuilder } from '#rsu/rest';
import {
    createUrlForEntryEdit,
    createParamsForEntryEdit,
} from '#rest';

import {
    getSchemaForWidget,
    getComputeSchemaForWidget,
} from '#utils/widget';
import _ts from '#ts';

import styles from './styles.scss';

interface EditEntryFormModalProps {
    className?: string;
    framework: FrameworkFields;
    entry: Entry;
    onEditSuccess: (newEntry: Entry) => void;
    onClose: () => void;
}

function EditEntryFormModal(props: EditEntryFormModalProps) {
    const {
        className,
        framework,
        entry,
        onClose,
        onEditSuccess,
    } = props;

    const [value, setValue] = React.useState(entry);
    const [faramErrors, setFaramErrors] = React.useState({});
    const [entrySaveFailed, setEntrySaveFailed] = React.useState(false);
    const [entrySavePending, setEntrySavePending] = React.useState(false);
    const { widgets } = framework;

    const [schema, computeSchema] = React.useMemo(() => {
        const widgetComputeSchema: ComputeSchema = {
            fields: {},
        };

        const widgetSchema: Schema = {
            fields: {},
        };

        widgets.forEach((widget) => {
            const computeSchemaForWidget = getComputeSchemaForWidget(widget, widgets);

            if (computeSchemaForWidget) {
                const cs: ComputeSchema = {
                    fields: {
                        data: {
                            fields: {
                                value: computeSchemaForWidget,
                            },
                        },
                    },
                };
                widgetComputeSchema.fields[widget.id] = cs;
            }

            widgetSchema.fields[widget.id] = {
                fields: {
                    id: [],
                    data: getSchemaForWidget(widget),
                },
            };
        });

        return [
            widgetSchema,
            widgetComputeSchema,
        ];
    }, [widgets]);


    const handleSaveButtonClick = React.useCallback(() => {
        detachedFaram({
            value: value.attributes,
            schema,
            onValidationFailure: (errors: Record<string, unknown>) => { setFaramErrors(errors); },
            onValidationSuccess: (values: Entry['attributes']) => {
                const request = new FgRestBuilder()
                    .url(createUrlForEntryEdit(value.id))
                    .params(() => createParamsForEntryEdit({
                        ...value,
                        attributes: values,
                    }))
                    .success((response: Entry) => {
                        setEntrySaveFailed(false);
                        onEditSuccess(response);
                        setEntrySavePending(false);
                        onClose();
                    })
                    .failure(() => {
                        // TODO: show error message properly
                        console.error('Entry save error');
                        setEntrySaveFailed(true);
                        setEntrySavePending(false);
                    })
                    .fatal(() => {
                        // TODO: show error message properly
                        console.error('Entry save error');
                        setEntrySaveFailed(true);
                        setEntrySavePending(false);
                    })
                    .build();
                request.start();
                setEntrySavePending(true);
            },
        });
    }, [value, schema, onClose, setFaramErrors, setEntrySavePending, onEditSuccess]);

    const handleCancelButtonClick = React.useCallback(() => {
        onClose();
    }, [onClose]);

    const handleAttributesChange = React.useCallback((values, errors) => {
        setValue(oldEntry => ({ ...oldEntry, attributes: values }));
        setFaramErrors(errors);
    }, [setValue, setFaramErrors]);

    const handleExcerptChange = React.useCallback((excerptData) => {
        const {
            type,
            value: excerptValue,
        } = excerptData;

        const excerpt = type === 'excerpt' ? excerptValue : undefined;
        const image = type === 'image' ? excerptValue : undefined;
        const tabularField = type === 'dataSeries' ? excerptValue : undefined;

        setValue(oldEntry => ({
            ...oldEntry,
            excerpt,
            image,
            tabularField,
        }));
    }, [setValue]);

    return (
        <Modal className={_cs(className, styles.editEntryModal)}>
            <ModalHeader title={_ts('components.entryEditButton', 'editModalHeading')} />
            <ModalBody className={styles.body}>
                { entrySaveFailed && (
                    /* FIXME: strings */
                    <div className={styles.error}>
                        Failed to save entry
                    </div>
                )}
                <WidgetForm
                    value={value}
                    onAttributesChange={handleAttributesChange}
                    onExcerptChange={handleExcerptChange}
                    framework={framework}
                    mode="list"
                    schema={schema}
                    error={faramErrors}
                    computeSchema={computeSchema}
                    disabled={entrySavePending}
                    className={styles.listWidgets}
                />
                <WidgetForm
                    value={value}
                    onAttributesChange={handleAttributesChange}
                    onExcerptChange={handleExcerptChange}
                    framework={framework}
                    mode="overview"
                    schema={schema}
                    error={faramErrors}
                    computeSchema={computeSchema}
                    disabled={entrySavePending}
                />
            </ModalBody>
            <ModalFooter>
                <Button
                    onClick={handleCancelButtonClick}
                    disabled={entrySavePending}
                >
                    {_ts('components.entryEditButton', 'cancelButtonLabel')}
                </Button>
                <PrimaryButton
                    onClick={handleSaveButtonClick}
                    disabled={entrySavePending}
                    pending={entrySavePending}
                >
                    {_ts('components.entryEditButton', 'saveButtonLabel')}
                </PrimaryButton>
            </ModalFooter>
        </Modal>
    );
}

export default EditEntryFormModal;
