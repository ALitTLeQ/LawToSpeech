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
  Image,
  AsyncStorage
} from 'react-native';

import { Spinner, Container, Content, Header, Title, List, ListItem, Left, Body, CheckBox, Right, Button, Picker, Icon, Form, Item as FormItem } from 'native-base';
import Tts from 'react-native-tts';

import Storage from 'react-native-storage';


const Item = Picker.Item;

var LawList = [
  {
    text: '公務人員任用法',
    file: require('./data/S0020001.json'),
  },
  {
    text: '公務人員考試法',
    file: require('./data/R0030001.json'),
  },
  {
    text: '公務人員陞遷法',
    file: require('./data/S0110033.json'),
  },
  {
    text: '公務人員考績法',
    file: require('./data/S0040001.json'),
  },
  {
    text: '公務員懲戒法',
    file: require('./data/A0030155.json'),
  },
  {
    text: '公務員服務法',
    file: require('./data/S0020038.json'),
  },
  {
    text: '公務人員俸給法',
    file: require('./data/S0030001.json'),
  },
  {
    text: '公教人員保險法',
    file: require('./data/S0070001.json'),
  },
  {
    text: '公務人員退休資遣撫卹法',
    file: require('./data/S0080034.json'),
  },
  {
    text: '公務人員保障法',
    file: require('./data/S0120001.json'),
  },
  {
    text: '公職人員利益衝突迴避法',
    file: require('./data/I0070008.json'),
  },
  {
    text: '公職人員財產申報法',
    file: require('./data/I0070005.json'),
  },
  {
    text: '公務人員行政中立法',
    file: require('./data/S0110036.json'),
  },
];

var storage = new Storage({
  // 最大容量，默認值1000條數據循環存儲
  size: 1000,

  // 存儲引擎：對於RN使用AsyncStorage，對於web使用window.localStorage
  // 如果不指定則數據只會保存在內存中，重啟後即丟失
  storageBackend: AsyncStorage,

  // 數據過期時間，默認一整天（1000 * 3600 * 24 毫秒），設為null則永不過期
  defaultExpires: 1000 * 3600 * 24,

  // 讀寫時在內存中緩存數據。默認啟用。
  enableCache: true,
})

global.storage = storage;

var startFrom = 0;

export default class LawToSpeech extends Component {
 constructor(props){
    super(props);

    this.state = {
      data: null,
      isSpeaking: false,
      isPause: true,
      speed: 0.4,
      selectedLaw: 0,
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
    this.loadData(this.state.selectedLaw);
    Tts.setDefaultLanguage('zh-TW');
    Tts.setDefaultVoice('cmn-tw-x-sxx#male_1');
    Tts.setDefaultRate(this.state.speed);
    Tts.setDucking(true);
    Tts.setDefaultPitch(1.0);
    Tts.addEventListener('tts-finish', (event) => {
      //Tts.voices().then(voices => console.log(voices));
      startFrom+=1

    });
    Tts.addEventListener('tts-start', (event) => console.log("startFrom", startFrom));
    
    //Tts.addEventListener('tts-cancel', (event) => startFrom=0);
    
  }

  componentWillUnmount(){
    Tts.stop();
  }

  loadData(id){
    var jsonData = LawList[id].file;
    console.log("name:"+jsonData["法規名稱"]);
    var dataBlob = jsonData["法規內容"];


    startFrom = 0;
    
    this.setState({
        name: jsonData["法規名稱"],
        data: new ListView.DataSource({rowHasChanged: (r1,r2) => r1!==r2 }).cloneWithRows(dataBlob),
        dataBlob: dataBlob,
    });
    

    sc = {};
    dataBlob.map(function(rowData) {
        if(rowData["條號"]){
          sc[rowData["條號"]] = true;
          rowData["條文內容"] = rowData["條文內容"].replace(/\s/g, "")
        }
    });    

    
    this.setState({ selectedCheckboxes: sc });
    
    
    storage.load({
      key: jsonData["法規名稱"],
      autoSync: true,
      syncInBackground: true
    }).then(ret => {
      console.log("Loading Storage...");
      this.setState({ selectedCheckboxes: ret.sc });
    }).catch(err => {
      //console.warn(err.message);
      switch (err.name) {
          case 'NotFoundError':
              break;
          case 'ExpiredError':
              break;
      }
    })


  }

  saveSelectedCheckboxes(data){
    let lawName = this.state.name;
    storage.save({
      key: lawName, 
      data: { 
        sc : data
      },
      expires: 1000 * 3600
    });
    
  }

  toggleCheckbox(label) {
    //console.log("label:"+ label);
    let sc = this.state.selectedCheckboxes;
    sc[label]=  !sc[label];

    this.setState({selectedCheckboxes: sc})
    this.saveSelectedCheckboxes(sc);

  }


  // 返回listview的一行
  renderRow(rowData){
    if(rowData["條號"]){
      //this.setState({textList: [...this.state.textList, rowData["條號"], rowData["條文內容"]]})
      

      return(
        <ListItem style={ styles.listItem }>
          <View style={{flexDirection:"row"}}>
            <CheckBox 
              style={ styles.checkbox } 
              checked={this.state.selectedCheckboxes[rowData["條號"]]} 
              onPress={() => this.toggleCheckbox(rowData["條號"])}
            />
            <Text
              style = { styles.textTitle }
              numberOfLines = { 1 }>
              { rowData["條號"] }
            </Text>
          </View>
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
    if(!this.state.isSpeaking && this.state.isPause){
      this.setState({ isSpeaking: true});
      startFrom = 0;
      console.log("start"+ startFrom);
      
    }
      
      sc = this.state.selectedCheckboxes;
      this.setState({isPause: false}); 

      for(let i = startFrom; i < this.state.dataBlob.length; i++){
        let text = this.state.dataBlob[i];
        if(text["條號"]){
          
          if(sc[text["條號"]])
          {
            Tts.speak(text["條號"]+"。"+text["條文內容"]);
            //console.log(text["條文內容"]);
          }
        }
        else{
          Tts.speak(text["編章節"]);
        }
      }
   }

  speakPause(){
    this.setState({ isPause: true });
    Tts.stop();
  }

  speakStop(){
    this.setState({ isSpeaking: false, isPause: true });
    Tts.stop();
  }

  setSpeed(speed){
    if(speed > 0 && speed < 1.5)
    {
      this.setState({speed:Number((speed).toFixed(1))})
      Tts.setDefaultRate(speed);
    }
  }

  onValueChange(value) {
    this.setState({
      selectedLaw: value
    });
    console.log("val"+value);
    this.loadData(value);
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
            <Left style={{ flex: 1, flexDirection:'row'}}>
              {(this.state.isPause) &&
                <Button full transparent onPress={() => this.speakStart()}>
                  <Icon name='play' />
                </Button>
              }
              {(!this.state.isPause) &&
                <Button full transparent onPress={() => this.speakPause()}>
                  <Icon name='pause' />
                </Button>
              }
              
            </Left>
            <Picker
              style={styles.picker}
              mode="dropdown"
              selectedValue={this.state.selectedLaw}
              onValueChange={(value)=>{this.onValueChange(value)}}
              >
              {LawList.map((l, i) => {return <Item value={i} label={LawList[i].text} key={i}/> })}
            </Picker>
            <Button full transparent onPress={() => this.speakStop()}>
                  <Icon name='md-square' />
            </Button>

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

            <ListView
              style ={styles.listView}
              dataSource={this.state.data}
              renderRow={(rowData) => this.renderRow(rowData)}
              initialListSize={10}
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
  picker:{
    flex: 9,
    color: '#fff',
  },

  checkbox:{
    //transform: [{scale:1.1}],
    justifyContent: 'center',
    alignItems : 'center',

    width:30,
    height:30
    
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
    textAlignVertical: 'center',
    paddingLeft: 5,
   
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


