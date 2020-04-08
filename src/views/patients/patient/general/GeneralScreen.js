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
    SectionList, Image,
} from 'react-native';
import AppScreen from '../../../../support/AppScreen';
import {appColors, commonStyles, renderLoading, renderSeparator} from '../../../../support/CommonStyles';
import {Patient} from '../../../../models/Patient';
import {strings} from '../../../../localization/strings';
import {Body, Card, Container, Content, Form, Icon, List, ListItem, Right, Text} from 'native-base';
import {APIRequest} from '../../../../api/API';
import {Relative} from '../../../../models/Relative';

export default class GeneralScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        return {
            title: strings.General.title,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        patient: this.props.navigation.getParam('patient', null),
        relatives: [],
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        //this.getData();
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        this.setState({loading: true});

        const patient: Patient = this.props.navigation.getParam('patient', null);
        const relatives = await this.getRelatives(patient?.id);

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

    showRelatedPersons = () => {

    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render = () => {

        const patient: Patient = this.state.patient;
        if (!patient) {
            return <View />;
        }

        const userAvatar = patient.avatar || require('../../../../assets/icons/patients/user.png');

        return (
            <Container style={commonStyles.screenContainer}>
                <Content bounces={false}>
                    <View style={{flexDirection: 'row', alignItems: 'center', padding: 20,}}>
                        <Image source={userAvatar}/>
                        <View style={{flex: 1, marginLeft: 15,}}>
                            <Text style={commonStyles.mainColorTitle}>{patient.fullName}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20}}>
                        {
                            patient.phone &&
                            <TouchableOpacity
                                style={{flexDirection: 'row', alignItems: 'center', marginLeft: 20}}
                                onPress={() => Linking.openURL(`tel:${patient.phone}`) }
                            >
                                <Icon type="Feather" name="phone" style={{fontSize: 28, color: appColors.textColor}}/>
                            </TouchableOpacity>
                        }
                        {
                            patient.address &&
                            <TouchableOpacity
                                style={{flexDirection: 'row', alignItems: 'center', marginLeft: 20}}
                            >
                                <Icon type="Feather" name="map" style={{fontSize: 28, color: appColors.textColor}}/>
                            </TouchableOpacity>
                        }
                        {
                            patient.email &&
                            <TouchableOpacity style={{marginRight: 0, marginLeft: 20}}
                                              onPress={() => Linking.openURL(`mailto:${patient.email}`)}>
                                <Icon type="Feather" name="mail"
                                      style={{fontSize: 28, color: appColors.textColor}}/>
                            </TouchableOpacity>
                        }
                    </View>
                    <List>
                        <ListItem>
                            <Body>
                                <Text
                                    style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.General.patientId}</Text>
                                <Text
                                    style={[{flex: 1}, commonStyles.formItemText]}>{patient.id}</Text>
                            </Body>
                        </ListItem>

                        <ListItem>
                            <Body>
                                <Text
                                    style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.General.age}</Text>
                                <Text
                                    style={[{flex: 1}, commonStyles.formItemText]}>{patient.age}</Text>
                            </Body>
                        </ListItem>

                        <ListItem>
                            <Body>
                                <Text
                                    style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.General.gender}</Text>
                                <Text
                                    style={[{flex: 1}, commonStyles.formItemText]}>{patient.gender?.capitalize()}</Text>
                            </Body>
                        </ListItem>

                        <ListItem>
                            <Body>
                                <Text
                                    style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.General.identifier}</Text>
                                <Text
                                    style={[{flex: 1}, commonStyles.formItemText]}>{patient.identifier}</Text>
                            </Body>
                        </ListItem>

                        <ListItem>
                            <Body>
                                <Text
                                    style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{strings.General.address}</Text>
                                <Text
                                    style={[{flex: 1}, commonStyles.formItemText]}>{patient.simpleAddress}</Text>
                            </Body>
                        </ListItem>

                        <ListItem onPress={this.showRelatedPersons}>
                            <Body>
                                <Text
                                    style={[{flex: 1, marginVertical: 10}, commonStyles.formItemText]}>{strings.General.relatedPersons}</Text>
                            </Body>
                            <Right>
                                <Icon name="arrow-forward"/>
                            </Right>
                        </ListItem>
                    </List>
                </Content>
            </Container>
        );
    };
}

const styles = StyleSheet.create({

});
