import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import _ts from '#ts';

import DangerButton from '#rsca/Button/DangerButton';
import DropZoneTwo from '#rsci/DropZoneTwo';
import Cloak from '#components/general/Cloak';

import EntryPreview from '../../../EntryPreview';
import styles from './styles.scss';

const LabelItem = (props) => {
    const {
        labelId,
        title: labelTitle,
        color: labelColor,

        selected,

        entryKey,
        entryType,
        image,
        excerpt,
        order: entryOrder,
        tabularFieldId,
        tabularField,

        disabled,
        entryGroupKey,
        entryGroupServerId,
        onSelectionSet,
        onSelectionClear,
        className: classNameFromProps,
    } = props;

    const style = {
        color: labelColor || 'var(--color-text)',
    };

    const shouldHideEntryGroupEdit = useCallback(
        ({ entryPermissions }) => (
            !entryPermissions.modify && !!entryGroupServerId
        ),
        [entryGroupServerId],
    );

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
            if (entryKey === data.entryKey) {
                return;
            }
            onSelectionSet({
                entryGroupKey,
                selection: {
                    entryId: data.entryId,
                    entryClientId: data.entryKey,
                    labelId,
                },
            });
        },
        [entryKey, entryGroupKey, labelId, onSelectionSet],
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
                                title={_ts('editEntry.group', 'clearEntryButtonTitle')}
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

    entryType: PropTypes.string,
    image: PropTypes.string,
    excerpt: PropTypes.string,
    order: PropTypes.number,
    tabularFieldId: PropTypes.number,
    tabularField: PropTypes.object, // eslint-disable-line react/forbid-prop-types

    disabled: PropTypes.bool,
    entryGroupKey: PropTypes.string.isRequired,
    onSelectionSet: PropTypes.func.isRequired,
    onSelectionClear: PropTypes.func.isRequired,
    className: PropTypes.string,

    entryGroupServerId: PropTypes.number,
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
    entryType: undefined,
    order: undefined,
    entryGroupServerId: undefined,
};

export default LabelItem;
