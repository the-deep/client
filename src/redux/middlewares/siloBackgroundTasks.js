import SiloTasksManager from '#utils/SiloTasksManager';

import TokenRefresher from './tasks/TokenRefresher';
// import TabStatusManager from './tasks/TabStatusManager';
import ProjectGet from './tasks/ProjectGet';
import ProjectRolesGet from './tasks/ProjectRolesGet';
import PreferencesGet from './tasks/PreferencesGet';
import LanguagesGet from './tasks/LanguagesGet';

export const START_SILO_BACKGROUND_TASKS = 'siloBgTasks/START';
export const STOP_SILO_BACKGROUND_TASKS = 'siloBgTasks/STOP';


export const startSiloBackgroundTasksAction = callback => ({
    type: START_SILO_BACKGROUND_TASKS,
    callback,
});

export const stopSiloBackgroundTasksAction = () => ({
    type: STOP_SILO_BACKGROUND_TASKS,
});


const siloBackgroundTasks = (store) => {
    const projectGetter = new ProjectGet(store);
    const projectRolesGetter = new ProjectRolesGet(store);
    const preferencesGetter = new PreferencesGet(store);
    const languagesGetter = new LanguagesGet(store);

    const tokenRefresher = new TokenRefresher(store);
    // const tabStatusManager = new TabStatusManager(store);

    const siloBackgroundTaskManager = new SiloTasksManager('background');
    siloBackgroundTaskManager.addTask(tokenRefresher);
    // siloBackgroundTaskManager.addTask(tabStatusManager);

    return next => (action) => {
        switch (action.type) {
            case START_SILO_BACKGROUND_TASKS:
                siloBackgroundTaskManager
                    .start()
                    .then(() => {
                        if (action.callback) {
                            action.callback();
                        }
                    });

                projectGetter.start();
                projectRolesGetter.start();
                preferencesGetter.start();
                languagesGetter.start();
                break;
            case STOP_SILO_BACKGROUND_TASKS:
                siloBackgroundTaskManager.stop();

                projectGetter.stop();
                projectRolesGetter.stop();
                preferencesGetter.stop();
                languagesGetter.stop();
                break;
            default:
        }
        return next(action);
    };
};

export default siloBackgroundTasks;
