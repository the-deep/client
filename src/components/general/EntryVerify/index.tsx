import React, { useCallback, useEffect } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';

import Cloak from '#components/general/Cloak';
import Checkbox from '#rsci/Checkbox';

import {
    patchEntryVerificationAction,
} from '#redux';
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
    handleEntryVerify?: (status: boolean, entry: Entry) => void;
    disabled?: boolean;
}

interface PropsFromDispatch {
    setEntryVerification: typeof patchEntryVerificationAction;
}

interface Params {
    verify: boolean;
}

interface VerificationOption {
    key: boolean;
    value: string;
}

const shouldHideEntryEdit = ({ entryPermissions }: {
    entryPermissions: {
        modify: boolean;
    };
}) => !entryPermissions.modify;


type Props = AddRequestProps<ComponentProps & PropsFromDispatch, Params>;

const mapDispatchToProps = (dispatch: Dispatch): PropsFromDispatch => ({
    setEntryVerification: params => dispatch(patchEntryVerificationAction(params)),
});

const requestOptions: Requests<ComponentProps & PropsFromDispatch, Params> = {
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
        onSuccess: ({ props, params = {}, response }) => {
            const { handleEntryVerify, setEntryVerification, entryId, leadId } = props;
            const { verify = false } = params;
            if (setEntryVerification) {
                setEntryVerification({ entryId, leadId, status: verify });
            }
            if (handleEntryVerify) {
                handleEntryVerify(verify, response as Entry);
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

export default connect(null, mapDispatchToProps)(
    RequestClient(requestOptions)(
        EntryVerify,
    ),
);
