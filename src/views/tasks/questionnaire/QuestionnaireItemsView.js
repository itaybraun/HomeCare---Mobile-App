import React, {Component} from 'react';
import {QuestionnaireItem, } from '../../../models/Questionnaire';
import {ActivityIndicator, Image, Platform, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {appColors, commonStyles, renderRadioButton, renderSeparator} from '../../../support/CommonStyles';
import {strings} from '../../../localization/strings';
import PropTypes from 'prop-types';
import FormItemContainer from '../../other/FormItemContainer';
import {Content, List, Icon, Text, Switch, Body, Right} from 'native-base';
import ImagePicker from 'react-native-image-picker';
import ListItemContainer from '../../other/ListItemContainer';
import {Utils} from '../../../support/Utils';

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

            // let keys = Object.keys(this.state.errors);
            // if (keys.length > 0) {
            //     const layout = this.items[keys[0]];
            //     if (layout)
            //         this.scrollView.props.scrollToPosition(0, layout.y, true);
            // }
        }

    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    addImage = (item: QuestionnaireItem, index: Number) => {
        ImagePicker.showImagePicker((response) => {
            console.log('Response = ', response);

            let images = this.state.values[item.link] || [];
            images.splice(index, 1);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                let images = this.state.values[item.link] || [];
                let path = Platform.OS === 'ios' ? response.uri.replace("file://", "") : "file://"+response.path;
                images[index] = path;
            }

            this.updateValues(item.link, images);
        });

        let images = this.state.values[item.link] || [];
        images[index] = true;
        this.updateValues(item.link, images);

    };

    removeImage = (item: QuestionnaireItem, index: Number,) => {
        let images = this.state.values[item.link] || [];
        images.splice(index, 1);
        this.updateValues(item.link, images);
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

    selectItem = (item: QuestionnaireItem) => {
        this.props.selectItem && this.props.selectItem(item);
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderQuestionnaireItem = (item: QuestionnaireItem) => {

        switch(item.type) {
            case 'group':
                return this.renderGroup(item);
            case 'choice':
                return this.renderItem(item);
            case 'integer':
                return this.renderItem(item);
            case 'decimal':
                return this.renderItem(item);
            case 'string':
                return this.renderItem(item);
            case 'boolean':
                return this.renderBoolean(item);
            case 'url':
                return this.renderImage(item);
        }
    };

    renderGroup = (item: QuestionnaireItem) => {
        return (
            <View key={item.link}
                  onLayout={({nativeEvent}) => this.items[item.link] = nativeEvent.layout}>
                <View style={{paddingHorizontal: 10, paddingVertical: 10,}}>
                    <Text style={commonStyles.questionnaireTitle}>{item.text}</Text>
                </View>
                <List>
                {item.items && item.items.length > 0 &&
                    <View style={{paddingBottom: 10}}>
                        {item.items.map(item => this.renderQuestionnaireItem(item))}
                    </View>
                }
                </List>
            </View>
        )
    };

    renderItem = (item: QuestionnaireItem) => {

        let value = this.state.values[item.link];

        if (value && item.type === 'choice') {
            value = value.text;
        }

        return (
            <ListItemContainer key={item.link}
                               onLayout={({nativeEvent}) => this.items[item.link] = nativeEvent.layout}
                               error={this.state.errors[item.link]}
                               onPress={() => this.selectItem(item)}
            >

                {value != null ?
                    <Body>
                        <View style={{minHeight: 45, justifyContent: 'center'}}>
                            <Text
                                style={[commonStyles.smallInfoText, {marginBottom: 5,}]}>{item.text}</Text>
                            <Text
                                style={[commonStyles.formItemText]}>{value}</Text>
                        </View>
                    </Body> :

                    <Body>
                        <View style={{minHeight: 45, justifyContent: 'center'}}>
                            <Text
                                style={[commonStyles.infoText, this.state.errors[item.link] && {color: '#FF0000'}]}>
                                {item.text}
                            </Text>
                        </View>
                    </Body>
                }
                <Right>
                    <Icon name="arrow-forward"/>
                </Right>
            </ListItemContainer>
        );
    };

    renderBoolean = (item: QuestionnaireItem) => {

        // little hack for boolean properties. Set it to false initially
        if (this.state.values[item.link] === undefined) {
            this.updateValues(item.link, false);
        }

        return (
            <ListItemContainer key={item.link}
                               onLayout={({nativeEvent}) => this.items[item.link] = nativeEvent.layout}
                               error={this.state.errors[item.link]}
                               style={{borderWidth: 0}}>
                <Body>
                    <View style={{minHeight: 48, justifyContent: 'center'}}>
                        <Text style={[commonStyles.infoText]}>
                            {item.text}
                        </Text>
                    </View>
                </Body>

                <Right>
                    <Switch value={this.state.values[item.link]}
                            trackColor={{true: Utils.shadeBlend(0.3, appColors.questionnaireColor)}}
                            thumbColor={this.state.values[item.link] && Platform.OS === 'android' ? appColors.questionnaireColor : null}
                            onValueChange={(value) => {
                                this.updateValues(item.link, value);
                            }}/>
                </Right>


            </ListItemContainer>
        )
    };

    renderImage = (item: QuestionnaireItem) => {

        let images = this.state.values[item.link]?.map(i => i) || [];
        if (images.length <= 2) {
            images.push(null);
        }

        return (
            <ListItemContainer key={item.link}>
                <Body>

                    <Text style={commonStyles.infoText}>{item.text}</Text>

                    <View style={{margin: 10}}>
                        <Content horizontal style={{flexDirection: 'row', padding: 0,}}
                                 bounces={false}
                        >
                            {
                                images.map((image, index) => {
                                    return (
                                        <View key={index}>
                                            <TouchableOpacity

                                                style={styles.imageContainer}
                                                onPress={() => image ? this.removeImage(item, index) : this.addImage(item, index)}>
                                                {
                                                    image ?
                                                        <View style={{overflow: 'visible',}}>
                                                            {
                                                                image === true ?
                                                                    <View style={{
                                                                        width: 64,
                                                                        height: 64,
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center'
                                                                    }}>
                                                                        <ActivityIndicator/>
                                                                    </View>
                                                                    :
                                                                    <View style={{overflow: 'visible',}}>
                                                                        <Image style={{width: 64, height: 64}}
                                                                               source={{uri: image}}/>

                                                                    </View>
                                                            }

                                                        </View>
                                                        :
                                                        <View key='add' style={{paddingHorizontal: 5,}}>
                                                            <Icon type="Feather" name="plus" style={{
                                                                fontSize: 24,
                                                                color: appColors.questionnaireColor,
                                                                paddingTop: 4
                                                            }}/>
                                                        </View>
                                                }
                                                {
                                                    (typeof image === 'string') &&
                                                    <View style={{
                                                        backgroundColor: 'red', position: 'absolute',
                                                        width: 16, height: 16, borderRadius: 8, right: -8, top: -8,
                                                        alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <Icon style={{color: 'white', marginTop: -1, fontSize: 16}}
                                                              name='remove' type='FontAwesome'/>
                                                    </View>


                                                }
                                            </TouchableOpacity>

                                        </View>
                                    )
                                })
                            }
                        </Content>
                    </View>
                </Body>
            </ListItemContainer>
        );
    };

    render() {

        const items = this.props.items;

        if (!items || items.length === 0) {
            return null;
        }

        return (
            <View innerRef={ref => this.scrollView = ref}
                     enableResetScrollToCoords={false}
                     bounces={false}>
                    {items.map(item => this.renderQuestionnaireItem(item))}
            </View>
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
        height: 64,
        width: 64,
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        overflow: 'visible',
        marginRight: 10,
        borderColor: appColors.infoColor,
    },
});
