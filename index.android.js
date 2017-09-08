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

import { Spinner, Container, Content, Header, Title, List, ListItem, Left, Body, CheckBox, Right, Button, Picker, Icon, Form, Item as FormItem } from 'native-base';
import Tts from 'react-native-tts';

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

export default class LawToSpeech extends Component {
 constructor(props){
    super(props);

    this.state = {
      data: null,
      isSpeaking: false,
      speed: 0.6,
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
    Tts.setDucking(true);
    
  }

  componentWillUnmount(){
    Tts.stop();
  }

  loadData(id){
    var jsonData = LawList[id].file;
    console.log("name:"+jsonData["法規名稱"]);
    var dataBlob = jsonData["法規內容"];
    
    sc = {};

    dataBlob.map(function(rowData) {
        if(rowData["條號"]){
           sc[rowData["條號"]] = true;
        }
    });
    
    
    this.setState({
        name: jsonData["法規名稱"],
        data: new ListView.DataSource({rowHasChanged: (r1,r2) => r1!==r2 }).cloneWithRows(dataBlob),
        dataBlob: dataBlob,
        selectedCheckboxes: sc
    });

  }

  toggleCheckbox(label) {
    //console.log("label:"+ label);
    let sc = this.state.selectedCheckboxes;
    sc[label]=  !sc[label];

    this.setState({selectedCheckboxes: sc})
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
    if(this.state.isSpeaking){
      Tts.resume();

    }
    else{
      this.setState({ isSpeaking: true });
      Tts.stop();
      Tts.setDefaultPitch(0.9);
      sc = this.state.selectedCheckboxes;

      this.state.dataBlob.map(function(text) {
          if(text["條號"]){
            if(sc[text["條號"]])
            {
              Tts.speak(text["條號"]);
              Tts.speak(text["條文內容"].replace(/\s/g, ""));
              console.log(text["條文內容"].replace(/\s/g, ""));
            }
              
          }
          else{
            Tts.speak(text["編章節"]);
          }
      });
    }
    //Tts.speak('中央行政機關組織基準法，第 一 章 總則，第 1 條	為建立中央行政機關組織共同規範，提升施政效能，特制定本法，');
  }

  speaPause(){
    Tts.pause();
  }


  speakStop(){
    this.setState({ isSpeaking: false });
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
            <Left style={{ flex: 2, flexDirection:'row'}}>
              {(!this.state.isSpeaking) &&
                <Button full transparent onPress={() => this.speakStart()}>
                  <Icon name='play' />
                </Button>
              }
              {(this.state.isSpeaking) &&
                <Button full transparent onPress={() => this.speaPause()}>
                  <Icon name='pause' />
                </Button>
              }
              <Button full transparent onPress={() => this.speakStop()}>
                  <Icon name='md-square' />
              </Button>
            </Left>
            <Picker
              style={styles.picker}
              mode="dropdown"
              selectedValue={this.state.selectedLaw}
              onValueChange={(value)=>{this.onValueChange(value)}}
              >
              {LawList.map((l, i) => {return <Item value={i} label={LawList[i].text} key={i}/> })}
            </Picker>

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
              initialListSize={5}
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


