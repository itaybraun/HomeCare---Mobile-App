import React, {Component} from 'react';
import {QuestionnaireItem, } from '../../../../models/Questionnaire';
import {Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {appColors, commonStyles, renderRadioButton, renderSeparator} from '../../../../support/CommonStyles';
import {strings} from '../../../../localization/strings';
import PropTypes from 'prop-types';
import FormItemContainer from '../../../other/FormItemContainer';
import {Content, Icon} from 'native-base';
import ImagePicker from 'react-native-image-picker';

export default class QuestionnaireItemsView extends Component {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    state = {
        loading: false,
        values: this.props.values,
        errors: this.props.errors,
    };

    items = {};

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    async componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
        if (this.props.errors !== prevProps.errors) {

            // set errors and then scroll to the first one
            await this.setState({
                errors: this.props.errors,
            });

            let keys = Object.keys(this.state.errors);
            if (keys.length > 0) {
                const layout = this.items[keys[0]];
                if (layout)
                    this.scrollView.props.scrollToPosition(0, layout.y, true);
            }
        }
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    showImage = (image) => {

    }

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

        let errors = this.state.errors;
        errors[name] = false;
        this.setState({
            values: values,
            errors: errors,
        });

        this.props.valuesUpdate && this.props.valuesUpdate(this.state.values);
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
            case 'integer':
                return this.renderInteger(item, depth);
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
            <View key={item.link}
                  onLayout={({nativeEvent}) => this.items[item.link] = nativeEvent.layout}>
                <View style={commonStyles.pinkHeader}>
                    <Text style={commonStyles.pinkHeaderText}>{item.text}</Text>
                </View>
                {
                    item.items && item.items.map(item => this.renderQuestionnaireItem(item, depth))
                }
            </View>
        )
    };

    renderTitle = (item: QuestionnaireItem) => {
        return (
            <Text style={[
                commonStyles.boldTitleText,
                this.state.errors[item.link] ? {color: '#FF0000'} : {}]
            }>
                {item.text}
            </Text>
        );
    };

    renderChoice = (item: QuestionnaireItem, depth = 0) => {
        return (
            <FormItemContainer key={item.link}
                               onLayout={({nativeEvent}) => this.items[item.link] = nativeEvent.layout}
                               error={this.state.errors[item.link]}
                               style={{paddingHorizontal: 20 * depth, borderWidth: 0}}>
                {this.renderTitle(item)}
                {
                    item.options && item.options.map(option => {
                        return (
                            <TouchableOpacity key={option.id} onPress={() => this.updateValues(item.link, option)}>
                                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 3}}>
                                    {renderRadioButton(this.state.values[item.link] === option)}
                                    <Text style={[commonStyles.formItemText, {marginLeft: 10}]}>{option.text}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
            </FormItemContainer>
        );
    };

    renderInteger = (item: QuestionnaireItem, depth = 0) => {
        return (
            <FormItemContainer key={item.link}
                               onLayout={({nativeEvent}) => this.items[item.link] = nativeEvent.layout}
                               error={this.state.errors[item.link]}
                               style={{paddingHorizontal: 20 * depth, borderWidth: 0}}>
                {this.renderTitle(item)}
                <TextInput
                    style={{borderWidth: 1, fontSize: 18, height: 40, paddingHorizontal: 5,}}
                    value={this.state.values[item.link]}
                    keyboardType='numeric'
                    onChangeText={text => {
                        text = text.isEmpty() ? null : text;
                        if (text)
                            text = parseInt(text).toString();
                        this.updateValues(item.link, text)
                    }}
                />
            </FormItemContainer>
        )
    };

    renderDecimal = (item: QuestionnaireItem, depth = 0) => {
        return (
            <FormItemContainer key={item.link}
                               onLayout={({nativeEvent}) => this.items[item.link] = nativeEvent.layout}
                               error={this.state.errors[item.link]}
                               style={{paddingHorizontal: 20 * depth, borderWidth: 0}}>
                {this.renderTitle(item)}
                <TextInput
                    style={{borderWidth: 1, fontSize: 18, height: 40, paddingHorizontal: 5,}}
                    value={this.state.values[item.link]}
                    keyboardType='numeric'
                    onChangeText={text => {
                        text = text.isEmpty() ? null : text;
                        this.updateValues(item.link, text)
                    }}
                />
            </FormItemContainer>
        )
    };

    renderString = (item: QuestionnaireItem, depth = 0) => {
        return (
            <FormItemContainer key={item.link}
                               onLayout={({nativeEvent}) => this.items[item.link] = nativeEvent.layout}
                               error={this.state.errors[item.link]}
                               style={{paddingHorizontal: 20 * depth, borderWidth: 0}}>
                {this.renderTitle(item)}
                <TextInput
                    style={{borderWidth: 1, fontSize: 18, height: 40, paddingHorizontal: 5,}}
                    value={this.state.values[item.link]}
                    onChangeText={text => {
                        text = text.isEmpty() ? null : text;
                        this.updateValues(item.link, text)
                    }}
                />
            </FormItemContainer>
        )
    };

    renderBoolean = (item: QuestionnaireItem, depth = 0) => {
        return (
            <FormItemContainer key={item.link}
                               onLayout={({nativeEvent}) => this.items[item.link] = nativeEvent.layout}
                               error={this.state.errors[item.link]}
                               style={{paddingHorizontal: 20 * depth, borderWidth: 0}}>
                {this.renderTitle(item)}

                <TouchableOpacity onPress={() => this.updateValues(item.link, true)}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 3}}>
                        {renderRadioButton(this.state.values[item.link] === true)}
                        <Text style={[commonStyles.formItemText, {marginLeft: 10}]}>{strings.Common.yesButton}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => this.updateValues(item.link, false)}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 3}}>
                        {renderRadioButton(this.state.values[item.link] === false)}
                        <Text style={[commonStyles.formItemText, {marginLeft: 10}]}>{strings.Common.noButton}</Text>
                    </View>
                </TouchableOpacity>
            </FormItemContainer>
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
                        <Content horizontal style={{flexDirection: 'row', padding: 0,}} contentContainerStyle={{padding: 10}}>
                            {this.state.values.images?.map((image, index) => this.renderImageContainer(image, index))}
                            {(!this.state.values.images || this.state.values.images?.length <= 2) && this.renderImageContainer()}
                        </Content>
                    </FormItemContainer>
                </View>
            </View>
        );
    };

    renderImageContainer = (image = null, index = null) => {

        return (
            <TouchableOpacity
                key={index}
                style={styles.imageContainer}
                onPress={() => image ? this.showImage(image) : this.uploadImage()}>
                {
                    image ?
                        <Image style={{width: 90, height: 70}} source={image} /> :
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
            <Content innerRef={ref => this.scrollView = ref}
                     enableResetScrollToCoords={false}
                     bounces={false}>
                {items.map(item => this.renderQuestionnaireItem(item))}
            </Content>
        );
    }
}

QuestionnaireItemsView.propTypes = {
    items: PropTypes.array.isRequired,
    values: PropTypes.object,
    errors: PropTypes.object,
    valuesUpdate: PropTypes.func,
};

const styles = StyleSheet.create({
    imageContainer: {
        height: 70,
        maxWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        borderWidth: 2,
        overflow: 'visible',
        marginRight: 10,
        borderColor: appColors.linkColor,
    },
});
