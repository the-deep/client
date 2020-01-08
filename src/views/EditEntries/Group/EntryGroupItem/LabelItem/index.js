import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import DropZoneTwo from '#rsci/DropZoneTwo';
import Cloak from '#components/general/Cloak';

import _cs from '#cs';

import EntryPreview from '../../../EntryPreview';
import styles from './styles.scss';

const LabelItem = (props) => {
    const {
        labelId,
        title: labelTitle,
        color: labelColor,

        selected,

        entryType,
        image,
        excerpt,
        order: entryOrder,
        tabularFieldId,
        tabularField,

        disabled,
        entryGroupKey,
        onSelectionSet,
        onSelectionClear,
        shouldHideEntryGroupEdit,
        className: classNameFromProps,
    } = props;

    const style = {
        color: labelColor || 'var(--color-text)',
    };

    const handleSelectionClear = useCallback(
        () => {
            onSelectionClear({
                entryGroupKey,
                labelId,
            });
        },
        [entryGroupKey, labelId, onSelectionClear],
    );

    const handleSelectionSet = useCallback(
        (data) => {
            onSelectionSet({
                entryGroupKey,
                selection: {
                    entryId: data.entryId,
                    entryClientId: data.entryKey,
                    labelId,
                },
            });
        },
        [entryGroupKey, labelId, onSelectionSet],
    );

    const className = _cs(
        classNameFromProps,
        styles.labelItem,
    );

    return (
        <div className={className}>
            <div className={styles.previewTitle}>
                <h5
                    className={styles.heading}
                    style={style}
                >
                    {labelTitle}
                </h5>
                { selected && (
                    <Cloak
                        hide={shouldHideEntryGroupEdit}
                        render={(
                            <DangerButton
                                className={styles.button}
                                transparent
                                // FIXME: uses strings
                                title="Clear entry"
                                iconName="close"
                                disabled={disabled}
                                onClick={handleSelectionClear}
                            />
                        )}
                    />
                )}
            </div>
            <Cloak
                disable={shouldHideEntryGroupEdit}
                render={(
                    <DropZoneTwo
                        className={styles.entryPreview}
                        disabled={disabled}
                        onDrop={handleSelectionSet}
                    >
                        {selected && (
                            <EntryPreview
                                entryType={entryType}
                                image={image}
                                excerpt={excerpt}
                                order={entryOrder}
                                tabularFieldId={tabularFieldId}
                                tabularField={tabularField}
                            />
                        )}
                    </DropZoneTwo>
                )}
            />
        </div>
    );
};
LabelItem.propTypes = {
    labelId: PropTypes.number.isRequired,
    title: PropTypes.string,
    color: PropTypes.string,

    selected: PropTypes.bool,

    entryType: PropTypes.string.isRequired,
    image: PropTypes.string,
    excerpt: PropTypes.string,
    order: PropTypes.number.isRequired,
    tabularFieldId: PropTypes.number,
    tabularField: PropTypes.object, // eslint-disable-line react/forbid-prop-types

    disabled: PropTypes.bool,
    entryGroupKey: PropTypes.string.isRequired,
    onSelectionSet: PropTypes.func.isRequired,
    onSelectionClear: PropTypes.func.isRequired,
    shouldHideEntryGroupEdit: PropTypes.func.isRequired,
    className: PropTypes.string,
};
LabelItem.defaultProps = {
    className: undefined,
    title: undefined,
    color: undefined,
    selected: false,
    disabled: false,
    image: undefined,
    excerpt: undefined,
    tabularFieldId: undefined,
    tabularField: undefined,
};

export default LabelItem;
