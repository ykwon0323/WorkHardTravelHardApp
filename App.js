import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity,TextInput, TouchableWithoutFeedback, TouchableHighlight, Pressable, Alert } from 'react-native';
import { theme } from './colors';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto } from '@expo/vector-icons'; 

const STORAGE_KEY = "@toDos"
const STORAGE_KEY_WORKING = "@working"

// Challenge 
// 1 Work, Travel 중 앱 종료전 마지막 위치 기억하기
// 2 Todo Item Compelted 시키기
// 3 Todo Item Text수정 가능하게 하기

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [completed, setCompleted] = useState(false);
  const [toDos, setToDos] = useState({});
  const travel = async () => {
    setWorking(false);
    await saveWorking (false);
  };
  const work = async () => {
    setWorking(true);
    await saveWorking (true);
  };
  const onChangeText = (payload) => setText(payload);

  const saveTodos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY,  JSON.stringify(toSave));
  }
  // challenge 1
  const saveWorking = async (isWorking) =>{
    const obj = {working: isWorking}
    await AsyncStorage.setItem(STORAGE_KEY_WORKING,  JSON.stringify(obj));
  }
  const loadToDos = async () => {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(s));

      // challenge 1 
      const w = await AsyncStorage.getItem(STORAGE_KEY_WORKING);
      const {working:ISWORKING}= JSON.parse(w)
      setWorking(ISWORKING)
  }
  // Data Clear
  const removeDatas = async () => {
    await AsyncStorage.setItem(STORAGE_KEY,  JSON.stringify({}));
    await AsyncStorage.setItem(STORAGE_KEY_WORKING,  JSON.stringify({working: false}));
  }

  useEffect(() =>{
    // removeDatas();
    loadToDos();
  }, []);
  
  const addTodo = async () => {
    if (text === ""){
      return ;
    }
    // const newToDos = Object.assign({}, 
    //                                 toDos, 
    //                                 {[Date.now()]:{text, work:working}})

    const newToDos = {...toDos, 
                      [Date.now()]:{text, working, completed}};
    // save to do
    setToDos(newToDos);
    await saveTodos(newToDos);
    setText("");
  
  }

  const deleteToDo = async (key) => {
    Alert.alert("Delete To Do?", 
                "Are you sure?", 
                [
                  {text:"Cancel"},
                  {text:"I'm Sure", 
                   "style": 'destructive',
                   onPress: async () =>{
                                        const newToDos = {...toDos}
                                        delete newToDos[key];
                                        setToDos(newToDos);
                                        await saveTodos(newToDos);
                  }},
                ]);
    return ;
  }

  const completeToDo = async (key) =>{

    // const originToDos = {...toDos}
    // delete originToDos[key];

    // const obj = {
    //   [key]:{
    //     text: toDos[key].text,
    //     working: toDos[key].working,
    //     completed: !toDos[key].completed
    //   }
    // };

    // const newToDos = {...originToDos, ...obj}
    
    // Object.assign 을 하면 덮어쓰기가 가능하다
    const newToDos = Object.assign({}, 
                                      toDos, 
                                      {[key]:{text: toDos[key].text, 
                                              working: toDos[key].working,
                                              completed: !toDos[key].completed}})

    setToDos(newToDos);
    await saveTodos(newToDos);
  }


  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.btnText, color: working ? "white": theme.grey}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.btnText, color: !working ? "white": theme.grey}}>Travel</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput onChangeText={onChangeText}
                   returnKeyType='done'
                   style={styles.input}
                   value={text}
                   onSubmitEditing={addTodo}
                   placeholder={working ? "Add a To Do": "Where do you want to go ?"}/>
      </View>
      <ScrollView>{
                    Object.keys(toDos).map(key => 
                        toDos[key].working === working ? (
                                              <View key={key}
                                                    style={styles.toDo}>
                                                { toDos[key].completed ? (
                                                                          <TouchableOpacity onPress={() => completeToDo(key)}>
                                                                              <Fontisto name="checkbox-active" size={26} color={theme.grey} />
                                                                          </TouchableOpacity>      )
                                                                       : (
                                                                          <TouchableOpacity onPress={() => completeToDo(key)}>
                                                                              <Fontisto name="checkbox-passive" size={26} color={theme.grey} />
                                                                          </TouchableOpacity>      )
                                                }
                                                <Text style={styles.toDoText}>
                                                  {toDos[key].text}
                                                </Text>
                                                <TouchableOpacity onPress={() => deleteToDo(key)}>
                                                    <Fontisto name="trash" size={18} color={theme.grey} />
                                                </TouchableOpacity>
                                              </View>
                                              ) 
                                            : null
                    )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header:{
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText:{
    fontSize: 38,
    fontWeight: "600"
  },
  input:{
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,   
  },
  toDo:{
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toDoText:{
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  }
});
