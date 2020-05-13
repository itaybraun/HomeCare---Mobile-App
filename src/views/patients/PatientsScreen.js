import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput, Image} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {Patient} from '../../models/Patient';
import MenuButton from '../menu/MenuButton';
import Loading from '../../support/Loading';
import {strings} from '../../localization/strings';
import { Card, Icon, Text } from 'native-base';
import {commonStyles, renderDisclosureIndicator, renderLoading, renderSeparator} from '../../support/CommonStyles';
import APIRequest from '../../models/APIRequest';

export default class PatientsScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Patients.title,
            // headerLeft: () =>
            //     <MenuButton />
            // ,
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
            <View style={{margin: 10}}>
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

    renderListFooter = () => {
        return (
            <View style={{height: 10}} />
        );
    };

    renderListEmpty = () => {
        return (
            <View style={commonStyles.emptyScreen}>
                <Text style={commonStyles.smallContentText}>{strings.Patients.noPatients}</Text>
            </View>
        )
    };

    renderItem = ({item}) => {

        const patient: Patient = item;

        let patientGenderAndAge = [];
        if (patient.gender)
            patientGenderAndAge.push(patient.gender.charAt(0).toUpperCase());
        if (patient.age)
            patientGenderAndAge.push(patient.age + ' ' + strings.Patients.yo);
        patientGenderAndAge = patientGenderAndAge.join(", ");

        const userAvatar = patient.avatar || require('../../assets/icons/patients/user.png');

        return (
            <TouchableOpacity
                style={commonStyles.listItemContainer}
                onPress={() => this.selectPatient(item)}>
                <Card style={commonStyles.cardStyle}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Image source={userAvatar} />
                        <View style={{flex: 1, marginLeft: 15,}}>
                            <Text style={commonStyles.titleText}>{patient.fullName}</Text>
                            {
                                !patientGenderAndAge.isEmpty() &&
                                <Text style={[commonStyles.smallInfoText, {marginTop: 5, marginLeft: 0}]}>{patientGenderAndAge}</Text>
                            }
                        </View>
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
                          contentContainerStyle={{ flexGrow: 1, }}
                          data={patients}
                          renderItem={this.renderItem}
                          ListHeaderComponent={this.renderListHeader}
                          ListFooterComponent={this.renderListFooter}
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
    },

    patientItemContainer: {
        borderRadius: 4,
        padding: 12,
        paddingRight: 0,
    },
});
