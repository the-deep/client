import React, { useState, useCallback, useEffect } from 'react';
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
    entryId: number;
    leadId: number;
    verified: boolean;
    hide: (entryPermission) => boolean;
    className?: string;
    setEntryVerification: ({ entryId: number, leadId: number, status: boolean }) => void;
}

interface Params {
    verify: boolean;
}

interface VerificationOption {
    key: boolean;
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

const mapDispatchToProps = dispatch => ({
    setEntryVerification: params => dispatch(patchEntryVerificationAction(params)),
});

const requestOptions: Requests<ComponentProps, Params> = {
    setEntryVerificationRequest: {
        url: ({ props: { entryId } }) => `/entries/${entryId}/verify/`,
        method: methods.POST,
        query: ({ params: { verify } }) => ({ verify }),
        onSuccess: ({ props, params = {} }) => {
            const { setEntryVerification, entryId, leadId } = props;
            const { verify } = params;
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
    } = props;
    const {
        setEntryVerificationRequest,
    } = requests;

    const [verified, setVerificationStatus] = useState(verifiedFromProps);

    useEffect(() => {
        setVerificationStatus(verifiedFromProps);
    }, [verifiedFromProps]);

    const selectedOption = verificationStatusOptions.find(v => v.key === verified);

    const handleItemSelect = useCallback((key: boolean) => {
        setEntryVerificationRequest.do({
            verify: key,
            setVerificationStatus,
        });
    }, [setEntryVerificationRequest]);

    return (
        <div className={_cs(className, styles.verifyContainer)}>
            <Cloak
                hide={hide}
                render={
                    <DropdownEdit
                        currentSelection={selectedOption && selectedOption.key}
                        className={styles.dropdown}
                        options={verificationStatusOptions}
                        onItemSelect={handleItemSelect}
                        dropdownIcon=""
                        dropdownLeftComponent={(
                            <div className={styles.label}>
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
