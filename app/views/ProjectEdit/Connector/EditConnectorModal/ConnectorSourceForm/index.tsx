import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Container,
    TextInput,
} from '@the-deep/deep-ui';
import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

import {
    PartialSourceType,
} from '../../schema';
import ReliefWebParamsInput from './ReliefWebParamsInput';
import RssFeedParamsInput from './RssFeedParamsInput';
import AtomFeedParamsInput from './AtomFeedParamsInput';
import UnhcrParams from './UnhcrParamsInput';
import HumanitarianResponseParamsInput from './HumanitarianResponseParamsInput';
import PdnaParamsInput from './PdnaParamsInput';
import KoboParamsInput from './KoboToolboxParamsInput';

import styles from './styles.css';

interface Props<T extends number> {
    className?: string;
    name: T;
    value: PartialSourceType;
    error: Error<PartialSourceType>;
    onChange: (val: SetValueArg<PartialSourceType>, name: T) => void;
    disabled?: boolean;
    rssErrored: boolean;
    onRssErrorChange: (rssErrored: boolean) => void;
    atomErrored: boolean;
    onAtomErrorChange: (atomErrored: boolean) => void;
}

function ConnectorSourceForm<T extends number>(props: Props<T>) {
    const {
        className,
        name,
        value,
        onChange,
        error: riskyError,
        disabled,
        rssErrored,
        onRssErrorChange,
        atomErrored,
        onAtomErrorChange,
    } = props;

    const setFieldValue = useFormObject(name, onChange, value);
    const error = getErrorObject(riskyError);

    return (
        <Container
            className={_cs(className, styles.connectorSourceForm)}
            heading={value.title ?? value.source}
            headingSize="extraSmall"
            contentClassName={styles.content}
        >
            <NonFieldError error={error} />
            <TextInput
                name="title"
                label="Title"
                value={value.title}
                onChange={setFieldValue}
                error={error?.title}
                // TODO: We might not need to change titles
                readOnly
                disabled={disabled}
            />
            {value.source === 'RELIEF_WEB' && (
                <ReliefWebParamsInput
                    name="params"
                    value={value.params}
                    onChange={setFieldValue}
                    error={error?.params}
                    disabled={disabled}
                />
            )}
            {value.source === 'UNHCR' && (
                <UnhcrParams
                    name="params"
                    value={value.params}
                    onChange={setFieldValue}
                    error={error?.params}
                    disabled={disabled}
                />
            )}
            {value.source === 'KOBO' && (
                <KoboParamsInput
                    name="params"
                    value={value.params}
                    onChange={setFieldValue}
                    error={error?.params}
                    disabled={disabled}
                />
            )}
            {value.source === 'HUMANITARIAN_RESP' && (
                <HumanitarianResponseParamsInput
                    name="params"
                    value={value.params}
                    onChange={setFieldValue}
                    error={error?.params}
                    disabled={disabled}
                />
            )}
            {value.source === 'PDNA' && (
                <PdnaParamsInput
                    name="params"
                    value={value.params}
                    onChange={setFieldValue}
                    error={error?.params}
                    disabled={disabled}
                />
            )}
            {value.source === 'RSS_FEED' && (
                <RssFeedParamsInput
                    name="params"
                    value={value.params}
                    onChange={setFieldValue}
                    error={error?.params}
                    disabled={disabled}
                    rssErrored={rssErrored}
                    onRssErrorChange={onRssErrorChange}
                />
            )}
            {value.source === 'ATOM_FEED' && (
                <AtomFeedParamsInput
                    name="params"
                    value={value.params}
                    onChange={setFieldValue}
                    error={error?.params}
                    disabled={disabled}
                    atomErrored={atomErrored}
                    onAtomErrorChange={onAtomErrorChange}
                />
            )}
        </Container>
    );
}

export default ConnectorSourceForm;
