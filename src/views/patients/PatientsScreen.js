import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {Patient} from '../../models/Patient';
import Loading from '../../support/Loading';
import {APIRequest} from '../../api/API';
import {strings} from '../../localization/strings';
import { Card, Icon, Text } from 'native-base';
import {commonStyles, renderSeparator} from '../../support/CommonStyles';

export default class PatientsScreen extends AppScreen {

    static navigationOptions = {
        title: strings.Patients.title,
    };

    state = {
        loading: false,
        patients: [],
        filteredPatients: null,
    };

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();
    }

    getData = async (refresh = true) => {
        this.setState({loading: true});
        const patients = await this.getPatients(refresh);
        this.setState({...patients, loading: false});
    };

    getPatients = async (refresh = true) => {
        let result: APIRequest = await this.api.getPatients();
        if (result.success) {
            return {patients: result.data};
        } else {
            this.showError(result.data);
        }
    };

    selectPatient = (patient) => {
        this.props.navigation.navigate('Patient', {patient: patient});
    };

    filterPatients = (text) => {
        if (text.isEmpty()) {
            this.setState({
                filteredPatients: null,
            });
            return;
        }

        text = text.toLowerCase();

        const filteredPatients = this.state.patients.filter(patient => patient.fullName.toLowerCase().indexOf(text) > -1);

        this.setState({
            filteredPatients: filteredPatients,
        });
    };

    renderListHeader = () => {
        return (
            <View style={{paddingTop: 6, paddingHorizontal: 8, paddingBottom: 10}}>
                <TextInput style={commonStyles.input}
                           returnKeyType="search"
                           autoCorrect={false}
                           autoCapitalize='none'
                           placeholderTextColor = "#CCCCCC"
                           placeholder={strings.Patients.search}
                           enablesReturnKeyAutomatically={true}
                           paddingRight={12}
                           paddingLeft={12}
                           onChangeText={this.filterPatients}
                />
            </View>
        );
    };

    renderListEmpty = () => {
        return (
            <View style={commonStyles.emptyScreen}>
                <Text>{strings.Patients.noPatients}</Text>
            </View>
        )
    }

    renderItem = ({item}) => {
        return (
            <TouchableOpacity onPress={() => this.selectPatient(item)}>
                <Card style={styles.patientItemContainer}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <View style={{flex: 1}}>
                            <Text style={commonStyles.smallInfoText}>{item.gender?.charAt(0).toUpperCase()}, {item.age} {strings.Patients.yo}</Text>
                            <Text style={commonStyles.titleText}>{item.fullName}</Text>
                        </View>
                        <Icon type="SimpleLineIcons" name="arrow-right" />
                    </View>
                </Card>
            </TouchableOpacity>
        )
    };

    render() {

        const patients = this.state.filteredPatients ?? this.state.patients;

        return (
            <View style={styles.container}>
                <FlatList style={styles.list}
                          data={patients}
                          renderItem={this.renderItem}
                          ListHeaderComponent={this.renderListHeader}
                          keyExtractor={item => item.id}
                          onRefresh={this.getData}
                          refreshing={false}
                          ItemSeparatorComponent={renderSeparator}
                          ListEmptyComponent={this.renderListEmpty}
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

    patientItemContainer: {
        padding: 12,
        paddingRight: 0,
    },
});
