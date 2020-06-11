import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView, Image, FlatList, SafeAreaView, KeyboardAvoidingView, TouchableHighlight,
} from 'react-native';
import AppScreen from '../../../../support/AppScreen';
import {strings} from '../../../../localization/strings';
import {
    appColors,
    commonStyles,
    popupNavigationOptions,
    renderEditDeleteRowButtons,
    renderLoading,
} from '../../../../support/CommonStyles';
import FormItemContainer from '../../../other/FormItemContainer';
import {
    Body,
    Button,
    Container,
    Content,
    ActionSheet,
    Icon,
    Left,
    List,
    ListItem,
    Text,
    Textarea,
    Right,
} from 'native-base';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import {uses24HourClock} from "react-native-localize";
import {Condition, ConditionNote} from '../../../../models/Condition';
import {authorize} from 'fhirclient/lib/smart';
import {SwipeListView} from 'react-native-swipe-list-view';
import {Patient} from '../../../../models/Patient';

export default class ConditionNotesScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        return {
            title: strings.Conditions.notes,
            headerBackTitle: ' ',
            ...popupNavigationOptions,
            headerLeft: () => {
                return (
                    <TouchableOpacity style={{paddingHorizontal: 12}} onPress={navigation.getParam('cancel')}>
                        <Icon type="Ionicons" name="md-close"
                              style={{fontSize: 24, color: 'black'}}/>
                    </TouchableOpacity>
                )
            },
        }
    };

    state = {
        loading: false,
        condition: this.props.navigation.getParam('condition', null),
        notes: this.props.navigation.getParam('condition', null)?.notes || [],
        newNoteText: null,
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();

        console.log(this.state.condition);


        this.props.navigation.setParams({
            cancel: this.cancel,
            hideTabBar: true,
        });

        this.list._listView.scrollToEnd({animated: true});
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    cancel = () => {
        this.pop();
    };

    addNote = async () => {
        Keyboard.dismiss();

        let newNote = new ConditionNote();
        newNote.authorId = this.api.user.id;
        newNote.authorName = this.api.user.fullName;
        newNote.text = this.state.newNoteText?.trim();
        newNote.time = new Date();

        let notes = this.state.notes;
        notes.push(newNote);
        let condition: Condition = this.state.condition;
        condition.notes = notes;

        this.setState({loading: true});
        this.api.editCondition(condition);
        this.setState({loading: false});

        const updateCondition = this.props.navigation.getParam('updateCondition', null);
        updateCondition && updateCondition(condition);

        await this.setState({
            condition: condition,
            notes: notes,
            newNoteText: null,
        });

        this.list._listView.scrollToEnd({animated: true});
    };

    closeRow = () => {
        this.list.closeAllOpenRows()
    };

    editNote = async (item, rowMap) => {
        this.closeRow();
    };

    deleteNote = async (item, rowMap) => {
        this.showAlert(strings.Conditions.deleteNote, null, [
            {
                text: strings.Common.noButton,
                style: 'cancel',
                onPress: () => {
                    this.closeRow();
                }
            },
            {
                text: strings.Common.yesButton,
                style: 'destructive',
                onPress: async () => {
                    let notes = this.state.notes;
                    const index = notes.indexOf(item);
                    if (index ===  -1)
                        return;
                    notes.splice(index, 1);

                    let condition: Condition = this.state.condition;
                    condition.notes = notes;

                    this.setState({loading: true});
                    this.api.editCondition(condition);
                    this.setState({loading: false});

                    const updateCondition = this.props.navigation.getParam('updateCondition', null);
                    updateCondition && updateCondition(condition);

                    this.setState({
                        condition: condition,
                        notes: notes,
                    });

                    try {
                        this.closeRow();
                    } catch(error) {}
                },
            }
        ]);
    };

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderNote = ({item, index}) => {
        let note: ConditionNote = item;
        return (
            <TouchableHighlight style={commonStyles.listItemContainer}
                                underlayColor='#FFFFFFFF'
                                activeOpacity={0.3}
                                onPress={() => this.editNote(item)}
            >
                <View style={{backgroundColor: '#FFFFFF'}}>
                    <ListItem>
                        <Body>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
                                <Text style={[{flex: 1}, commonStyles.smallInfoText]}>
                                    {moment(note.time).format('MMM DD YYYY | HH:mm:ss')}
                                </Text>
                                <Text style={[{flex: 1}, commonStyles.smallInfoText]}>
                                    {note.authorName}
                                </Text>
                            </View>
                            <Text style={[{flex: 1}, commonStyles.formItemText]}>
                                {note.text}
                            </Text>
                        </Body>
                    </ListItem>
                </View>
            </TouchableHighlight>
        )
    };

    renderHiddenItem = ({item}, rowMap) => {
        return renderEditDeleteRowButtons(
            () => this.editNote(item, rowMap),
            () => this.deleteNote(item, rowMap)
        );
    };

    render() {
        const condition: Condition = this.state.condition;
        const notes = this.state.notes;

        return (

            <SafeAreaView style={commonStyles.screenContainer}>
                <KeyboardAvoidingView
                    style={{flex: 1}}
                    keyboardVerticalOffset={100}
                    {...(Platform.OS === "ios" ? {behavior: "padding"} : {})}>
                    <SwipeListView ref={ref => this.list = ref}
                                   style={{flex: 1}}
                                   data={notes}
                                   bounces={false}
                                   keyExtractor={(item, index) => index.toString()}
                                   renderHiddenItem={this.renderHiddenItem}
                                   renderItem={this.renderNote}
                                   rightOpenValue={-78}
                                   leftOpenValue={78}
                                   closeOnRowBeginSwipe
                                   recalculateHiddenLayout
                    />
                    <View style={{padding: 12}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                            <Text
                                style={[commonStyles.titleText, commonStyles.medium]}>{strings.Conditions.newNote}</Text>
                            <Button
                                disabled={!this.state.newNoteText}
                                style={{
                                    elevation: 0,
                                    backgroundColor: 'white',
                                    justifyContent: 'center'
                                }} onPress={this.addNote}>
                                <Text
                                    style={[commonStyles.buttonText, {color: this.state.newNoteText ? appColors.mainColor : '#CCCCCC'}]}>{strings.Conditions.addNote?.toUpperCase()}</Text>
                            </Button>
                        </View>

                        <TextInput style={{
                            fontSize: 18,
                            borderWidth: 1,
                            borderColor: '#000000',
                            minHeight: 55,
                            paddingHorizontal: 5,
                            maxHeight: 200
                        }}
                                   autoCorrect={false}
                                   multiline={true}
                                   value={this.state.newNoteText}
                                   onChangeText={text => {
                                       text = text.isEmpty() ? null : text;
                                       this.setState({newNoteText: text});
                                   }}/>
                    </View>
                </KeyboardAvoidingView>
                {renderLoading(this.state.loading)}
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({

});
