import React, { useCallback, useEffect, useMemo } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';

import Cloak from '#components/general/Cloak';
import Icon from '#rscg/Icon';
import DropdownEdit from '#components/general/DropdownEdit';

import {
    patchEntryVerificationAction,
} from '#redux';
import {
    AddRequestProps,
    Requests,
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
    value: boolean;
    className?: string;
    onPendingChange?: (pending: boolean | undefined) => void;
    handleEntryVerify?: (status: boolean) => void;
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

const verificationStatusOptions: VerificationOption[] = [
    {

        key: true,
        value: _ts('editEntry', 'verifiedLabel'),
    },
    {
        key: false,
        value: _ts('editEntry', 'unverifiedLabel'),
    },
];


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
        query: ({ params: { verify } = {} }) => ({ verify }),
        onSuccess: ({ props, params = {} }) => {
            const { handleEntryVerify, setEntryVerification, entryId, leadId } = props;
            const { verify = false } = params;
            if (setEntryVerification) {
                setEntryVerification({ entryId, leadId, status: verify });
            }
            if (handleEntryVerify) {
                handleEntryVerify(verify);
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
        className,
        value = false,
        requests,
        title,
        onPendingChange,
        disabled,
    } = props;

    const {
        setEntryVerificationRequest,
    } = requests;

    const selectedOptionKey = useMemo(
        () => verificationStatusOptions.find(v => v.key === value)?.key ?? false,
        [value],
    );

    const selectedOptionValue = useMemo(() => (
        verificationStatusOptions.find(v => v.key === selectedOptionKey)?.value
    ), [selectedOptionKey]);

    const handleItemSelect = useCallback((optionKey: VerificationOption['key']) => {
        setEntryVerificationRequest.do({
            verify: optionKey as boolean,
        });
    }, [setEntryVerificationRequest]);

    const { pending } = setEntryVerificationRequest;

    useEffect(() => {
        if (onPendingChange) {
            onPendingChange(pending);
        }
    }, [
        pending,
        onPendingChange,
    ]);

    return (
        <div className={_cs(className, styles.verifyContainer)}>
            <Cloak
                hide={shouldHideEntryEdit}
                render={
                    <DropdownEdit
                        currentSelection={selectedOptionKey}
                        className={styles.dropdown}
                        options={verificationStatusOptions}
                        onItemSelect={handleItemSelect}
                        dropdownIcon="arrowDropdown"
                        disabled={disabled}
                        dropdownLeftComponent={(
                            <div
                                title={title}
                                className={styles.label}
                            >
                                <Icon
                                    name={value ? 'checkOutlined' : 'help'}
                                    className={value
                                        ? styles.verifiedIcon
                                        : styles.unverifiedIcon
                                    }
                                />
                                {selectedOptionValue}
                            </div>
                        )}
                    />
                }
                renderOnHide={(
                    <div className={styles.label}>
                        <Icon
                            name={(value ? 'checkOutlined' : 'help')}
                            className={value ? styles.verifiedIcon : styles.unverifiedIcon}
                        />
                        {selectedOptionValue}
                    </div>
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
