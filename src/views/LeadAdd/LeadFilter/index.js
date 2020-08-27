import PropTypes from 'prop-types';
import React from 'react';
import Faram from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import DangerButton from '#rsca/Button/DangerButton';
import MultiSelectInput from '#rsci/MultiSelectInput';
import SearchInput from '#rsci/SearchInput';
import SelectInput from '#rsci/SelectInput';
// import TextInput from '#rsci/TextInput';

import _ts from '#ts';

import {
    LEAD_TYPE,
    LEAD_FILTER_STATUS,
} from '../utils';

import styles from './styles.scss';

const leadTypeOptions = [
    { key: LEAD_TYPE.dropbox, label: 'Dropbox' },
    { key: LEAD_TYPE.file, label: 'Local Disk' },
    { key: LEAD_TYPE.drive, label: 'Google Drive' },
    { key: LEAD_TYPE.text, label: 'Text' },
    { key: LEAD_TYPE.website, label: 'Website' },
];

const leadStatusFilterOptions = [
    { key: LEAD_FILTER_STATUS.invalid, label: 'Invalid' },
    { key: LEAD_FILTER_STATUS.saved, label: 'Saved' },
    { key: LEAD_FILTER_STATUS.unsaved, label: 'Unsaved' },
];

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    filters: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onFilterClear: PropTypes.func.isRequired,
    clearDisabled: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    clearDisabled: false,
    className: undefined,
};

const faramSchema = {
    fields: {},
};

export default class LeadFilter extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            filters,
            onFilterChange,
            onFilterClear,
            clearDisabled,
            className,
        } = this.props;

        return (
            <Faram
                className={_cs(styles.container, className)}
                value={filters}
                onChange={onFilterChange}
                schema={faramSchema}
            >
                <SearchInput
                    faramElementName="search"
                    label={_ts('addLeads.filters', 'placeholderSearch')}
                    placeholder={_ts('addLeads.filters', 'placeholderSearch')}
                    showHintAndError={false}
                />
                {/*
                    <TextInput
                        faramElementName="source"
                        label={_ts('addLeads.filters', 'filterPublisher')}
                        placeholder={_ts('addLeads.filters', 'placeholderAny')}
                        showHintAndError={false}
                    />
                */}
                <MultiSelectInput
                    faramElementName="type"
                    label={_ts('addLeads.filters', 'filterSourceType')}
                    showLabel
                    options={leadTypeOptions}
                    placeholder={_ts('addLeads.filters', 'placeholderAny')}
                    showHintAndError={false}
                />
                <SelectInput
                    faramElementName="status"
                    label={_ts('addLeads.filters', 'filterStatus')}
                    showLabel
                    options={leadStatusFilterOptions}
                    placeholder={_ts('addLeads.filters', 'placeholderAny')}
                    showHintAndError={false}
                />
                <DangerButton
                    disabled={clearDisabled}
                    onClick={onFilterClear}
                >
                    {_ts('addLeads.filters', 'filterClearFilter')}
                </DangerButton>
            </Faram>
        );
    }
}
