import SiloTasksManager from '#utils/SiloTasksManager';

export const START_SILO_BACKGROUND_TASKS = 'siloBgTasks/START';
export const STOP_SILO_BACKGROUND_TASKS = 'siloBgTasks/STOP';


export const startSiloBackgroundTasksAction = callback => ({
    type: START_SILO_BACKGROUND_TASKS,
    callback,
});

export const stopSiloBackgroundTasksAction = () => ({
    type: STOP_SILO_BACKGROUND_TASKS,
});


const siloBackgroundTasks = () => {
    const siloBackgroundTaskManager = new SiloTasksManager('background');
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

                break;
            case STOP_SILO_BACKGROUND_TASKS:
                siloBackgroundTaskManager.stop();
                break;
            default:
        }
        return next(action);
    };
};

export default siloBackgroundTasks;
