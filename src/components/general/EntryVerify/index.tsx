import React, { useState, useCallback, useEffect } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';

import Cloak from '#components/general/Cloak';
import Icon from '#rscg/Icon';
import Spinner from '#rscv/Spinner';
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
    verified: boolean;
    hide: (entryPermission: {}) => boolean;
    className?: string;
    setEntryVerification: ({
        entryId,
        leadId,
        status,
    }: {
        entryId: number;
        leadId: number;
        status: boolean;
    }) => void;
}
interface PropsFromDispatch {
    setEntryVerification: typeof patchEntryVerificationAction;
}

interface Params {
    verify: boolean;
}

interface VerificationOption {
    key: boolean | string | number;
    value: string;
}

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


type Props = AddRequestProps<ComponentProps, Params>;

const mapDispatchToProps = (dispatch: Dispatch): PropsFromDispatch => ({
    setEntryVerification: params => dispatch(patchEntryVerificationAction(params)),
});

const requestOptions: Requests<ComponentProps, Params> = {
    setEntryVerificationRequest: {
        url: ({
            props: { entryId },
            params,
        }) => ((params && params.verify) ? `/entries/${entryId}/verify/` : `/entries/${entryId}/unverify/`),
        method: methods.POST,
        query: ({ params: { verify } = {} }) => ({ verify }),
        onSuccess: ({ props, params = {} }) => {
            const { setEntryVerification, entryId, leadId } = props;
            const { verify = false } = params;
            if (setEntryVerification) {
                setEntryVerification({ entryId, leadId, status: verify });
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
        hide,
        verified: verifiedFromProps = false,
        requests,
        title,
    } = props;
    const {
        setEntryVerificationRequest,
    } = requests;

    const [verified, setVerificationStatus] = useState(verifiedFromProps);

    useEffect(() => {
        setVerificationStatus(verifiedFromProps);
    }, [verifiedFromProps]);

    const selectedOption = verificationStatusOptions.find(v => v.key === verified) ||
                           verificationStatusOptions[1];

    const handleItemSelect = useCallback((optionKey: VerificationOption['key']) => {
        setEntryVerificationRequest.do({
            verify: optionKey as boolean,
        });
    }, [setEntryVerificationRequest]);

    const { pending } = setEntryVerificationRequest;
    return (
        <div className={_cs(className, styles.verifyContainer)}>
            {pending && <Spinner />}
            <Cloak
                hide={hide}
                render={
                    <DropdownEdit
                        currentSelection={selectedOption && selectedOption.key}
                        className={styles.dropdown}
                        options={verificationStatusOptions}
                        onItemSelect={handleItemSelect}
                        dropdownIcon="arrowDropdown"
                        dropdownLeftComponent={(
                            <div
                                title={title}
                                className={styles.label}
                            >
                                <Icon
                                    name={verified ? 'checkOutlined' : 'help'}
                                    className={verified
                                        ? styles.verifiedIcon
                                        : styles.unverifiedIcon
                                    }
                                />
                                {selectedOption && selectedOption.value}
                            </div>
                        )}
                    />
                }
                renderOnHide={(
                    <div className={styles.label}>
                        <Icon
                            name={(verified ? 'checkOutlined' : 'help')}
                            className={verified ? styles.verifiedIcon : styles.unverifiedIcon}
                        />
                        {selectedOption && selectedOption.value}
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
