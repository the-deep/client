import React from 'react';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';

import Responsive from '#rscg/Responsive';

import styles from './styles.scss';

interface BCR {
    width: number;
    height: number;
}

interface Props {
    boundingClientRect: BCR;
    orientation: string;
}

interface State {
}

const orientationStyleMap = {
    leftToRight: styles.leftToRight,
    bottomToTop: styles.bottomToTop,
};

class TiltableText extends React.PureComponent<Props, State> {
    getRenderSize = memoize((boundingClientRect: BCR, orientation: string) => {
        switch (orientation) {
            case 'leftToRight':
                return {
                    width: boundingClientRect.width,
                    height: boundingClientRect.height,
                };
            case 'bottomToTop':
                return {
                    width: boundingClientRect.height,
                    height: boundingClientRect.width,
                };
            default:
                return {};
        }
    });

    render() {
        const {
            boundingClientRect,
            orientation,
            children,
        } = this.props;

        const {
            width,
            height,
        } = this.getRenderSize(boundingClientRect, orientation);

        return (
            <div
                className={_cs(styles.tiltableText, orientationStyleMap[orientation])}
                style={{
                    width,
                    height,
                }}
            >
                { children }
            </div>
        );
    }
}

export default Responsive(TiltableText);
