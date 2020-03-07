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

    addTaskId = (id) => {
        if (!this.taskIds) {
            this.taskIds = [id];
        } else if (!this.taskIds.includes(id)) {
            this.taskIds.push(id);
        }
    }

    removeTaskId = (id) => {
        if (!this.taskIds)
            return;
        this.taskIds = this.taskIds.filter(id => id !== id);
    }
}
