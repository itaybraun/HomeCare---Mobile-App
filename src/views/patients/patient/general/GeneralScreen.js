import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Keyboard,
    ScrollView,
    Linking,
    SectionList,
} from 'react-native';
import AppScreen from '../../../../support/AppScreen';
import {appColors, commonStyles, renderLoading, renderSeparator} from '../../../../support/CommonStyles';
import {Patient} from '../../../../models/Patient';
import {strings} from '../../../../localization/strings';
import {Card, Form, Icon, Text} from 'native-base';
import {APIRequest} from '../../../../api/API';
import {Relative} from '../../../../models/Relative';

export default class GeneralScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        const patient: Patient = navigation.getParam('patient', null);
        const title = patient?.fullName;

        return {
            title: title,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        patient: null,
        relatives: [],
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

        const patient: Patient = this.props.navigation.getParam('patient', null);
        const relatives = await this.getRelatives(patient?.id);
        console.log(relatives)

        this.setState({
            patient: patient,
            ...relatives,
            loading: false
        });
    };

    getRelatives = async (patientId) => {
        let result: APIRequest = await this.api.getPatientRelatives(patientId);
        if (result.success) {
            return {relatives: result.data};
        } else {
            this.showError(result.data);
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------



    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderListHeader = () => {

        const patient: Patient = this.state.patient;
        if (!patient) {
            return <View />;
        }

        let patientGenderAndAge = [];
        if (patient.gender)
            patientGenderAndAge.push(patient.gender.charAt(0).toUpperCase());
        if (patient.age)
            patientGenderAndAge.push(patient.age + ' ' + strings.Patients.yo);
        patientGenderAndAge = patientGenderAndAge.join(", ");

        return (
            <View style={{margin: 10, marginBottom: 0}}>
                <Form>
                    <Card style={{padding: 15, marginBottom: 15,}}>
                        <Text style={[commonStyles.titleText]}>{patient.fullName}</Text>
                        {
                            !patientGenderAndAge.isEmpty() &&
                            <Text style={[commonStyles.contentText, {marginTop: 5,}]}>
                                {patientGenderAndAge}
                            </Text>
                        }
                        {
                            patient.phone &&
                            <TouchableOpacity
                                style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}
                                onPress={() => Linking.openURL(`tel:${patient.phone}`) }
                            >
                                <Icon type="Feather" name="phone" style={{fontSize: 24, color: appColors.textColor}}/>
                                <Text style={[{flex: 1, marginLeft: 10,}, commonStyles.contentText]}>{patient.phone}</Text>
                            </TouchableOpacity>
                        }
                        {
                            patient.address &&
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                                <Icon type="Feather" name="map" style={{fontSize: 24, color: appColors.textColor}}/>
                                <Text style={[{flex: 1, marginLeft: 10,}, commonStyles.contentText]}>{patient.simpleAddress}</Text>
                            </View>
                        }
                    </Card>
                </Form>
            </View>
        );
    };

    renderRelative = ({item}) => {
        const relative: Relative = item;

        return (
            <TouchableOpacity
                disabled={true}
                style={commonStyles.listItemContainer}>
                <Card style={commonStyles.cardStyle}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <View style={{flex: 1}}>
                            <Text style={commonStyles.titleText}>{relative.fullName}</Text>
                            <Text style={[commonStyles.smallInfoText, {marginTop: 10}]}>{relative.relationship}</Text>
                        </View>
                        {
                            relative.phone &&
                            <TouchableOpacity
                                style={{flexDirection: 'row', alignItems: 'center', marginLeft: 20}}
                                onPress={() => Linking.openURL(`tel:${relative.phone}`) }
                            >
                                <Icon type="Feather" name="phone" style={{fontSize: 24, color: appColors.textColor}}/>
                            </TouchableOpacity>
                        }
                        {
                            relative.email &&
                            <TouchableOpacity style={{marginRight: 10, marginLeft: 20}}
                                              onPress={() => Linking.openURL(`mailto:${relative.email}`)}>
                                <Icon type="Feather" name="mail"
                                      style={{fontSize: 30, color: appColors.textColor}}/>
                            </TouchableOpacity>
                        }
                    </View>
                </Card>
            </TouchableOpacity>
        )
    }

    renderListFooter = () => {
        return <View/>
    };

    render() {

        let data = [];

        if (this.state.relatives && this.state.relatives.length > 0) {
            data.push({
                title:  strings.Patient.relatedPeople,
                data: this.state.relatives,
            })
        }

        return (
            <View style={commonStyles.screenContainer} onPress={Keyboard.dismiss}>
                <SectionList contentContainerStyle={{flexGrow: 1}}
                             sections={data}
                             bounces={false}
                             renderItem={this.renderRelative}
                             ListHeaderComponent={this.renderListHeader}
                             ListFooterComponent={this.renderListFooter}
                             keyExtractor={item => item.id}
                             ItemSeparatorComponent={() => renderSeparator()}
                             renderSectionHeader={({section: {title}}) => (
                                 <View>
                                     <Text style={[commonStyles.yellowText, {marginLeft: 10, marginBottom: 5}]}>{title}</Text>
                                 </View>
                             )}
                />
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
