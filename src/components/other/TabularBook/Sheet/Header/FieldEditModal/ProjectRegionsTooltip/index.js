import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    regions: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    regions: [],
    className: '',
};

const AdminLevel = ({ title, level }) => (
    <div className={styles.adminLevel} >
        <div className={styles.level}>
            {level}
        </div>
        <div>
            {title}
        </div>
    </div>
);

AdminLevel.propTypes = {
    title: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired,
};

const groupRendererParams = groupKey => ({
    children: groupKey,
});

const adminLevelKeySelector = adminLevel => adminLevel.key;
const groupKeySelector = adminLevel => adminLevel.regionTitle;

const emptyList = [];

export default class ProjectRegionsTooltip extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getFlatAdminLevels = memoize(regions => (
        regions
            .map(
                region => (region.adminLevels || emptyList).map(
                    adminLevel => ({
                        ...adminLevel,
                        regionTitle: region.title,
                        key: `${region.title}-${adminLevel.id}`,
                    }),
                ),
            ).flat()
    ));

    adminLevelRendererParams = (key, data) => ({
        title: data.title,
        regionTitle: data.regionTitle,
        level: data.level,
    })

    render() {
        const {
            regions,
            className,
        } = this.props;
        const adminLevels = this.getFlatAdminLevels(regions);
        const noAdminLevels = adminLevels.length === 0;

        return (
            <div className={_cs(styles.tooltip, className)}>
                <h4 className={styles.heading} >
                    {noAdminLevels ? (
                        _ts('tabular', 'noRegionsInProject')
                    ) : (
                        _ts('tabular', 'regionAdminLevelsInfo')
                    )}
                </h4>
                {!noAdminLevels &&
                    <ListView
                        data={adminLevels}
                        renderer={AdminLevel}
                        className={styles.list}
                        keySelector={adminLevelKeySelector}
                        rendererParams={this.adminLevelRendererParams}
                        groupKeySelector={groupKeySelector}
                        groupRendererParams={groupRendererParams}
                        groupRendererClassName={styles.group}
                    />
                }
            </div>
        );
    }
}
