import React, { useEffect, useState, useLayoutEffect } from 'react';
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json"
import './App.css';

const App = () =>{

  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState("");
  const [loadingState, setLoading] = useState(false);
    
  const checkIfWalletIsConnected = async () => {
    try{
      const {ethereum} = window;
      if(!ethereum){
        console.log("Make sure you have metamask!");
      }
      else{
        console.log("We have the ethereum object", ethereum);
      }
  
      const accounts = await ethereum.request({
        method:"eth_accounts"
      });
  
      if(accounts.length !== 0){
        const account = accounts[0];
        console.log("Found an authorized account", account);
        setCurrentAccount(account);
      }
      else{
        console.log("No authorized account found");
      }
    }catch(error){
      console.log(error);
      
    }
  }

  const connectWallet = async ()=>{
    try{
      const{ethereum} = window;
      if (!ethereum){
        alert("Get Metamask");
      }
      const accounts = await ethereum.request({
        method:"eth_requestAccounts"
      });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      
    }
    catch(error){
      console.log(error);
    }
  }

  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0x0263B0e98e6df0AF1F77e87BC738345bE8Fb0655";
  const contractABI = abi.abi;

  const wave = async() => {
    try {
      const { ethereum } = window;
      if (ethereum){
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        // let count = await wavePortalContract.getTotalWaves();
        // console.log("Total waves", count.toNumber());

        // Writing to the blockchain
        if(message===""){
          setMessage("Hello ! How are you !")
        }
        // document.getElementsByClassName("input-field").innerHTML="";
        const waveTxn = await wavePortalContract.wave(message, {gasLimit:300000});
        setLoading(false);
        alert("Youre message appear here shortly");
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        await getAllWaves();
        // count = await wavePortalContract.getTotalWaves();
        // console.log("Retrieved total wave count...", count.toNumber());
        
      }
    } catch (error) {
      if(currentAccount === null || currentAccount===""){
        alert("Connect Wallet");
      }
      else{
        alert("Something went wrong ! Try again sometime later.");
      }
       setLoading(false);
      console.log(error);
    }
  }

  const getAllWaves = async() => {
    try{
      
        const RPC = "https://rinkeby.infura.io/v3/b2903e0fea0a41a5b165a940eedab4b2";
        const provider = new ethers.providers.JsonRpcProvider(RPC);
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, provider);

      const waves = await wavePortalContract.getAllWaves();
        
         const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: wave.timestamp,
          message: wave.message,
        };
      });

      setAllWaves(wavesCleaned.reverse());
      
    } catch(e){
      console.log(e);
    }
  }

  function handleChange(event) {
    setMessage(event.target.value);
  }

  const btnName = "Send Message";

  
  useEffect(() => {
    console.log("Hum second");
    checkIfWalletIsConnected();
    getAllWaves();
    
}, []);

  function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min;
  return time;
}
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          Myself Suyash and I am an engineer and a full stack developer !!
        </div>
        <div>
          <textarea className="input-field" onChange={handleChange} placeholder="Write message to me....."></textarea>
        </div>
        <button className="waveButton" onClick={wave}>
          {
            loadingState ? <div className="loader"></div> :btnName
          }
        </button>
        {
          !currentAccount && (
            <button className="btn connect" onClick={connectWallet}>Connect Wallet</button>
          )
        }
        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "#f5f5f5", marginTop: "16px", padding: "8px" }}>
              <div><h5>From: {wave.address}</h5></div>
              <div><h3>Message: {wave.message}</h3></div>
               <div><h6>Time: {timeConverter(wave.timestamp)}</h6></div>
            </div>)
        })}
      </div>
    </div>
  )
}

export default App;