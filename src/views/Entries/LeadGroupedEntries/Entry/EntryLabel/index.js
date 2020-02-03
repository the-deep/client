import PropTypes from 'prop-types';
import React from 'react';

import ListView from '#rscv/List/ListView';
import Badge from '#components/viewer/Badge';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    labelColor: PropTypes.string,
    titleClassName: PropTypes.string,
    groups: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: undefined,
    titleClassName: undefined,
    title: '',
    labelColor: '',
    groups: [],
};

const entryGroupKeySelector = d => d;

const EntryGroup = ({ title }) => (
    <div className={styles.entryGroup}>
        {title}
    </div>
);

EntryGroup.propTypes = {
    title: PropTypes.string.isRequired,
};

export default class EntryLabelBadge extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    entryGroupRendererParams = (key, data) => ({
        title: data,
    })

    render() {
        const {
            className,
            groups,
            title,
            labelColor,
            titleClassName,
        } = this.props;

        return (
            <Badge
                className={className}
                tooltip={groups.length > 0 && (
                    <div className={styles.tooltip}>
                        <header className={styles.header}>
                            <h4>
                                {_ts('entries', 'entryGroupsHeaderTooltip')}
                            </h4>
                        </header>
                        <ListView
                            className={styles.entryGroups}
                            data={groups}
                            renderer={EntryGroup}
                            rendererParams={this.entryGroupRendererParams}
                            keySelector={entryGroupKeySelector}
                        />
                    </div>
                )}
                icon="circle"
                iconStyle={{ color: labelColor }}
                title={title}
                titleClassName={titleClassName}
            />
        );
    }
}
