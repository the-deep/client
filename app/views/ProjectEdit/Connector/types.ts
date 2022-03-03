import {
    PurgeNull,
} from '@togglecorp/toggle-form';

import {
    UnifiedConnectorInputType,
    ConnectorSourceGqInputType,
} from '#generated/types';
import {
    DeepReplace,
    DeepMandatory,
} from '#utils/types';

interface Params {}

export type SourceInput = Omit<DeepMandatory<PurgeNull<ConnectorSourceGqInputType>, 'clientId'>, 'source' | 'params'> & ({
    source: 'RELIEF_WEB';
    params: Params;
} | {
    source: 'RSS_FEED';
    params: Params;
} | {
    source: 'ATOM_FEED';
    params: Params;
} | {
    source: 'UNHCR';
    params: Params;
});

export type ConnectorInputType = DeepReplace<
    PurgeNull<UnifiedConnectorInputType>,
    ConnectorSourceGqInputType,
    SourceInput
>;
