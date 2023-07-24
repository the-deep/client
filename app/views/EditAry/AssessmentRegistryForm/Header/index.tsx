import React from 'react';
import { Element, Heading } from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props {
    title: string;
    icons?: React.ReactNode;
}

function Header(props: Props) {
    const { title, icons } = props;

    return (
        <div className={styles.headingContainer}>
            <Element
                actions={icons}
                actionsContainerClassName={styles.icons}
            >
                <Heading
                    className={styles.title}
                    size="extraSmall"
                    colorVariant="accent"
                >
                    {title}
                </Heading>

            </Element>
        </div>
    );
}

export default Header;
