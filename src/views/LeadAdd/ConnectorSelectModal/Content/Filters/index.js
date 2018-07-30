import PropTypes from 'prop-types';
import React from 'react';

import Faram from '#rs/components/Input/Faram';
import TextInput from '#rs/components/Input/TextInput';
import Button from '#rsca/Button';
import List from '#rs/components/View/List';

import _ts from '#ts';

import styles from './styles.scss';

const Filter = ({ filterData }) => {
    if (filterData.fieldType === 'string') {
        return (
            <TextInput
                className={styles.input}
                key={filterData.key}
                faramElementName={filterData.key}
                label={filterData.title}
                showHintAndError={false}
            />
        );
    }
    return null;
};

Filter.propTypes = {
    filterData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const propTypes = {
    filters: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onApply: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

export default class ConnectorContentFilters extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getSchema = (filters) => {
        const schema = {
            fields: {},
        };
        filters.forEach((f) => {
            schema.fields[f.key] = [];
        });
        return schema;
    }

    constructor(props) {
        super(props);
        this.schema = ConnectorContentFilters.getSchema(props.filters);
    }

    componentWillReceiveProps(nextProps) {
        const { filters: newFilters } = nextProps;
        const { filters: oldFilters } = this.props;

        if (newFilters !== oldFilters) {
            this.schema = ConnectorContentFilters.getSchema(newFilters);
        }
    }

    rendererParams = (key, filterData) => ({
        filterData,
    })

    render() {
        const {
            filters,
            value,
            onChange,
            onApply,
            className,
        } = this.props;

        return (
            <Faram
                className={`${className} ${styles.container}`}
                onChange={onChange}
                onValidationSuccess={onApply}
                schema={this.schema}
                value={value}
            >
                <List
                    data={filters}
                    renderer={Filter}
                    keySelector={ConnectorContentFilters.keySelector}
                    rendererParams={this.rendererParams}
                />
                <Button type="submit" >
                    {_ts('addLeads.connectorsSelect', 'applyFilterLabel')}
                </Button>
            </Faram>
        );
    }
}
