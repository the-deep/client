import React from 'react';
import PropTypes from 'prop-types';

import List from '#rscv/List';
import ListItem from '#components/ListItem';

import styles from './styles.scss';

const propTypes = {
    dimension: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    subdimension: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    sector: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    subsectors: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    subsectors: [],
};

export default class Row extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static subsectorKeySelector = (d = {}) => d.id;
    static subsectorLabelSelector = (d = {}) => d.title;

    rendererParams = (key, subsector) => ({
        value: Row.subsectorLabelSelector(subsector),
    })

    render() {
        const {
            dimension,
            subdimension,
            sector,
            subsectors,
        } = this.props;

        return (
            <div className={styles.row}>
                <div className={styles.tagDimension} >
                    <div className={styles.dimensionTitle}>
                        {dimension.title}
                    </div>
                    <div className={styles.subdimensionTitle}>
                        {subdimension.title}
                    </div>
                </div>
                <div className={styles.tagSector}>
                    <div className={styles.title}>
                        {sector.title}
                    </div>
                    <List
                        data={subsectors}
                        renderer={ListItem}
                        rendererParams={this.rendererParams}
                        keySelector={Row.subsectorKeySelector}
                    />
                </div>
            </div>
        );
    }
}
