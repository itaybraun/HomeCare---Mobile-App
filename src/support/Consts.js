export const AsyncStorageConsts = {
    STORAGE_SETTINGS: '@settings',
    TASKS_FILTER: '@tasksFilter',
    COMPLETED_TASKS_SORT: '@completedTasksSort',
    FCM_TOKEN: '@fcmToken',
    SAVED_ENVIRONMENT: '@savedServer',

    removeOnLogoutConsts() {
        return [
            AsyncStorageConsts.FCM_TOKEN,
            AsyncStorageConsts.SAVED_ENVIRONMENT,
        ];
    }
};
