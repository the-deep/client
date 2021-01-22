import React from 'react';

import _ts from '#ts';
import { _cs } from '@togglecorp/fujs';

import Page from '#rscv/Page';
import Icon from '#rscg/Icon';
import Image from '#rscv/Image';

import Fishes from '#resources/404/fishes.svg';
import FishesDory from '#resources/404/fishes-dory.svg';
import FishesDoryRight from '#resources/404/fishes-dory-right.svg';
import FishesLarge from '#resources/404/fishes-large.svg';
import OctopusSmall from '#resources/404/Octopus-small.svg';
import OctopusLarge from '#resources/404/octopus.png';
import Sharks from '#resources/404/sharks.svg';
import HiddenImage from '#resources/404/hidden-image.png';
import Diver from '#resources/404/Diver.svg';

import BackLink from '#components/general/BackLink';
import { pathNames } from '#constants';

import styles from './styles.scss';

// eslint-disable-next-line react/prefer-stateless-function
export default class FourHundredFour extends React.PureComponent {
    render() {
        return (
            <Page
                mainContentClassName={styles.fourHundredFour}
                mainContent={
                    <React.Fragment>
                        <div className={styles.content}>
                            <Image
                                className={styles.fishes}
                                src={Fishes}
                            />
                            <Image
                                className={styles.fishesDory}
                                src={FishesDory}
                            />
                            <Image
                                className={styles.fishesDoryRight}
                                src={FishesDoryRight}
                            />
                            <Image
                                className={styles.sharks}
                                src={Sharks}
                            />
                            <Image
                                className={styles.octopusSmall}
                                src={OctopusSmall}
                            />
                            <Image
                                className={styles.fishesLarge}
                                src={FishesLarge}
                            />
                            <Image
                                className={styles.diver}
                                src={Diver}
                            />

                            <div className={_cs(styles.seaLife, styles.positionTop)}>
                                <Image
                                    className={styles.octopus}
                                    src={OctopusLarge}
                                />
                                <Image
                                    className={styles.hiddenImage}
                                    src={HiddenImage}
                                />
                            </div>
                            <div className={_cs(styles.seaLife, styles.positionBottom)}>
                                <Image
                                    className={styles.octopus}
                                    src={OctopusLarge}
                                />
                                <Image
                                    className={styles.hiddenImage}
                                    src={HiddenImage}
                                />
                            </div>
                        </div>
                        <div className={styles.messageContent}>
                            <Icon
                                className={styles.deepLogo}
                                name="deepLogo"
                            />
                            <h1 className={styles.heading}>
                                {_ts('fourHundredFour', 'errorFourHundredFour')}
                            </h1>
                            <p className={styles.message}>
                                <strong>{_ts('fourHundredFour', 'message1')}</strong>
                                <br />
                                {_ts('fourHundredFour', 'message2')}
                            </p>
                            <BackLink
                                defaultLink={pathNames.landingPage}
                                className={styles.landingPageLink}
                            >
                                {_ts('fourHundredFour', 'backToDeep')}
                            </BackLink>
                        </div>
                    </React.Fragment>
                }
            />
        );
    }
}
