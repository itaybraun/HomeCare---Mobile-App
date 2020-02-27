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
import {
    commonStyles,
    renderDisclosureIndicator,
    renderLoading,
    renderSeparator,
} from '../../../../support/CommonStyles';
import { SwipeListView } from 'react-native-swipe-list-view';
import moment from 'moment';
import {Flag} from '../../../../models/Flag';

export default class FlagsScreen extends AppScreen {

    static navigationOptions = ({navigation}) => {
        const patient: Patient = navigation.getParam('patient', null);
        let title = strings.Flags.title;
        if (patient) {
            title = strings.formatString(strings.Flags.userTitle, patient.fullName)
        }

        return {
            title: title,
            headerBackTitle: ' ',
        }
    };

    state = {
        loading: false,
        flags: [],
    };

    componentDidMount(): void {
        super.componentDidMount();
    }

    getData = async (refresh = true) => {
        this.setState({loading: true});
        const flags = await this.getFlags(refresh);
        this.setState({...flags, loading: false});
    };

    getFlags = async (refresh = true) => {
        const patient: Patient = this.props.navigation.getParam('patient', null);
        if (patient) {
            let result: APIRequest = await this.api.getFlags(patient.id);
            if (result.success) {
                return {flags: result.data};
            } else {
                this.showError(result.data);
            }
        }
    };

    addFlag = async () => {
        const patient: Patient = this.props.navigation.getParam('patient', null);
        if (patient) {
            this.navigateTo('Flag', {patient: patient, flag: null});
        }
        this.closeRow();
    };

    editFlag = async (item, rowMap) => {
        const patient: Patient = this.props.navigation.getParam('patient', null);
        if (patient) {
            this.navigateTo('Flag', {patient: patient, flag: item});
        }
        this.closeRow();
    };

    deleteFlag = async (item, rowMap) => {
        this.showAlert(strings.Flags.deleteFlag, null, [
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
                    this.setState({
                        flags: this.state.flags.filter(flag => flag.id !== item.id)
                    });

                    const result = await this.api.deleteFlag(item);
                    if (!result.success) {
                        this.showError(result.data);
                    }
                },
            }
        ]);
    };

    closeRow = () => {
        this.list.safeCloseOpenRow()
    };

    renderListHeader = () => {
        return (
            <View style={{height: 12}} />
        );
    };

    renderListFooter = () => {
        return (
            <View style={{height: 74}} />
        );
    };

    renderItem = ({item}, rowMap) => {
        return (
            <TouchableHighlight
                style={styles.itemContainer}
                underlayColor='#FFFFFFFF'
                activeOpacity={0.3}
                onPress={() => this.editFlag(item, rowMap)}>
                <Card style={[commonStyles.cardStyle, {backgroundColor: item.internal ? '#E8E16C' : '#FFFFFF'}]}>
                    <View style={styles.flagInfoContainer}>
                        <Text style={commonStyles.smallInfoText}>{item.startDate ? moment(item.startDate).format("MMM Do YYYY") : ''}</Text>
                        <Text style={commonStyles.smallInfoText}>{item.category}</Text>
                    </View>
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
                    style={[styles.itemMenuContainer, {backgroundColor: '#8CE69B'}]}
                    onPress={() => this.editFlag(item, rowMap)}>
                    <Icon type="Feather" name="edit"/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.itemMenuContainer, {backgroundColor: '#DA8EA0'}]}
                    onPress={() => this.deleteFlag(item, rowMap)}>
                    <Image style={styles.menuIcon} source={require('../../../../assets/icons/flags/delete.png')} />
                </TouchableOpacity>
            </View>
        );
    };

    renderListEmpty = () => {
        return (
            <View style={commonStyles.emptyScreen}>
                <Text>{strings.Flags.noFlags}</Text>
            </View>
        )
    };

    render() {

        const flags = this.state.flags;

        return (
            <View style={commonStyles.screenContainer}>
                <SwipeListView
                    ref={(list) => {
                        this.list = list;
                    }}
                    style={styles.list}
                    contentContainerStyle={{ flexGrow: 1 }}
                    data={flags}
                    keyExtractor={item => item.id}
                    renderItem={this.renderItem}
                    renderHiddenItem={this.renderHiddenItem}
                    ItemSeparatorComponent={renderSeparator}
                    ListEmptyComponent={this.renderListEmpty}
                    ListHeaderComponent={this.renderListHeader}
                    ListFooterComponent={this.renderListFooter}
                    onRefresh={this.getData}
                    refreshing={false}
                    rightOpenValue={-103}
                    leftOpenValue={103}
                    closeOnRowBeginSwipe
                    recalculateHiddenLayout
                />
                <TouchableOpacity
                    style={commonStyles.blackButtonContainer}
                    onPress={this.addFlag}
                >
                    <Icon type="Feather" name="plus" style={{fontSize: 36, color: '#FFFFFF', paddingTop: 4}}/>
                </TouchableOpacity>
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },

    itemContainer: {
        marginHorizontal: 12,
        borderRadius: 4,
    },

    flagInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    menuContainer: {
        marginHorizontal: 14,
        marginVertical: 6,
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
