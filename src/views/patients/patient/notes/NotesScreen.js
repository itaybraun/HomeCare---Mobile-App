import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    Keyboard,
    TouchableWithoutFeedback,
    Alert,
    Image
} from 'react-native';
import AppScreen from '../../../../support/AppScreen';
import {Patient} from '../../../../models/Patient';
import Loading from '../../../../support/Loading';
import {APIRequest} from '../../../../api/API';
import {strings} from '../../../../localization/strings';
import { Card, Icon, Text } from 'native-base';
import {commonStyles, renderDisclosureIndicator, renderSeparator} from '../../../../support/CommonStyles';
import { SwipeListView } from 'react-native-swipe-list-view';

export default class NotesScreen extends AppScreen {

    static navigationOptions = ({navigation}) => {
        const patient: Patient = navigation.getParam('patient', null);
        let title = strings.Notes.title;
        if (patient) {
            title = strings.formatString(strings.Notes.userTitle, patient.fullName)
        }

        return {
            title: title,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        notes: [],
    };

    componentDidMount(): void {
        super.componentDidMount();

        this.getData();
    }

    getData = async (refresh = true) => {
        this.setState({loading: true});
        const notes = await this.getNotes(refresh);
        this.setState({...notes, loading: false});
    };

    getNotes = async (refresh = true) => {
        const patient: Patient = this.props.navigation.getParam('patient', null);
        if (patient) {
            let result: APIRequest = await this.api.getNotes(patient.id);
            if (result.success) {
                return {notes: result.data};
            } else {
                this.showError(result.data);
            }
        }
    };

    addNote = async () => {
        this.closeRow();
    };

    editNote = async (item, rowMap) => {
        this.closeRow();
    };

    deleteNote = async (item, rowMap) => {
        this.setState({
            notes: this.state.notes.filter(note => note.id !== item.id)
        });
        let result = await this.api.deleteNote(item);
        if (!result.success) {
            this.showError(result.data);
        }
    };

    closeRow = () => {
        this.list.safeCloseOpenRow()
    };

    renderListHeader = () => {
        return (
            <TouchableOpacity
                style={{paddingTop: 6, paddingHorizontal: 8, paddingBottom: 10}}
                onPress={this.addNote}
            >
                <Text style={commonStyles.link}>{strings.Notes.addNote}</Text>
            </TouchableOpacity>
        );
    };

    renderItem = ({item}, rowMap) => {
        return (
            <TouchableHighlight
                style={styles.itemContainer}
                underlayColor='#FFFFFFFF'
                activeOpacity={0.3}
                onPress={() => this.editNote(item, rowMap)}>
                <Card style={[styles.noteItemContainer, {backgroundColor: item.internal ? '#E8E16C' : '#FFFFFF'}]}>
                    <Text style={commonStyles.smallInfoText}>{item.date.format("MMM Do YYYY")}</Text>
                    <Text style={[commonStyles.boldTitleText, {marginVertical: 6}]}>{item.title}</Text>
                    <Text style={commonStyles.contentText}>{item.text}</Text>
                </Card>
            </TouchableHighlight>
        )
    };

    renderHiddenItem = ({item}, rowMap) => {
        return (
            <View style={styles.menuContainer}>
                <TouchableOpacity
                    style={[styles.itemMenuContainer, {backgroundColor: '#8CE69B', opacity: 0,}]}
                    onPress={() => this.editNote(item, rowMap)}>
                    <Icon type="Feather" name="edit"/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.itemMenuContainer, {backgroundColor: '#DA8EA0'}]}
                    onPress={() => this.deleteNote(item, rowMap)}>
                    <Image style={styles.menuIcon} source={require('../../../../assets/icons/notes/delete.png')} />
                </TouchableOpacity>
            </View>
        );
    };

    render() {

        const notes = this.state.notes;

        return (
            <View style={styles.container}>
                <SwipeListView
                    ref={(list) => {
                        this.list = list;
                    }}
                    style={styles.list}
                    data={notes}
                    renderItem={this.renderItem}
                    ListHeaderComponent={this.renderListHeader}
                    keyExtractor={item => item.id.toString()}
                    onRefresh={this.getData}
                    refreshing={this.state.loading}
                    ItemSeparatorComponent={renderSeparator}
                    renderHiddenItem={this.renderHiddenItem}
                    rightOpenValue={-103}
                    leftOpenValue={103}
                    disableRightSwipe
                    closeOnRowBeginSwipe
                    recalculateHiddenLayout
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    list: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    itemContainer: {
        marginHorizontal: 12,
        borderRadius: 4,
    },

    noteItemContainer: {
        padding: 12,
        borderRadius: 4,
        overflow: 'hidden',
    },

    menuContainer: {
        marginHorizontal: 14,
        marginVertical: 7,
        justifyContent: 'space-between',
        flex: 1,
        flexDirection: 'row',
    },

    itemMenuContainer: {
        marginHorizontal: 1,
        borderWidth: 1,
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#000000',
    },

    menuIcon: {
        width: 30,
        height: 30,
    },
});
