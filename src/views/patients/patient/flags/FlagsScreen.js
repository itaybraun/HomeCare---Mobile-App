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
    Image, Platform,
} from 'react-native';
import AppScreen from '../../../../support/AppScreen';
import {Patient} from '../../../../models/Patient';
import Loading from '../../../../support/Loading';
import APIRequest from '../../../../models/APIRequest';
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
import FlagRenderer from './FlagRenderer';

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
        patient: this.props.navigation.getParam('patient', null),
    };

    componentDidMount(): void {
        super.componentDidMount();
        this.getData();
    }

    willFocus() {
        super.willFocus();
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
                let flags = result.data;
                //flags = flags.filter(flag => flag.status === 'active');
                return {flags:flags};
            } else {
                this.showError(result.data);
            }
        }
    };

    addFlag = async () => {
        if (this.state.patient) {
            this.navigateTo('Flag', {
                patient: this.state.patient,
                flag: null,
                refresh: this.getData,
            });
        }
        this.closeRow();
    };

    selectFlag = async (item, rowMap) => {
        this.navigateTo('Flag', {
            patient: item.patient,
            flag: item,
            refresh: this.getData,
        });
    }

    editFlag = async (item, rowMap) => {
        const patient: Patient = this.props.navigation.getParam('patient', null);
        if (patient) {
            this.navigateTo('Flag', {
                patient: patient,
                flag: item,
                refresh: this.getData,
            });
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

        const flag: Flag = item;

        return (
            <FlagRenderer flag={flag} selectFlag={() => this.selectFlag(flag, rowMap)} />
        )
    };

    renderHiddenItem = ({item}, rowMap) => {
        return (
            <View style={commonStyles.menuContainer}>
                <TouchableOpacity
                    style={[commonStyles.itemMenuContainer, {backgroundColor: '#8CE69B'}]}
                    onPress={() => this.editFlag(item, rowMap)}>
                    <Icon type="Feather" name="edit"/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[commonStyles.itemMenuContainer, {backgroundColor: '#DA8EA0'}]}
                    onPress={() => this.deleteFlag(item, rowMap)}>
                    <Image style={commonStyles.menuIcon} source={require('../../../../assets/icons/flags/delete.png')} />
                </TouchableOpacity>
            </View>
        );
    };

    renderListEmpty = () => {
        return (
            <View style={commonStyles.emptyScreen}>
                <Text style={commonStyles.smallContentText}>{strings.Flags.noFlags}</Text>
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
                    ItemSeparatorComponent={() => renderSeparator()}
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
                {/*<View style={{position: 'absolute', right: 10, bottom: 10}}>*/}
                {/*    <TouchableOpacity*/}
                {/*        style={commonStyles.blackButtonContainer}*/}
                {/*        onPress={this.addFlag}*/}
                {/*    >*/}
                {/*        <Icon type="Feather" name="plus" style={commonStyles.plusText}/>*/}
                {/*    </TouchableOpacity>*/}
                {/*</View>*/}
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },

    flagInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
