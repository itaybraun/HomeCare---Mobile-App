import {Patient} from './Patient';
import {BaseModel} from './BaseModel';
import {Task} from './Task';

export class Visit extends BaseModel {
    id: Number;
    start: Date;
    end: Date;
    patientId: String;
    patient: Patient;
    reason: String;
    taskIds: [String];
    tasks: [Task];

    addTaskId = (taskId) => {
        if (!taskId)
            return;
        if (!this.taskIds) {
            this.taskIds = [taskId];
        } else if (!this.taskIds.includes(taskId)) {
            this.taskIds.push(taskId);
        }
    }

    removeTaskId = (taskId) => {
        if (!this.taskIds)
            return;
        this.taskIds = this.taskIds.filter(id => id !== taskId);
    }
}
