import { BgRestBuilder } from '#rsu/rest';
import { isFalsy } from '#rsu/common';

import {
    createParamsForGet,
    urlForUserPreferences,
} from '#rest';
import schema from '#schema';
import AbstractTask from '#utils/AbstractTask';

import { setUserPreferencesAction } from '../../reducers/auth';
import {
    setWaitingForLanguageAction,
    setWaitingForPreferencesAction,
} from '../../reducers/app';
import {
    setFallbackLanguageAction,
    setLanguageAction,
    setSelectedLanguageAction,
} from '../../reducers/lang';
import { setActiveProjectAction } from '../../reducers/siloDomainData/common';
import { activeProjectIdFromStateSelector } from '../../selectors/siloDomainData/common';

import LanguageGet from './LanguageGet';

export default class PreferencesGet extends AbstractTask {
    constructor(store) {
        super();
        this.store = store;
    }

    createPreferencesRequest = (store) => {
        const preferencesRequest = new BgRestBuilder()
            .url(urlForUserPreferences)
            .params(createParamsForGet)
            .success((response) => {
                try {
                    schema.validate(response, 'userPreferences');
                    const {
                        email,
                        displayPicture,
                        isSuperuser,
                        displayName,
                        username,

                        lastActiveProject,
                        experimental,

                        language,
                        fallbackLanguage,
                    } = response;

                    const activeProjectId = activeProjectIdFromStateSelector(store.getState());
                    if (isFalsy(activeProjectId)) {
                        console.warn('Setting user projectId form memory', lastActiveProject);
                        store.dispatch(setActiveProjectAction({
                            activeProject: lastActiveProject,
                        }));
                    }

                    store.dispatch(setUserPreferencesAction({
                        email,
                        displayPicture,
                        isSuperuser,
                        experimental,
                        displayName,
                        username,
                    }));

                    store.dispatch(setSelectedLanguageAction(language));
                    store.dispatch(setFallbackLanguageAction(fallbackLanguage));

                    store.dispatch(setWaitingForPreferencesAction(false));

                    if (language === '$devLang' || language === undefined) {
                        store.dispatch(setWaitingForLanguageAction(false));
                    } else {
                        const request = new LanguageGet({
                            setLanguage: lang => store.dispatch(setLanguageAction(lang)),
                            setWaitingForLanguage: v => store.dispatch(
                                setWaitingForLanguageAction(v),
                            ),
                        });
                        this.languageGetRequest = request.create(language);
                        this.languageGetRequest.start();
                    }
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return preferencesRequest;
    }

    start = () => {
        this.stop();

        this.preferencesRequest = this.createPreferencesRequest(this.store);
        this.preferencesRequest.start();
    }

    stop = () => {
        if (this.preferencesRequest) {
            this.preferencesRequest.stop();
        }
        if (this.languageGetRequest) {
            this.languageGetRequest.stop();
        }
    }
}
