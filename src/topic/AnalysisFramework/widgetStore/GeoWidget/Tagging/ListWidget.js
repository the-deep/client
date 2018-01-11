import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    ListView,
} from '../../../../../public/components/View';

import GeoSelection from '../../../../../common/components/GeoSelection';
import styles from './styles.scss';
import { updateAttribute } from './utils';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired,      // eslint-disable-line
    attribute: PropTypes.object,      // eslint-disable-line

};

const defaultProps = {
    attribute: undefined,
};

const emptyList = [];

@CSSModules(styles)
export default class GeoTaggingList extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static calcFlatValues = values => (
        values.map(v => v.key)
    )

    constructor(props) {
        super(props);
        const values = (props.attribute && props.attribute.values) || emptyList;
        const flatValues = GeoTaggingList.calcFlatValues(values);

        this.state = {
            values,
            flatValues,
        };

        updateAttribute(props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.attribute !== nextProps.attribute) {
            const values = (nextProps.attribute && nextProps.attribute.values) || emptyList;
            const flatValues = GeoTaggingList.calcFlatValues(values);

            this.setState({
                values,
                flatValues,
            });

            updateAttribute(nextProps);
        }
    }

    mapRegionsList = (key, data) => (
        <span
            key={key}
            className={styles['region-name']}
        >
            {data.label}
        </span>
    )

    handleGeoSelectionChange = (flatValues, values) => {
        this.setState({
            values,
            flatValues,
        });

        const { api, id, entryId } = this.props;
        const attribute = { values };
        api.getEntryModifier(entryId)
            .setAttribute(id, attribute)
            .apply();
    }

    render() {
        const {
            values,
            flatValues,
        } = this.state;

        return (
            <div styleName="geo-list">
                <GeoSelection
                    styleName="geo-select"
                    onChange={this.handleGeoSelectionChange}
                    projectId={this.props.api.getProject().id}
                    regions={this.props.api.getProject().regions}
                    value={flatValues}
                    disabled={false}
                />
                <ListView
                    data={values}
                    className={styles['region-list']}
                    keyExtractor={GeoTaggingList.valueKeyExtractor}
                    modifier={this.mapRegionsList}
                    emptyComponent="-"
                />
            </div>
        );
    }
}
