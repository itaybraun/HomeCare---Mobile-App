import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import AppScreen from '../../../../support/AppScreen';
import {Patient} from '../../../../models/Patient';
import Loading from '../../../../support/Loading';
import {APIRequest} from '../../../../api/API';
import {strings} from '../../../../localization/strings';
import { Card, Icon, Text } from 'native-base';
import {commonStyles, renderSeparator} from '../../../../support/CommonStyles';

export default class NotesScreen extends AppScreen {

    static navigationOptions = ({ navigation }) => {
        const patient: Patient = navigation.getParam('patient', null);
        let title = strings.Notes.title;
        if (patient) {
            title = strings.formatString(strings.Notes.userTitle, patient.fullName)
        }

        return {
            title: title,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        notes: [],
    };

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();
    }

    getData = async (refresh = true) => {
        this.setState({loading: true});
        const notes = await this.getNotes(refresh);
        this.setState({...notes, loading: false});
    };

    getNotes = async (refresh = true) => {
        const patient: Patient = this.props.navigation.getParam('patient', null);
        if (patient) {
            //let result: APIRequest = await this.api.getNotes(patient.id);
            let result: APIRequest = await this.api.getNotes(266980);
            if (result.success) {
                return {notes: result.data};
            } else {
                this.showError(result.data);
            }
        }
    };

    renderListHeader = () => {
        return (
            <View style={{paddingTop: 6, paddingHorizontal: 8, paddingBottom: 10}}>
                <TouchableOpacity>
                    <Text style={commonStyles.link}>{strings.Notes.addNote}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    renderItem = ({item}) => {
        return (
            <TouchableOpacity>
                <Card style={[styles.noteItemContainer, {backgroundColor: item.internal ? '#E8E16C' : '#FFFFFF'}]}>
                    <Text style={commonStyles.smallInfoText}>{item.date.format("MMM Do YYYY")}</Text>
                    <Text style={[commonStyles.boldTitleText, {marginVertical: 6}]}>{item.title}</Text>
                    <Text style={commonStyles.contentText}>{item.text}</Text>
                </Card>
            </TouchableOpacity>
        )
    };

    render() {

        const notes = this.state.notes;

        return (
            <View style={styles.container}>
                <FlatList style={styles.list}
                          data={notes}
                          renderItem={this.renderItem}
                          ListHeaderComponent={this.renderListHeader}
                          keyExtractor={item => item.id.toString()}
                          onRefresh={this.getData}
                          refreshing={this.state.loading}
                          ItemSeparatorComponent={renderSeparator}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    list: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 10,
    },

    noteItemContainer: {
        padding: 12,
        paddingRight: 0,
        borderRadius: 4,
        overflow: 'hidden',
    },
});
