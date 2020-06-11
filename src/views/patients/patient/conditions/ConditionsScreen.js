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
import {ActionSheet, Card, Icon, Text} from 'native-base';
import {
    appColors,
    commonStyles,
    renderDisclosureIndicator, renderEditDeleteRowButtons,
    renderLoading,
    renderSeparator,
} from '../../../../support/CommonStyles';
import { SwipeListView } from 'react-native-swipe-list-view';
import ConditionRenderer from './ConditionRenderer';
import {Condition} from '../../../../models/Condition';

export default class ConditionsScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        const patient: Patient = navigation.getParam('patient', null);
        let title = strings.Conditions.title;
        if (patient) {
            title = strings.formatString(strings.Conditions.userTitle, patient.fullName)
        }

        return {
            title: title,
            headerBackTitle: ' ',
            headerRight: () => {
                return (
                    <TouchableOpacity style={{padding: 12}} onPress={navigation.getParam('showMenu')}>
                        <Icon type="Entypo" name="dots-three-horizontal"
                              style={{fontSize: 22, color: appColors.headerFontColor}}/>
                    </TouchableOpacity>
                )
            }
        }
    };

    state = {
        loading: false,
        conditions: [],
        patient: this.props.navigation.getParam('patient', null),
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();
        this.getData();
        this.props.navigation.setParams({
            showMenu: this.showMenu,
        });
    }

    willFocus() {
        super.willFocus();
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        this.setState({loading: true});
        const conditions = await this.getConditions(refresh);
        this.setState({...conditions, loading: false});
    };

    getConditions = async (refresh = true) => {
        const patient: Patient = this.props.navigation.getParam('patient', null);
        if (patient) {
            let result: APIRequest = await this.api.getConditions(patient.id);
            if (result.success) {
                let conditions = result.data;
                return {conditions:conditions};
            } else {
                this.showError(result.data);
            }
        }
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------

    showMenu = () => {
        let options = [
            strings.Conditions.menuCreate,
            strings.Common.cancelButton
        ];

        ActionSheet.show({
                options: options,
                cancelButtonIndex: options.length - 1,
            },
            (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        this.addCondition();
                        break;
                }
            });
    };

    addCondition = async () => {
        if (this.state.patient) {
            this.navigateTo('NewCondition', {
                patient: this.state.patient,
                condition: null,
                refresh: this.getData,
            });
        }
        this.closeRow();
    };

    selectCondition = async (item, rowMap) => {
        this.navigateTo('Condition', {
            patient: item.patient,
            condition: item,
            refresh: this.getData,
        });
    };

    editCondition = async (item, rowMap) => {
        this.navigateTo('EditCondition', {
            condition: item,
            updateCondition: this.getData,
        });
        this.closeRow();
    };

    deleteCondition = async (item, rowMap) => {
        this.showAlert(strings.Conditions.deleteCondition, null, [
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
                        conditions: this.state.conditions.filter(condition => condition.id !== item.id)
                    });

                    const result = await this.api.deleteCondition(item);
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

    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

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

        const condition: Condition = item;

        return (
            <ConditionRenderer condition={condition} selectCondition={(c) => this.selectCondition(c, rowMap)} />
        )
    };

    renderHiddenItem = ({item}, rowMap) => {
        return renderEditDeleteRowButtons(
            () => this.editCondition(item, rowMap),
            () => this.deleteCondition(item, rowMap)
        );
    };

    renderListEmpty = () => {
        return (
            <View style={commonStyles.emptyScreen}>
                <Text style={commonStyles.smallContentText}>{strings.Conditions.noConditions}</Text>
            </View>
        )
    };

    render() {

        const conditions = this.state.conditions;

        return (
            <View style={commonStyles.screenContainer}>
                <SwipeListView
                    ref={(list) => {
                        this.list = list;
                    }}
                    style={styles.list}
                    contentContainerStyle={{ flexGrow: 1 }}
                    data={conditions}
                    keyExtractor={item => item.id}
                    renderItem={this.renderItem}
                    renderHiddenItem={this.renderHiddenItem}
                    ItemSeparatorComponent={() => renderSeparator()}
                    ListEmptyComponent={this.renderListEmpty}
                    ListHeaderComponent={this.renderListHeader}
                    ListFooterComponent={this.renderListFooter}
                    onRefresh={this.getData}
                    refreshing={false}
                    rightOpenValue={-78}
                    leftOpenValue={78}
                    closeOnRowBeginSwipe
                    recalculateHiddenLayout
                />
                {renderLoading(this.state.loading)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
});
