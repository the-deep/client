import React from 'react';
import ReactMarkdown from 'react-markdown';
import { _cs } from '@togglecorp/fujs';
import {
    Card,
    Container,
} from '@the-deep/deep-ui';

import WelcomeContent from '#components/general/WelcomeContent';

import styles from './styles.css';

export const termsNotice = `
# DEEP TERMS OF USE
The [Data Entry &amp; Exploration Platform (DEEP)](https://thedeep.io/) is an open data platform managed by a multi-stakeholder Governance Board through the Danish Refugee Council (DRC) as administrative host and the Data Friendly Space (DFS) as main technical provider and host. These Terms of Use describe how DEEP is managed and how the platform should be used. These Terms will be updated as needed with noticed of significant updates posted on DEEP slack channel and DEEP Skype user group. All users of DEEP are bound to those terms and if in disagreement, you should discontinue use of DEEP.

If you have any questions or comments about these Terms or DEEP, please contact the DEEP Project Manager, [pm@thedeep.io](mailto:pm@thedeep.io).
## Account Management
### User account
DEEP is an open platform that anyone can create an account in and use. Registering with DEEP gives users access to set up projects, request to join existing projects, and access to an overview of projects available in DEEP. The user is obligated to review and sign a consent of storing of basic user data within the platform for administrative purposes.
### Project administrator
Anyone with a user account can create a new project in DEEP. The project administrator is considered to be the responsible publisher of the information and data uploaded to that project. The project administrator is also responsible for approving user access and rights of other users joining the project and verifying the identity of the requesters. The project administrator must review and sign a data sharing agreement and is obligated to ensure that ethical and legal considerations are taken within the project including responsibility for any copyright infringements. The information and data that will be uploaded to the project should meet the requirements set out in the _Data scope and criteria_-section below.
### Deletion of user profiles
A user may delete their user account at any time. When you delete your account, DEEP will delete any personal data collected in order to create the account.

If a Project Administrator wishes to delete their DEEP account, the Project Administrator needs to appoint a new Project Administrator, or one will be given by default to the users with the longest tenure in the project.
## Data Scope and Criteria
**Type of data** which may be shared on DEEP:
- Qualitative (e.g., reports, articles, policy documents, needs assessments and response data) and quantitative data (e.g., dataset on impacted and vulnerable people and communities) in format supported by DEEP
- Any type of data that supports a project&#39;s objective

**Criteria of data** shared on DEEP:
- Public and restricted sources (leads) may not contain any personal data. Personal data is information, in any form, that relates to an identified or identifiable natural person.
- Public and restricted sources (leads) may not contain any sensitive non-personal data. This includes information which, while not relating to an identified or identifiable natural person, may, by reason of its sensitive context, put certain individuals or groups of individuals at risk of harm.
- Metadata of public and restricted sources are made available for all DEEP users as public view.
- Confidential sources (leads) may contain personal and sensitive data if in line with project objectives and treated with utmost confidentiality such as restricted user access and/or set-up of the project for private access only. Metadata for a private project is excluded for public view.
- Should copyrights apply to a source, appropriate restriction level should be applied and information thereof included in the source metadata.
## Data responsibility and sharing
### Responsible publisher
The Project Administrator is the responsible publisher for his/her project and must ensure that collaborators of the project follow DEEP&#39;s data sharing protocols. The Project Administrator needs to sign a Data sharing agreement with indication of level of openness of data.

Users may use DEEP to share data from other sources with appropriate metadata including any applicable copyright, restrictions or license to guide any onward sharing.
### Restriction levels
There are three levels of restriction impacting data sharing on DEEP:
- **Public (non-confidential):** Data can be shared with any user in DEEP and exported to anyone without restrictions. The data is unlikely to cause any harm to affected population or other individuals and is publicly available. The data can be shared across the platform for research purposes (e.g., development of Machine Learning or Natural Language Procession solutions), available in joint repository and platform cross searches.
- **Confidential:** Data is considered confidential that could cause harm to affected population or other individuals our under copyright. Data is accessible only to members of the project or a specific segment of users but should be assigned access only with caution and due procedure. The Project Administrator can decide whether or not to grant access to the data.The data is not accessible in platform cross searches, joint repository or for other purposes. Other users will only be able to consult the metadata.

A project can be set-up as a private project which exclude all information in the project including metadata from the public view. Contact support@thedeep.io, to ask to set up as a private project.

After exporting data from DEEP, users must follow any restrictions applied when using and further sharing the data. Exports including confidential data will be marked and restriction metadata included in bibliography.

If a user notices personal or sensitive data shared publicly through DEEP they should contact support@thedeep.io immediately to request that the data be removed. The DEEP team will take action, removing public access to that data and contact the project administrator.
## Data Management
### Open source
DEEP is an open-source data management system licensed under the AGPL-3.0 license under the Open Source Initiative and managed by Data Friendly Space (DFS), a United States non-profit (501 c3) based organization.
### Server storage
Data that is uploaded to DEEP is stored by DFS on servers provided by Amazon Web Services and long term backups are stored on [N2WS](https://n2ws.com/). Data is encrypted in transit and at rest. Data is hosted and processed in the United States.
- DFS will never alter any data uploaded to DEEP without permission from the Project Administrator.
- Data shared through DEEP will never be shared further by DFS without prior permission from Project Administrator either for research and/or training dataset for NLP.
### Deletion of data
Deleted data cannot be retrieved by users. Deleted sources are not currently purged from backups. Metadata continues to exist in backups of the database indefinitely.
## Generic Disclaimer of Liability
The users are responsible for the data they share on DEEP. DEEP, its governing members or DFS assumes no liability whatsoever for data shared on DEEP. Sharing data through DEEP does not imply the transfer of any rights over this data to DEEP. DEEP, its governing members or DFS disclaim all warranties, whether expressed or implied.

Data and information on DEEP do not imply the expression or endorsement of any opinion on the part of DEEP, DFS, or its governing members. This includes opinions concerning the legal status of any country, territory, city or area or of its authorities, or concerning the delimitation of its frontiers or boundaries.
## Privacy Notice
User contact details and personal information are only stored for administrative purposes on the platform. A user has access to the data stored about themselves and can ask for deletion of the user profile. All personal data will be removed, except the log tracking upload and tagging of data.

DEEP upholds a high standard of data protection for any personal data of DEEP users. In case such personal data is exposed, DEEP will notify all affected individuals and remedy the incident.

DEEP maintains an e-mail distribution list to continuously inform users of changes to the platform or other relevant updates, which can be unsubscribed from. These preferences can be managed in the User Profile.
`;

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
                    headerDescription="Effective: January, 2022"
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
