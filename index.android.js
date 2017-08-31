/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  ListView,
  Text,
  Image
} from 'react-native';

import { Spinner, Container, Content, Header, Title, List, ListItem, Left, Body, Right, Button, ActionSheet, Icon} from 'native-base';
import Tts from 'react-native-tts';
var BUTTONS = ["Option 0", "Option 1", "Option 2", "Delete", "Cancel"];

var LawList = [
  {
    text: '中央行政機關組織基準法',
    icon: 'document',
    file: require('./data/A0010036.json'),
  },
  {
    text: '公務員懲戒法',
    icon: 'document',
    file: require('./data/A0030155.json'),
  },
  {
    text: '公務人員考試法',
    icon: 'document',
    file: require('./data/R0030001.json'),
  },
  {
    text: '公務員懲戒法',
    icon: 'document',
    file: require('./data/A0030155.json'),
  },
  {
    text: '公務員懲戒法',
    icon: 'document',
    file: require('./data/A0030155.json'),
  },
];



export default class LawToSpeech extends Component {
 constructor(props){
    super(props);

    this.state = {
      data: null,
      isSpeaking: false,
      textList: [],
      speed: 0.6,
    };
  }

  
// 生命週期回調函數
  componentDidMount(){
    /*
    fetch('https://raw.githubusercontent.com/kong0107/mojLawSplitJSON/gh-pages/FalVMingLing/A0010036.json')
    .then((response) => response.json())
    .then((jsonData) => {
      console.log("name:"+jsonData["法規名稱"]);
      this.setState({
        name: jsonData["法規名稱"],
        data: new ListView.DataSource({rowHasChanged: (r1,r2) => r1!==r2 }).cloneWithRows(jsonData["法規內容"]),
        rawData: jsonData["法規內容"]
      });
    })
    .catch((error) => {
      alert(error);
    });
    */
    this.loadData(0);
    Tts.setDucking(true);
    
  }

  componentWillUnmount(){
    Tts.stop();
  }

  loadData(id){
    var jsonData = LawList[id].file;
    console.log("name:"+jsonData["法規名稱"]);
    
    this.setState({
        name: jsonData["法規名稱"],
        data: new ListView.DataSource({rowHasChanged: (r1,r2) => r1!==r2 }).cloneWithRows(jsonData["法規內容"]),
        rawData: jsonData["法規內容"]
    });

  }

  // 返回listview的一行
  renderRow(rowData){
    if(rowData["條號"]){
      //this.setState({textList: [...this.state.textList, rowData["條號"], rowData["條文內容"]]})
      return(
        <ListItem style={ styles.listItem }>
          <Text
            style = { styles.textTitle }
            numberOfLines = { 1 }>
            { rowData["條號"] }
          </Text>
          <Text
            style = { styles.article }>
            { rowData["條文內容"] }
          </Text>
        </ListItem>
      )
    }
    else{ 
      //this.setState({textList: [...this.state.textList, rowData["編章節"]]})
      return(
        <ListItem itemDivider>
          <Text
              style = { styles.chapter }>
              { rowData["編章節"] }
          </Text>
        </ListItem>
      )
    }

    
  }

  speakStart(){
    this.setState({ isSpeaking: true });
    Tts.stop();
    Tts.setDefaultPitch(0.9);
  
    
    this.state.rawData.map(function(text) {
        if(text["條號"]){
           Tts.speak(text["條號"]);
           Tts.speak(text["條文內容"]);

        }
        else{
          Tts.speak(text["編章節"]);
        }
    });



      
    //Tts.speak('中央行政機關組織基準法，第 一 章 總則，第 1 條	為建立中央行政機關組織共同規範，提升施政效能，特制定本法，');
  }

  speakStop(){
    this.setState({ isSpeaking: false });
    Tts.stop();
  }

  setSpeed(speed){
    if(speed > 0 && speed < 1.5)
    {
      this.setState({speed:Number((speed).toFixed(1))})
      Tts.setDefaultRate(this.state.speed);
    }
  }

  showMenu(){
    console.log("show Menu");
    ActionSheet.show(
      {
        options: LawList,
        cancelButtonIndex: 3,
        destructiveButtonIndex: 4,
        title: "法條列表"
      },
      buttonIndex => {
        this.loadData(buttonIndex);
      }
    );
    
  }

  render() {
    if(!this.state.data){
      return(
          <Text>loading...</Text>
      );
    } else {
      //console.log("aaa"+this.state.data);
      return (
        <Container style={styles.container}>  

          <Header style={styles.header}>
            <Left style={{ flex: 1 }}>
              {(!this.state.isSpeaking) &&
                <Button full transparent onPress={() => this.speakStart()}>
                  <Icon name='play' />
                </Button>
              }
              {(this.state.isSpeaking) &&
                <Button full transparent onPress={() => this.speakStop()}>
                  <Icon name='pause' />
                </Button>
              }
            </Left>
            <Body style={styles.body}>
              <Title style={styles.name}>{this.state.name}</Title>
            </Body>
            <Right style={{ flex: 2 }}>
              <Button transparent onPress={() => this.showMenu()}>
                  <Icon name='list' />
              </Button>
              
            </Right>
            
          </Header>
          <Content contentContainerStyle={{ flex: 1 }}>
            <View style={styles.settingContainer}>
              <Button transparent onPress={() => this.setSpeed(this.state.speed-0.1)}>
                  <Icon name='remove-circle' style={{ color: '#7D7874' }} />
              </Button>
              <Text style={styles.speedText}>
                語速: {this.state.speed}
              </Text>
              <Button transparent onPress={() => this.setSpeed(this.state.speed+0.1)}>
                  <Icon name='add-circle' style={{ color: '#7D7874' }} />
              </Button>
              
            </View>
            <ActionSheet ref={o => ActionSheet.actionsheetInstance = o} />
            <ListView
              style ={styles.listView}
              dataSource={this.state.data}
              renderRow={(rowData) => this.renderRow(rowData)}
            />

          </Content>
        </Container>
      );
    }
  }



}

const styles = StyleSheet.create({
  name: {
    fontSize: 18,
    color: '#fff',
    
  },
  header: {
    backgroundColor: '#00b17f',
    height: 50,
  },

  body: {
    flex: 9,
    justifyContent: 'flex-start'

  },
  settingContainer: {
    flexDirection:'row', 
    flexWrap:'wrap',
    alignItems : 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 3,
    borderBottomColor: '#00b17f',
    height: 45,
  },
  
  slider: {

  },

  speedText:{
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00b17f',
  },

  lvRow: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
  },
  listView:{
    //backgroundColor:'#ffc',
  },
  listItem : {
     alignItems : 'stretch',
     justifyContent: 'flex-start',
     flexDirection: 'column',
  },
  textTitle: {
    flex: 1,
    textAlign: 'left',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EC5D57',
    backgroundColor: '#F7DDDC',
   
  },

  article: {
    flex: 5,
    fontSize: 20,
    lineHeight: 30,
    color: '#000',
    textAlign: 'left',
    backgroundColor: '#EAEDF1',
  },

  chapter: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  }

});


AppRegistry.registerComponent('LawToSpeech', () => LawToSpeech);


