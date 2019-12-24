import React from 'react';

import styles from './styles.scss';

interface Props {
    value: string;
    marker?: string;
}

export default class ListItem extends React.PureComponent<Props> {
    static defaultProps = {
        marker: '•',
    };

    render() {
        const {
            value,
            marker,
        } = this.props;

        return (
            <div className={styles.listItem}>
                {marker && (
                    <div className={styles.marker}>
                        { marker }
                    </div>
                )}
                <div className={styles.label}>
                    { value }
                </div>
            </div>
        );
    }
}
