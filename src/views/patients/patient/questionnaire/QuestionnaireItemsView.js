import React, {Component} from 'react';
import {QuestionnaireItem, } from '../../../../models/Questionnaire';
import {Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {appColors, commonStyles, renderRadioButton, renderSeparator} from '../../../../support/CommonStyles';
import {strings} from '../../../../localization/strings';
import PatientProfile from '../PatientProfile';
import PropTypes from 'prop-types';
import FormItemContainer from '../../../other/FormItemContainer';
import {Icon} from "native-base";
import ImagePicker from 'react-native-image-picker';

export default class QuestionnaireItemsView extends Component {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    state = {
        loading: false,
        values: {},
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        this.setState({
            values: this.props.values || {},
        });
    }

    componentWillUnmount(): void {
        this.props.valuesUpdate && this.props.valuesUpdate(this.state.values);
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    uploadImage = (image) => {
        ImagePicker.showImagePicker((response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                //console.log('User cancelled image picker');
            } else if (response.error) {
                //console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                //console.log('User tapped custom button: ', response.customButton);
            } else {
                const source = { uri: response.uri };
                // You can also display the image using data:
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };

                let images = this.state.values.images || [];
                images.push(source);
                this.updateValues('images', images);
            }
        });
    };

    updateValues = (name, value) => {
        let values = this.state.values;
        values[name] = value;
        this.setState({values: values});
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderQuestionnaireItem = (item: QuestionnaireItem, depth = 0) => {

        switch(item.type) {
            case 'group':
                return this.renderGroup(item, depth);
            case 'choice':
                return this.renderChoice(item, depth);
            case 'decimal':
                return this.renderDecimal(item, depth);
            case 'string':
                return this.renderString(item, depth);
            case 'boolean':
                return this.renderBoolean(item, depth);
            case 'url':
                return this.renderImage(item);
        }
    };

    renderGroup = (item: QuestionnaireItem, depth = 0) => {
        depth++;
        return (
            <View key={item.link}>
                <View style={commonStyles.pinkHeader}>
                    <Text style={commonStyles.pinkHeaderText}>{item.text}</Text>
                </View>
                {
                    item.items && item.items.map(item => this.renderQuestionnaireItem(item, depth))
                }
            </View>
        )
    };

    renderChoice = (item: QuestionnaireItem, depth = 0) => {
        return (
            <View key={item.link} style={{marginHorizontal: 20 * depth, marginTop: 5, marginBottom: 10}}>
                <Text style={{fontWeight: 'bold'}}>{item.text}</Text>
                {
                    item.options && item.options.map(option => {
                        return (
                            <TouchableOpacity onPress={() => this.updateValues(item.link, option)}>
                                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 3}}>
                                    {renderRadioButton(this.state.values[item.link] === option)}
                                    <Text style={{marginLeft: 10}}>{option.text}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
            </View>
        );
    };

    renderDecimal = (item: QuestionnaireItem, depth = 0) => {
        return (
            <View key={item.link} style={{marginHorizontal: 20 * depth, marginTop: 5, marginBottom: 10 }}>
                <Text style={{fontWeight: 'bold'}}>{item.text}</Text>
                <TextInput
                    style={{borderWidth: 1, height: 30, paddingHorizontal: 5,}}
                    value={this.state.values[item.link]}
                    keyboardType='numeric'
                    onChangeText={text => this.updateValues(item.link, text)}
                />
            </View>
        )
    };

    renderString = (item: QuestionnaireItem, depth = 0) => {
        return (
            <View key={item.link} style={{marginHorizontal: 20 * depth, marginTop: 5, marginBottom: 10 }}>
                <Text style={{fontWeight: 'bold'}}>{item.text}</Text>
                <TextInput
                    style={{borderWidth: 1, height: 30, paddingHorizontal: 5,}}
                    value={this.state.values[item.link]}
                    onChangeText={text => this.updateValues(item.link, text)}
                />
            </View>
        )
    };

    renderBoolean = (item: QuestionnaireItem, depth = 0) => {
        return (
            <View key={item.link} style={{marginHorizontal: 20 * depth, marginTop: 5, marginBottom: 10}}>
                <Text style={{fontWeight: 'bold'}}>{item.text}</Text>

                <TouchableOpacity onPress={() => this.updateValues(item.link, true)}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 3}}>
                        {renderRadioButton(this.state.values[item.link] === true)}
                        <Text style={{marginLeft: 10}}>{strings.Common.yesButton}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => this.updateValues(item.link, false)}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 3}}>
                        {renderRadioButton(this.state.values[item.link] === false)}
                        <Text style={{marginLeft: 10}}>{strings.Common.noButton}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    };

    renderImage = (item: QuestionnaireItem) => {
        return (
            <View key={item.link}>
                <View style={commonStyles.pinkHeader}>
                    <Text style={commonStyles.pinkHeaderText}>{item.text}</Text>
                </View>

                <View style={{margin: 10}}>
                    <FormItemContainer
                        title={item.text}
                        bottomInfo={strings.Questionnaire.upTo3Images}>
                        <View style={{flexDirection: 'row', padding: 20,}}>
                            {this.state.values.images?.map((image, index) => this.renderImageContainer(image, index))}
                            {(!this.state.values.images || this.state.values.images?.length <= 2) && this.renderImageContainer()}
                        </View>
                    </FormItemContainer>
                </View>
            </View>
        );
    };

    renderImageContainer = (image = null, index = null) => {

        return (
            <TouchableOpacity
                style={styles.imageContainer}
                onPress={() => image ? this.showImage(image) : this.uploadImage()}>
                {
                    image ?
                        <Image key={index} style={{width: 100, height: 70}} source={image} /> :
                        <View key='add' style={{paddingHorizontal: 5,}}>
                            <Icon type="Feather" name="plus" style={{fontSize: 36, color: appColors.linkColor, paddingTop: 4}}/>
                        </View>
                }
            </TouchableOpacity>
        )
    };

    render() {

        const items = this.props.items;

        if (!items || items.length === 0) {
            return null;
        }

        return (
            <View>
                {items.map(item => this.renderQuestionnaireItem(item))}
            </View>
        );
    }
}

QuestionnaireItemsView.propTypes = {
    items: PropTypes.array.isRequired,
    values: PropTypes.object,
    valuesUpdate: PropTypes.func,
};

const styles = StyleSheet.create({
    imageContainer: {
        height: 70,
        maxWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        borderWidth: 2,
        overflow: 'visible',
        marginRight: 10,
        borderColor: appColors.linkColor,
    }
});
