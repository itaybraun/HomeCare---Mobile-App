import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, SectionList} from 'react-native';
import AppScreen from '../../support/AppScreen';
import {appColors, commonStyles, renderLoading} from '../../support/CommonStyles';
import {strings} from '../../localization/strings';
import {Icon, Text, Textarea} from 'native-base';
import Share from 'react-native-share';

export default class LogsScreen extends AppScreen {

    //------------------------------------------------------------
    // Properties
    //------------------------------------------------------------

    static navigationOptions = ({navigation}) => {
        return {
            title: strings.Logs.title,
            headerBackTitle: ' ',
            headerRight: () => {
                return (
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity style={{padding: 12}} onPress={navigation.getParam('clearLogs')}>
                            <Icon type="AntDesign" name="delete"
                                  style={{fontSize: 22, color: appColors.headerFontColor}}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={{padding: 12,}} onPress={navigation.getParam('shareLogs')}>
                            <Icon type="Feather" name="share"
                                  style={{fontSize: 22, color: appColors.headerFontColor}}/>
                        </TouchableOpacity>
                    </View>
                )
            }
        }
    };

    state = {
        loading: false,
        logs: null,
    };

    //------------------------------------------------------------
    // Overrides
    //------------------------------------------------------------

    componentDidMount(): void {
        super.componentDidMount();
        this.getData();

        this.props.navigation.setParams({
            shareLogs: this.shareLogs,
            clearLogs: this.clearLogs,
        });
    }

    //------------------------------------------------------------
    // Data
    //------------------------------------------------------------

    getData = async (refresh = true) => {
        this.setState({loading: true});
        let logs = await log.getLogs();
        await this.setState({
            logs: logs,
            loading: false
        });
    };

    clearLogs = async () => {
        await log.deleteLogs();
        this.getData();
    };

    shareLogs = async () => {
        let filePath = await log.generateLogsFile();

        const options = {
            url: `file:${filePath}`,
        };

        Share.open(options)
            .then((res) => {
                console.log(res)
            })
            .catch((err) => {
                err && console.log(err);
            });
    };

    //------------------------------------------------------------
    // Methods
    //------------------------------------------------------------


    //------------------------------------------------------------
    // Render
    //------------------------------------------------------------

    renderListEmpty = () => {
        return (
            <View style={commonStyles.emptyScreen}>
                <Text style={commonStyles.smallContentText}>{strings.Logs.noLogs}</Text>
            </View>
        )
    };

    renderTextItem = ({item, index}) => {

        let color = {color: '#000000'};
        if (item.indexOf('[Debug]') > -1)
            color = {color:'#1c4966'};
        else if (item.indexOf('[Error]') > -1)
            color = {color:'#FF0000'};

        if (item.isEmpty())
            return null;

        return (
            <View key={index} style={{flex: 1, padding: 5}}>
                <TextInput editable={false}
                           multiline
                           style={[{fontFamily: 'Courier', padding: 0, fontSize: 12}, color]}
                >
                    {item}
                </TextInput>
            </View>
        );
    };

    render() {
        let logs = this.state.logs?.split('\n') || [];
        logs = logs.reverse();
        return (
            <SafeAreaView style={commonStyles.screenContainer}>
                <FlatList data={logs}
                          contentContainerStyle={{flexGrow: 1}}
                          renderItem={this.renderTextItem}
                          ListEmptyComponent={this.renderListEmpty}
                          onRefresh={this.getData}
                          refreshing={false}
                />
                {renderLoading(this.state.loading)}
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({

});
