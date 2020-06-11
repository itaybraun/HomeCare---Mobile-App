import RESTAPI from './RESTAPI';
import moment from 'moment';
import APIRequest from '../../models/APIRequest';
import {ClinicalStatus, Condition, ConditionNote, Severity} from '../../models/Condition';
import {cond} from 'react-native-reanimated';

RESTAPI.prototype.getConditions = async function getConditions(patientId): APIRequest {

    await this.updateCurrentUser();

    try {

        let params = {};
        let url = 'Condition';
        if (patientId) {
            params.subjects = patientId;
        } else if (this.user) {
            params.subject = this.user.patientsIds?.join(',');
        }
        let fhirOptions = {};
        fhirOptions.pageLimit = 0;
        fhirOptions.flat = true;
        fhirOptions.resolveReferences = ["subject", "recorder"];

        const result = await this.callServer(this.createUrl(url, params), fhirOptions);
        console.log('getConditions', result);
        let conditions = result.map(json => this.getConditionFromJson(json)) || [];
        return new APIRequest(true, conditions);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getCondition = async function getCondition(id): APIRequest {
    try {
        let params = {};
        let url = 'Condition/'+id;
        let fhirOptions = {};
        fhirOptions.resolveReferences = ["subject", "recorder"];
        const result = await this.callServer(this.createUrl(url, params), fhirOptions);
        console.log('getCondition', result);
        const condition = this.getConditionFromJson(result);
        return new APIRequest(true, condition);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.addCondition = async function addCondition(condition: Condition): APIRequest {

    try {
        const data = this.getJsonFromCondition(condition);
        console.log(data);
        const result = await this.server.create(data);
        console.log('addCondition', result);
        condition = this.getConditionFromJson(result);
        return new APIRequest(true, condition);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.editCondition = async function editCondition(condition: Condition): APIRequest {

    try {
        const data = this.getJsonFromCondition(condition);
        console.log(data);
        const result = await this.server.update(data);
        console.log('editCondition', result);
        condition = this.getConditionFromJson(result);
        return await this.getCondition(condition.id);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.deleteCondition = async function deleteCondition(condition: Condition): APIRequest {
    try {
        const result = await this.server.delete('Condition/' + condition.id);
        console.log('deleteCondition', result);
        return new APIRequest(true);
    } catch (error) {
        return new APIRequest(false, error);
    }
};

RESTAPI.prototype.getConditionFromJson = function getConditionFromJson(json): Condition {
    let condition = new Condition();
    condition.id = json.id;
    condition.lastUpdate = json.meta?.lastUpdated ? moment(json.meta?.lastUpdated).toDate() : null;
    condition.text = json.code?.text;
    condition.recordedDate = json.recordedDate ? moment(json.recordedDate).toDate() : null;
    condition.patientId = json.subject?.id || null;
    condition.patient = json.subject ? this.getPatientFromJson(json.subject) : null;
    condition.recorderId = json.recorder?.id || null;

    if (json.recorder) {
        if (json.recorder.resourceType === 'Practitioner') {
            condition.recorder = this.getPractitionerFromJSON(json.recorder);
        } else if (json.recorder.resourceType === 'Patient') {
            condition.recorder = this.getPatientFromJson(json.recorder);
        }
    }

    condition.notes = json.note?.map(note => this.getConditionNoteFromJson(note));

    const severity = json.severity?.coding?.[0]?.display;
    if (severity)
        condition.severity = Severity.getByString(severity);

    const status = json.clinicalStatus?.text;
    if (status)
        condition.status = ClinicalStatus.getByString(status);

    condition.bodySite = json.bodySite?.[0]?.coding?.[0]?.display;

    return condition;
};

RESTAPI.prototype.getConditionNoteFromJson = function getConditionNoteFromJson(json): Condition {
    let note = new ConditionNote();
    note.text = json.text;
    note.time = json.time ? moment(json.time).toDate() : null;
    note.authorId = json.authorReference?.reference;
    note.authorName = json.authorReference?.display;
    return note;
};

RESTAPI.prototype.getJsonFromCondition = function getJsonFromCondition(condition: Condition) {
    const data = {
        resourceType: 'Condition',
        code: {
            text: condition.text,
        },
        clinicalStatus: {
            text: "active"
        },
        subject: {
            reference: `Patient/${condition.patientId}`,
            display: condition.patient.fullName,
        },

        recordedDate: moment().toISOString(),

        recorder: {
            reference: `Practitioner/${condition.recorderId}`,
            display: condition.recorder.fullName,
        }
    };

    if (condition.bodySite) {
        data.bodySite = [
            {
                coding: [
                    {
                        system: "http://snomed.info/sct",
                        code: Math.floor(Math.random() * (100000000 - 10000) + 10000),
                        display: condition.bodySite,
                    }
                ]
            }
        ];
    }

    if (condition.severity) {
        data.severity = {
            coding: [
                {
                    system: 'http://snomed.info/sct',
                    code: Severity.getCode(condition.severity),
                    display: condition.severity,
                }
            ]
        }
    }

    data.note = condition.notes?.map(n => {
         const note: ConditionNote = n;
         return {
             authorReference: {
                 reference: `Practitioner/${note.authorId}`,
                 display: note.authorName,
             },
             time: moment(note.time).toISOString(),
             text: note.text,
         }
    });

    data.evidence = condition.images?.map(url => {
        return {
            detail: {
                reference: url,
            }
        }
    });

    if (condition.id) {
        data.id = condition.id;
    }

    return data;
};

