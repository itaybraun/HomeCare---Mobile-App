import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import AppScreen from '../../../../support/AppScreen';
import {strings} from '../../../../localization/strings';
import {appColors} from '../../../../support/CommonStyles';
import FormItemContainer from '../../../other/FormItemContainer';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import {Icon, Form, Input, Picker, Textarea, Text, Button} from 'native-base';

export default class AddFlagScreen extends AppScreen {

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Flags.newFlag,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        category: undefined,
        text: '',
    };

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();
    }

    getData = async (refresh = true) => {
        this.setState({loading: true});
        this.setState({loading: false});
    };

    render() {
        return (
            <View style={styles.container} >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <KeyboardAwareScrollView
                        style={{flex: 1}}
                        contentContainerStyle={{padding: 20}}
                        bounces={false}
                        automaticallyAdjustContentInsets={false}>
                        <Form>
                            <FormItemContainer title={strings.Flags.category}>
                                <Picker
                                    mode="dialog"
                                    iosHeader={strings.Flags.category}
                                    iosIcon={<Icon name="ios-arrow-down" style={{color: appColors.linkColor}} />}
                                    selectedValue={this.state.category}
                                    onValueChange={value => this.setState({category: value})}
                                    headerBackButtonText={strings.Common.cancelButton}
                                    style={[styles.formItem, {marginHorizontal: Platform.OS === 'ios' ? -16 : 2,}]}
                                >
                                    <Picker.Item label={strings.Flags.admin} value="admin" />
                                    <Picker.Item label={strings.Flags.behavioral} value="behavioral" />
                                    <Picker.Item label={strings.Flags.clinical} value="clinical" />
                                    <Picker.Item label={strings.Flags.contact} value="contact" />
                                    <Picker.Item label={strings.Flags.drug} value="drug" />
                                    <Picker.Item label={strings.Flags.lab} value="lab" />
                                    <Picker.Item label={strings.Flags.safety} value="safety" />
                                </Picker>
                            </FormItemContainer>

                            <FormItemContainer style={{paddingVertical: 8,}} title={strings.Flags.text}>
                                <Textarea
                                    rowSpan={4}
                                    style={styles.formItem}
                                    autoCorrect={false}
                                    onValueChange={value => this.setState({text: value})}
                                />
                            </FormItemContainer>

                            <FormItemContainer style={{padding: 11, flexDirection: 'row', justifyContent: 'space-between'}} title={strings.Flags.internal}>
                                <Button bordered small rounded>
                                    <Text>YES</Text>
                                </Button>
                                <Button bordered small rounded>
                                    <Text>NO</Text>
                                </Button>
                            </FormItemContainer>

                            <FormItemContainer title={strings.Flags.startDate}>
                                <View style={{height: 40,}}></View>
                            </FormItemContainer>

                            <FormItemContainer title={strings.Flags.endDate}>
                                <View style={{height: 40,}}></View>
                            </FormItemContainer>
                        </Form>
                    </KeyboardAwareScrollView>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    formItem: {
        padding: 0,
        paddingLeft: 11,
        paddingRight: 11,
        fontSize: 16,
    },
});
