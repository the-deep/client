import React, { useMemo } from 'react';
import {
    Container,
} from '@the-deep/deep-ui';
import {
    UserType,
} from '#generated/types';
import EntryInput, { EntryInputProps } from '#components/entry/EntryInput';
import EntryComments from '#components/entryReview/EntryComments';
import EntryControl from '#components/entryReview/EntryControl';
import EntryVerification from '#components/entryReview/EntryVerification';

interface Props<T extends string | number | undefined> extends EntryInputProps<T> {
    entryInputClassName?: string;
    onEntryStatusChange: () => void;
    entryId: string | undefined;
    projectId: string | undefined;
    controlled: boolean | undefined | null;
    verifiedBy: Pick<UserType, 'id'>[] | undefined | null;
}

function EntryReviewItem<T extends string | number | undefined>(props: Props<T>) {
    const {
        className,
        entryId,
        projectId,
        entryInputClassName,
        verifiedBy,
        controlled,
        onEntryStatusChange,
        ...otherProps
    } = props;

    const verifiedByIds = useMemo(() => (
        verifiedBy?.map((v) => +v.id) ?? []
    ), [verifiedBy]);

    return (
        <Container
            className={className}
            headerIcons={entryId && projectId && (
                <>
                    <EntryComments
                    // FIXME: Remove cast after entry comments
                    // is switched to gql
                        entryId={+entryId}
                        projectId={+projectId}
                    />
                    <EntryVerification
                    // FIXME: Remove cast after entry comments
                    // is switched to gql
                        entryId={+entryId}
                        projectId={+projectId}
                        verifiedBy={verifiedByIds}
                        onVerificationChange={onEntryStatusChange}
                    />
                    <EntryControl
                    // FIXME: Remove cast after entry comments
                    // is switched to gql
                        entryId={+entryId}
                        projectId={+projectId}
                        value={!!controlled}
                        onChange={onEntryStatusChange}
                    />
                </>
            )}
        >
            <EntryInput
                className={entryInputClassName}
                {...otherProps}
            />
        </Container>
    );
}

export default EntryReviewItem;
