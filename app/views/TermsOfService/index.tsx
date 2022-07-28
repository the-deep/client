import React from 'react';
import ReactMarkdown from 'react-markdown';
import { _cs } from '@togglecorp/fujs';
import {
    Card,
    Container,
} from '@the-deep/deep-ui';

import WelcomeContent from '#components/general/WelcomeContent';

import { termsNotice } from '#utils/terms';
import styles from './styles.css';

interface Props {
    className?: string;
}

function TermsOfService(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(styles.termsOfService, className)}>
            <Card className={styles.card}>
                <WelcomeContent
                    className={styles.welcomeContent}
                />
                <Container
                    className={styles.rightContent}
                    heading="DEEP Terms of Use and Privacy Notice"
                    headingSize="extraLarge"
                    contentClassName={styles.content}
                >
                    <ReactMarkdown>
                        {termsNotice}
                    </ReactMarkdown>
                </Container>
            </Card>
        </div>
    );
}

export default TermsOfService;
