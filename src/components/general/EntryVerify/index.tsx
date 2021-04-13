import React, { useCallback, useEffect } from 'react';
import { _cs } from '@togglecorp/fujs';

import Cloak from '#components/general/Cloak';
import Checkbox from '#rsci/Checkbox';

import {
    AddRequestProps,
    Requests,
    Entry,
} from '#typings';

import {
    RequestClient,
    methods,
} from '#request';
import {
    notifyOnFailure,
    notifyOnFatal,
} from '#utils/requestNotify';

import _ts from '#ts';
import notify from '#notify';

import styles from './styles.scss';

interface ComponentProps {
    title?: string;
    entryId: number;
    leadId: number;
    versionId: number;
    value: boolean;
    className?: string;
    onPendingChange?: (pending: boolean) => void;
    handleEntryVerify?: (entry: Entry) => void;
    disabled?: boolean;
}

interface Params {
    verify: boolean;
}

const shouldHideEntryEdit = ({ entryPermissions }: {
    entryPermissions: {
        modify: boolean;
    };
}) => !entryPermissions.modify;


type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    setEntryVerificationRequest: {
        url: ({
            props: { entryId },
            params,
        }) => ((params && params.verify) ? `/entries/${entryId}/verify/` : `/entries/${entryId}/unverify/`),
        method: methods.POST,
        body: ({
            props: {
                versionId,
            } = {},
        }) => ({
            versionId,
        }),
        onSuccess: ({ props, response }) => {
            const { handleEntryVerify } = props;

            if (handleEntryVerify) {
                handleEntryVerify(response as Entry);
            }
            notify.send({
                title: _ts('editEntry', 'entryVerificationStatusChange'),
                type: notify.type.SUCCESS,
                message: _ts('editEntry', 'entryVerificationStatusChangeSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        onFailure: notifyOnFailure(_ts('editEntry', 'entryVerifyFailure')),
        onFatal: notifyOnFatal(_ts('editEntry', 'entryVerifyFailure')),
    },
};

function EntryVerify(props: Props) {
    const {
        title,
        className,
        value = false,
        requests: {
            setEntryVerificationRequest: {
                do: triggerEntryVerificationChange,
                pending,
            },
        },
        onPendingChange,
        disabled,
    } = props;

    const handleItemSelect = useCallback((newValue: boolean) => {
        triggerEntryVerificationChange({
            verify: newValue,
        });
    }, [triggerEntryVerificationChange]);

    useEffect(() => {
        if (onPendingChange) {
            onPendingChange(pending);
        }
    }, [
        pending,
        onPendingChange,
    ]);

    return (
        <div
            title={title}
            className={_cs(className, styles.verifyContainer)}
        >
            <Cloak
                hide={shouldHideEntryEdit}
                render={(
                    <Checkbox
                        value={value}
                        onChange={handleItemSelect}
                        label={_ts('editEntry', 'verifiedLabel')}
                        disabled={disabled}
                        tooltip={title}
                    />
                )}
                renderOnHide={(
                    <Checkbox
                        value={value}
                        onChange={handleItemSelect}
                        label={_ts('editEntry', 'verifiedLabel')}
                        disabled
                        tooltip={title}
                    />
                )}
            />
        </div>
    );
}

export default RequestClient(requestOptions)(EntryVerify);
