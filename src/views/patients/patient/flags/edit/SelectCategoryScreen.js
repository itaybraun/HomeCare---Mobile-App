import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard, ScrollView,
} from 'react-native';
import AppScreen from '../../../../../support/AppScreen';
import {
    appColors,
    commonStyles, popupNavigationOptions,
    renderDisclosureIndicator,
    renderLoading, renderRadioButton,
    renderSeparator,
} from '../../../../../support/CommonStyles';
import {strings} from '../../../../../localization/strings';
import {Button, Form, Icon, Text, Textarea} from 'native-base';
import {TransitionPresets} from 'react-navigation-stack';

export default class SelectCategoryScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({ navigation }) => {
        return {
            title: strings.Flags.category,
            headerBackTitle: ' ',
            ...popupNavigationOptions,
            ...TransitionPresets.SlideFromRightIOS,
            headerLeft: () => {
                return (
                    <TouchableOpacity style={{paddingHorizontal: 12}} onPress={navigation.getParam('cancel')}>
                        <Text style={[commonStyles.mainColorTitle, commonStyles.medium]}>{strings.Common.cancelButton}</Text>
                    </TouchableOpacity>
                )
            },
            headerRight: () => {
                return (
                    <TouchableOpacity style={{paddingHorizontal: 12}} onPress={navigation.getParam('done')}>
                        <Text style={[commonStyles.mainColorTitle, commonStyles.medium]}>{strings.Common.doneButton}</Text>
                    </TouchableOpacity>
                )
            }
        }
    };

    categories = [
        {key: 'Admin', label: strings.Categories.admin,},
        {key: 'Behavioral', label: strings.Categories.behavioral,},
        {key: 'Clinical', label: strings.Categories.clinical,},
        {key: 'Contact', label: strings.Categories.contact,},
        {key: 'Drug', label: strings.Categories.drug,},
        {key: 'Lab', label: strings.Categories.lab,},
        {key: 'Safety', label: strings.Categories.safety,},
    ];

    state = {
        loading: false,
        categories: this.categories,
        selectedCategory: this.props.navigation.getParam('selectedCategory', null),
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        this.props.navigation.setParams({
            done: this.submit,
            cancel: this.cancel,
            hideTabBar: true,
        });
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    submit = async () => {
        const updateCategory = this.props.navigation.getParam('updateCategory', null);
        updateCategory && updateCategory(this.state.selectedCategory);
        this.pop();
    };

    cancel = () => {
        this.pop();
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    render() {

        return (
            <View style={[commonStyles.screenContainer, {padding: 20}]} onPress={Keyboard.dismiss}>
                {
                    this.state.categories.map((category, index) => {

                        return(
                            <TouchableOpacity
                                key={index}
                                onPress={() => this.setState({
                                    selectedCategory: category.key,
                                })}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    {renderRadioButton(this.state.selectedCategory === category.key)}
                                    <Text style={[commonStyles.contentText, {flex: 1, marginLeft: 10}]}>{category.label}</Text>
                                </View>
                                {renderSeparator()}
                            </TouchableOpacity>
                        );
                    })
                }
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
