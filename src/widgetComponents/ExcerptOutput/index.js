import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import DataSeries from '#components/viz/DataSeries';
import Image from '#rsu/../v2/View/Image';

import styles from './styles.scss';

const TEXT = 'text';
const IMAGE = 'image';
const DATA_SERIES = 'dataSeries';


function ExcerptOutput(props) {
    const {
        className,
        type,
        value,
    } = props;

    const [entryState, setEntryState] = useState({});

    const children = useMemo(() => {
        if (type === TEXT) {
            return (
                <p className={styles.text}>
                    { value }
                </p>
            );
        }
        if (type === IMAGE) {
            return (
                <Image
                    className={styles.image}
                    alt=""
                    src={value}
                    zoomable
                    expandable
                />
            );
        }
        if (type === DATA_SERIES) {
            return (
                <DataSeries
                    className={styles.dataSeries}
                    value={value}
                    onEntryStateChange={setEntryState}
                    entryState={entryState}
                />
            );
        }
        console.error('Excerpt should either be image or text');
        return null;
    }, [type, entryState, value]);

    return (
        <div className={_cs(className, styles.excerpt)}>
            {children}
        </div>
    );
}

ExcerptOutput.propTypes = {
    className: PropTypes.string,

    type: PropTypes.oneOf([
        TEXT,
        IMAGE,
        DATA_SERIES,
    ]),

    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
};

ExcerptOutput.defaultProps = {
    className: '',
    type: TEXT,
    value: undefined,
};

export default ExcerptOutput;
