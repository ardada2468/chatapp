import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'; //v9
import 'firebase/compat/firestore'; //v9
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/compat/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import ReactTooltip from 'react-tooltip';

//Put your auth key here
firebase.initializeApp({place your key here});

  const firestore = firebase.firestore();
  // const analytics = firebase.analytics();
  const auth = firebase.auth();

  
  function App() {
  
    const [user] = useAuthState(auth);
  
    return (
      <div className="App">
        <header>
          <h1>Arnav's Chat App</h1>
          <SignOut />
        </header>
  
        <section>
          {user ? <ChatRoom /> : <SignIn />}
        </section>
  
      </div>
    );
  }
  
  function SignIn() {
  
    const signInWithGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
    }
  
    return (
      <>
        <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
        <p>Do not violate the community guidelines or you will be banned for life!</p>
      </>
    )
  
  }
  
  function SignOut() {
    return auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
    )
  }
  
  
  function ChatRoom() {
    const dummy = useRef();
    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt').limit(25);
  
    const [messages] = useCollectionData(query, { idField: 'id' });
  
    const [formValue, setFormValue] = useState('');
  
  
    const sendMessage = async (e) => {
      e.preventDefault();
  
      const { uid, photoURL } = auth.currentUser;
  
      await messagesRef.add({
        text: formValue,
        username: auth.currentUser.displayName,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      })
  
      setFormValue('');
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    }
  
    return (<>
      <main>
  
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} username={auth.currentUser.displayName} date={msg.createdAt}/>)}
  
        <span ref={dummy}></span>
  
      </main>
  
      <form onSubmit={sendMessage}>
  
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Send a Message" />
  
        <button type="submit" disabled={!formValue}>🕊️</button>
  
      </form>
    </>)
  }
  
  
  function ChatMessage(props) {
    const { text, uid, photoURL, username, createdAt } = props.message;
  
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  
    return (<>
        <div className={`message ${messageClass}`}>
          <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
          <p data-tip={username + " | " +  firebase.firestore.Timestamp.fromDate(new Date()).toDate().toLocaleString()}>{text}</p>

          <ReactTooltip />
        </div>
    </>)
  }
  
  function getDate(date){
    const  Date = new Date(date);
    return Date.toLocaleString('en-US')

  }
  
  export default App;
