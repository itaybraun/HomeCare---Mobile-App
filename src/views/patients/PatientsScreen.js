import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {Patient} from '../../models/Patient';
import MenuButton from '../menu/MenuButton';
import Loading from '../../support/Loading';
import {APIRequest} from '../../api/API';
import {strings} from '../../localization/strings';
import { Card, Icon, Text } from 'native-base';
import {commonStyles, renderDisclosureIndicator, renderLoading, renderSeparator} from '../../support/CommonStyles';

export default class PatientsScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Patients.title,
            headerLeft: () =>
                <MenuButton />
            ,
        }
    };

    state = {
        loading: false,
        patients: [],
        filteredPatients: null,
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

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

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    selectPatient = (patient) => {
        this.navigateTo('Patient', {patient: patient});
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

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

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
    };

    renderItem = ({item}) => {

        let patientGenderAndAge = [];
        if (item.gender)
            patientGenderAndAge.push(item.gender.charAt(0).toUpperCase());
        if (item.age)
            patientGenderAndAge.push(item.age + ' ' + strings.Patients.yo);
        patientGenderAndAge = patientGenderAndAge.join(", ");

        return (
            <TouchableOpacity onPress={() => this.selectPatient(item)}>
                <Card style={commonStyles.cardStyle}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <View style={{flex: 1}}>
                            {
                                !patientGenderAndAge.isEmpty() &&
                                <Text style={commonStyles.smallInfoText}>{patientGenderAndAge}</Text>
                            }
                            <Text style={commonStyles.titleText}>{item.fullName}</Text>
                        </View>
                        {renderDisclosureIndicator()}
                    </View>
                </Card>
            </TouchableOpacity>
        )
    };

    render() {

        const patients = this.state.filteredPatients || this.state.patients;

        return (
            <View style={commonStyles.screenContainer}>
                <FlatList style={styles.list}
                          contentContainerStyle={{ flexGrow: 1 }}
                          data={patients}
                          renderItem={this.renderItem}
                          ListHeaderComponent={this.renderListHeader}
                          keyExtractor={item => item.id}
                          onRefresh={this.getData}
                          refreshing={false}
                          ItemSeparatorComponent={() => renderSeparator()}
                          ListEmptyComponent={this.renderListEmpty}
                />
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({

    list: {
        flex: 1,
        padding: 10,
    },

    patientItemContainer: {
        borderRadius: 4,
        padding: 12,
        paddingRight: 0,
    },
});
